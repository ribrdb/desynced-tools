// Copyright 2023 Ryan Brown

import { instructions } from "./decompile/dsinstr";
import { RawBehavior } from "./decompile/RawBehavior";
import { RawBlueprint } from "./decompile/RawBlueprint";
import { MethodInfo, methods } from "./methods";

interface AsmInstr {
  op: string;
  args: string[];
  outArgs: number[];
  comment?: string;
  labels: string[];
  lineno: number;
  next?: string | false | number;
}

type NamedInstrs = Map<string, AsmInstr[]>;

interface Program {
  mainLabel?: string;
  main: AsmInstr[];
  subs: NamedInstrs;
  others: NamedInstrs; // Other behavriors for use in blueprints
  bps: NamedInstrs;
}

interface SubInfo {
  label: number;
  name: string;
  instructions: AsmInstr[];
}

class LabelInfo {
  returnLabels = new Set<string>();
  labelAliases = new Map<string, string>();

  resolve(label: string): string {
    while (this.labelAliases.has(label)) {
      label = this.labelAliases.get(label)!;
    }
    return label;
  }

  alias(sourceLabel: string, targetLabel: string) {
    this.labelAliases.set(sourceLabel, targetLabel);
  }

  return(label: string) {
    this.returnLabels.add(label);
  }
}

const ops: {
  [key: string]: MethodInfo;
} = {};
for (const op of Object.values(methods)) {
  ops[op.id] = op;
}

const numberLiteralPattern = String.raw`-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?`;
const numberLiteralExactPattern = new RegExp(`^${numberLiteralPattern}$`);
const itemNumPattern = new RegExp(`^(\\w+)@(${numberLiteralPattern})$`);
const coordPattern = new RegExp(
  `^(${numberLiteralPattern})\\s+(${numberLiteralPattern})$`
);
const ipJumpPattern = /^:(\d+)$/;

function parseAssembly(code: string): AsmInstr[] {
  const instructions: AsmInstr[] = [];

  const lines = code.split("\n");
  let comment: string | undefined;
  let labels: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i].trim();
    const strings = new Map<string, string>();
    line = line.replace(
      /"(?:\\(?:["\\\/bfnrt]|u[a-fA-F0-9]{4})|[^"\\\0-\x1F\x7F]+)*"/g,
      (s: string) => {
        let key = `$s${strings.size}`;
        strings.set(key, JSON.parse(s));
        return key;
      }
    );
    const commentStart = line.indexOf(";");
    if (commentStart >= 0) {
      comment = line.substring(commentStart + 1).trim();
      line = line.substring(0, commentStart).trim();
    }
    if (line) {
      const [, op, rest] = line.match(/^(\S+)\s*(.*)$/) ?? [];
      if (op.endsWith(":")) {
        labels.push(op.substring(0, op.length - 1));
        continue;
      }
      const args = rest?.match(/^\s*$/)
        ? []
        : rest?.split(/\s*,\s*/).map((s) => {
            if (s.includes("$s")) {
              strings.forEach((v, k) => {
                s = s.replace(k, v);
              });
            }
            return s;
          }) ?? [];
      const methodInfo = ops[op];
      let outArgs = methodInfo?.out ?? [];
      if (typeof outArgs == "number") {
        outArgs = [outArgs];
      }
      instructions.push({
        op,
        args,
        outArgs,
        comment,
        labels,
        lineno: i + 1,
      });
      comment = undefined;
      labels = [];
    }
  }

  if (comment || labels.length > 0) {
    instructions.push({
      op: ".ret",
      args: [],
      outArgs: [],
      comment,
      labels,
      lineno: -1,
    });
  }
  return instructions;
}

export async function assemble(
  code: string
): Promise<RawBehavior | RawBlueprint> {
  let instructions = parseAssembly(code);
  const mainLabel = instructions[0]?.labels[0];
  const program: Program = {
    mainLabel,
    main: instructions,
    subs: new Map(),
    others: new Map(),
    bps: new Map(),
  };
  for (let i = 0; i < instructions.length; i++) {
    let key: "subs" | "others" | "bps" | undefined;
    switch (instructions[i].op) {
      case ".sub":
        key = "subs";
        break;
      case ".behavior":
        // Ignore a .behavior at the beggining
        if (i == 0) continue;
        key = "others";
        break;
      case ".blueprint":
        if (i == 0) continue;
        key = "bps";
        break;
    }
    if (key) {
      const label =
        instructions[i]?.labels[0] ?? instructions[i + 1]?.labels[0];
      if (!label) {
        throw new Error(
          `No label for ${instructions[i].op} at line ${instructions[i].lineno}`
        );
      }
      instructions = instructions.splice(i, instructions.length - i);
      i = 0;
      const group: NamedInstrs = program[key];
      group.set(label, instructions);
    }
  }

  const assembler = new Assembler(program);

  if (program.main[0]?.op == ".blueprint") {
    return assembler.assembleBlueprint();
  }
  return assembler.assembleBehavior();
}

class Assembler {
  subs: SubInfo[] = [];
  params: boolean[] = []; // true if parameter is modified, false if read only

  constructor(public program: Program) {
    this.subs = findReferencedSubs(program);
  }

  assembleBlueprint(): RawBlueprint {
    const frame = this.program.main[0].args[0];
    if (typeof frame != "string") {
      throw new Error(
        `Blueprint frame must be a string at line ${this.program.main[0].lineno}`
      );
    }
    const bp: RawBlueprint = {
      frame,
    };
    for (let i = 1; i < this.program.main.length; i++) {
      let inst = this.program.main[i];
      switch (inst.op) {
        case ".name":
          bp.name = inst.args[0];
          break;
        case ".powered_down":
          bp.powered_down = inst.args[0] == "true";
          break;
        case ".disconnected":
          bp.disconnected = inst.args[0] == "true";
          break;
        case ".logistics":
          bp.logistics ??= {};
          bp.logistics[inst.args[0]] = inst.args[1] == "true";
          break;
        case ".reg":
          bp.regs ??= {};
          const regNo = inst.args[0];
          const value = this.convertArg(inst.args[1]);
          (bp.regs as any)[regNo] = value;
          break;
        case ".lock":
          bp.locks ??= [];
          const lockNo = Number(inst.args[0]);
          const type = inst.args[1];
          if (type !== "true" && type !== "false") {
            bp.locks[lockNo] = type;
          }
          break;
        case ".link":
          bp.links ??= [];
          bp.links.push([Number(inst.args[0]), Number(inst.args[1])]);
          break;
        case ".component":
          bp.components ??= [];
          const [num, id, code] = inst.args;
          if (typeof code === "string" && code.startsWith(":")) {
            const behavior = this.program.others.get(code.substring(1));
            if (!behavior) {
              throw new Error(
                `Behavior ${code} not found at line ${inst.lineno}`
              );
            }
            const p = new Assembler({
              ...this.program,
              main: behavior,
            }).assembleBehavior();
            bp.components.push([id, Number(num), p]);
          } else {
            bp.components.push([id, Number(num)]);
          }
      }
    }
    if (bp.locks) {
      for (let i = 0; i < bp.locks.length; i++) {
        bp.locks[i] ??= false;
      }
    }
    return bp;
  }

  assembleBehavior(): RawBehavior {
    const main: RawBehavior = this.assembleSub(this.program.main);
    if (this.subs.length) {
      main.subs = this.subs.map((s) => this.assembleSub(s.instructions));
    }
    return main;
  }

  #handlePseudoInstructions(code: AsmInstr[], labelInfo: LabelInfo): RawBehavior {
    const result: RawBehavior = {};
    const replaceJump = (ip: number, target: string | false) => {
      const instr = code[ip];
      if (ip == 0) {
        instr.op = "nop";
        instr.next = target;
        instr.args = [];
      } else {
        code[ip - 1].next = target;
        code.splice(ip, 1);
      }
    };

    for (let i = code.length - 1; i >= 0; i--) {
      let instr = code[i];
      let nextIndex = instr.args.findIndex((v) => {
        let m = v.match(/^\$next=:(\w+)$/);
        if (m) {
          instr.next = m[1];
          return true;
        }
      });
      if (nextIndex >= 0) {
        instr.args.splice(nextIndex, 1);
      }
      if (isPseudoJump(instr)) {
        if (!instr.args[0]) {
          throw new Error(`Invalid jump instruction at line ${instr.lineno}`);
        }
        instr.labels.forEach((l) =>
          labelInfo.alias(l, instr.args[0].substring(1))
        );

        replaceJump(i, instr.args[0].substring(1));
      } else if (instr.op.startsWith(".")) {
        switch (instr.op) {
          case ".ret":
            if (instr.labels.length > 0) {
              instr.labels.forEach((l) => labelInfo.return(l));
            } else {
              replaceJump(i, false);
              continue;
            }
            break;
          case ".sub":
          case ".behavior":
          case ".blueprint":
            break;
          case ".name":
            result.name = instr.args[0];
            break;
          case ".pname": {
            const [reg, name] = instr.args;
            const m = reg.match(/^p(\d)+/);
            if (!m) {
              throw new Error(
                `Unknown parameter register ${reg} at line ${instr.lineno}`
              );
            }
            result.pnames ??= [];
            result.pnames[(m![1] as any) - 1] = name;
            break;
          }
          case ".out": {
            const [reg] = instr.args;
            const m = reg.match(/^p(\d)+/);
            if (!m) {
              throw new Error(
                `Unknown parameter register ${reg} at line ${instr.lineno}`
              );
            }
            result.parameters ??= [];
            result.parameters[(m![1] as any) - 1] = true;
            break;
          }

          default:
            throw new Error(
              `Unknown pseudo instruction ${instr.op} at line ${instr.lineno}`
            );
        }
        if (typeof instr.next == "number") {
              throw new Error(
                `Unexpected type of "instr.next". Labels should not be resolved`
              );
        }
        if (instr.next !== undefined) {
          replaceJump(i, instr.next);
        } else {
          code.splice(i, 1);
        }
      }
    }
    return result;
  }

  #removeNopInstructions(code: AsmInstr[], labelInfo: LabelInfo) {
    if (code.length == 0) {
      return;
    }

    // Makes last instruction a jump to end
    let lastInstr = code[code.length - 1];
    if (lastInstr.next === undefined) {
      lastInstr.next = false;
    }

    // Remove nop instructions from last to first.
    for (let i = code.length - 1; i >= 0; i--) {
      let instr = code[i];
      if (instr.op !== "nop") {
        continue;
      }

      // Remove the nop instruction.
      code.splice(i, 1);

      if (instr.next !== undefined) {
        if (typeof instr.next == "number") {
              throw new Error(
                `Unexpected type of "instr.next". Labels should not be resolved`
              );
        }
        const next: string | false = instr.next;
        // Handle the case when the nop is a jump
        instr.labels.forEach((l) => {
          if (next == false) {
            labelInfo.return(l);
          } else {
            labelInfo.alias(l, next);
          }
        });
        if (i > 0) {
          let prev = code[i-1];
          if (prev.next == undefined) {
            prev.next = next;
          }
        } else {
          // The code starts with a nop that is a jump. Reorder the instructions.
          if (next == false) {
            // The code is actually empty.
            code.length = 0;
            break;
          }
          let target = labelInfo.resolve(next);
          let targetIndex: number | undefined = undefined;
          for (let j = 0; j < code.length; ++j) {
            if (code[j].labels.includes(target)) {
              targetIndex = j;
              break;
            }
          }
          if (targetIndex === undefined) {
            throw new Error(`Unknown label ${target}`);
          }
          // If targetIndex is 0, no reordering is required.
          if (targetIndex != 0) {
            // Reorder code starting at targetIndex
            let prefix = code.splice(0, targetIndex);

            // If the code before targetIndex has no next, then it now requires one
            let newLastInstr = prefix[prefix.length - 1];
            if (newLastInstr.next === undefined) {
              newLastInstr.next = target;
            }
            code.push(... prefix);
          }
        }
      } else if (instr.labels.length > 0) {
        // Handle the case when the nop is a label
        if (i < code.length) {
          // There is an instruction after the nop, move the labels
          let next = code[i];
          next.labels = next.labels || [];
          instr.labels.forEach((l) => {
            next.labels!.push(l);
          });
        } else {
          // There is no instruction after the nop, The labels are return labels.
          instr.labels.forEach((l) => {
            labelInfo.return(l);
          });
        }
      }
      // If the nop is neither a jump nor a label, it can be deleted without
      // any other change.
    }
  }

  #removeDeadCode(code: AsmInstr[], labelInfo: LabelInfo) {
    // Try to remove dead code until there is no more changes.
    let codeIsStable = false;
    while (!codeIsStable) {
      codeIsStable = true;

      // 1. Compute the list of labels that are the target of a jump or an operations
      const accessibleLabels = new Set<string>();
      for (let instr of code) {
        if (typeof instr.next == "string") {
          accessibleLabels.add(labelInfo.resolve(instr.next));
        }
        for (let arg of instr.args) {
          if (arg.startsWith(":")) {
            accessibleLabels.add(labelInfo.resolve(arg.substring(1)));
          }
        }
      }

      // 2. Remove unreachable code only considering accessibleLabels
      for (let i = code.length - 1; i > 0; i--) {
        let instr = code[i];
        let prev = code[i - 1];
        let prevInfo = instructions[prev.op];
        instr.labels = instr.labels.filter((l) => accessibleLabels.has(l));
        if (instr.labels.length > 0) {
          continue;
        }
        if (instr.op === "label") continue;
        if (prev.next !== undefined || prevInfo?.terminates) {
          code.splice(i, 1);
          codeIsStable = false;
        }
      }
    }
  }

  #resolveLabels(code: AsmInstr[], labelInfo: LabelInfo, result: RawBehavior): RawBehavior {
    const labelMap = new Map<string, number | false>();
    // Pass 4 & 5: resolve labels
    for (let i = 0; i < code.length; i++) {
      let instr = code[i];
      instr.labels.forEach((l) => {
        if (!labelMap.has(l)) {
          labelMap.set(l, i + 1);
        }
      });
    }
    labelInfo.returnLabels.forEach((l) => {
      labelMap.set(l, false);
    });
    labelInfo.labelAliases.forEach((v, k) => {
      v = labelInfo.resolve(v);
      if (!labelMap.has(v)) {
        throw new Error(`Unknown label ${v}`);
      }
      labelMap.set(k, labelMap.get(v)!);
    });
    for (let i = 0; i < code.length; i++) {
      let instr = code[i];
      result[i] = {
        op: instr.op,
      };
      if (instr.next != null && instr.next != i + 2) {
        if (typeof instr.next == "string") {
          const resolved = labelMap.get(instr.next);
          if (resolved == null) {
            throw new Error(
              `Unknown label ${instr.next} at line ${instr.lineno}`
            );
          }
          if (resolved != i + 2) {
            result[i].next = resolved;
          }
        } else {
          result[i].next = instr.next;
        }
      }
      if (instr.comment) {
        result[i].cmt = instr.comment;
      }
      instr.args
        .filter((v) => {
          const m = v.match(/^\$(\w+)=(.+)/);
          if (m) {
            result[i][m[1]] = this.convertArg(m[2], m[1]);
            return false;
          }
          return true;
        })
        .map((v) => {
          if (v.startsWith(":")) {
            const resolved = labelMap.get(v.substring(1));
            if (resolved == null) {
              throw new Error(`Unknown label ${v} at line ${instr.lineno}`);
            }
            if (resolved == i + 2) {
              return "nil";
            } else if (typeof resolved == "number") {
              return `:${resolved}`;
            } else {
              return resolved.toString();
            }
          }
          return v;
        })
        .forEach((v, vi) => {
          let arg = this.convertArg(v, undefined, instr.outArgs.includes(vi));
          if (arg != null) {
            result[i][vi] = arg;
          }
        });
    }
    for (let i = 0; i < this.params.length; i++) {
      this.params[i] ??= false;
    }
    result.parameters = this.params;

    return result;
  }

  assembleSub(code: AsmInstr[]): RawBehavior {
    const savedParams = this.params;
    this.params = [];
    try {
      if (code.length == 0 || code[0].op == ".ret") {
        return {};
      }

      let labelInfo = new LabelInfo();

      const result = this.#handlePseudoInstructions(code, labelInfo);
      this.#removeNopInstructions(code, labelInfo);
      this.#removeDeadCode(code, labelInfo);
      return this.#resolveLabels(code, labelInfo, result);

    } finally {
      this.params = savedParams;
    }
  }

  convertArg(a: string, key?: string, write = false) {
    // TODO: coord literal?
    let m: RegExpMatchArray | null;
    if (a == "true") {
      return true;
    } else if (a == "false") {
      return false;
    } else if (a == "nil") {
      return undefined;
    } else if (key == "sub") {
      let subName = a.substring(1);
      if (subName === this.program.mainLabel) {
        return 0;
      }
      return (
        this.subs.find((v) => v.name == subName)?.label ?? undefined
      );
    } else if (key == "txt") {
      return a;
    } else if (key == "bp") {
      const prog = {
        ...this.program,
        main: this.program.bps.get(a.substring(1))!,
      };
      if (!prog.main) {
        throw new Error(`Blueprint ${a} not found.`);
      }
      return new Assembler(prog).assembleBlueprint();
    } else if (key?.match(/^(c|nx|ny)$/)) {
      return Number(a);
    } else if (a == "goto") {
      return -1;
    } else if (a == "store") {
      return -2;
    } else if (a == "visual") {
      return -3;
    } else if (a == "signal") {
      return -4;
    } else if (a.match(/^p\d+$/)) {
      const i = Number(a.substring(1));
      if (write) {
        this.params[i - 1] = true;
      } else {
        this.params[i - 1] ??= false;
      }
      return i;
    } else if (a.match(/^[A-Z]$/)) {
      return a;
    } else if (a.match(numberLiteralExactPattern)) {
      return { num: Number(a) };
    } else if ((m = a.match(itemNumPattern))) {
      return { id: m[1], num: Number(m[2]) };
    } else if ((m = a.match(coordPattern))) {
      return { coord: { x: Number(m[1]), y: Number(m[2]) } };
    } else if ((m = a.match(ipJumpPattern))) {
      return Number(m[1]);
    } else {
      return { id: a };
    }
  }
}

function findReferencedSubs(program: Program): SubInfo[] {
  const result = new Map<string, SubInfo>();
  program.main.forEach((i) => {
    if (i.op == "call") {
      const subArg = i.args.find((a) => a.startsWith("$sub="))?.substring(5);
      if (!subArg) return;
      const subName = subArg.substring(1);
      if (subName === program.mainLabel) {
        // This is a recursive call to the initial function.
        return;
      }
      const sub = program.subs.get(subName);
      if (!sub || !subArg.startsWith(":")) {
        throw new Error(`Sub ${subArg} not found at line ${i.lineno}`);
      }
      if (!result.has(subName)) {
        result.set(subName, {
          name: subName,
          instructions: sub,
          label: result.size + 1,
        });
      }
    }
  });
  return [...result.values()];
}

function isPseudoJump(inst: AsmInstr) {
  return inst.op == "jump" && inst.args[0]?.startsWith(":");
}
