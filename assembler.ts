// Copyright 2023 Ryan Brown

import { instructions } from "./decompile/dsinstr";
import { RawBehavior } from "./decompile/RawBehavior";
import { RawBlueprint } from "./decompile/RawBlueprint";
import { RawInstruction } from "./decompile/RawInstruction";
import {
  Arg,
  Instruction,
  Label,
  RegRef,
  Stop,
  STOP,
  NodeRef,
  isId,
  TRUE,
  FALSE,
  LiteralValue,
  ResolvedSub,
} from "./ir/instruction";
import { Pass, Program, reversePass } from "./ir/program";
import { MethodInfo, methods } from "./methods";

type NamedInstrs = Map<string, Program>;

interface Behavior {
  mainLabel?: string;
  main: Program;
  subs: NamedInstrs;
  others: NamedInstrs; // Other behaviors for use in blueprints
  bps: NamedInstrs;
}

interface SubInfo {
  label: number;
  name: string;
  instructions: Program;
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

function parseAssembly(code: string): Program {
  const prog = new Program();

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
      const args = rest?.match(/^\s*$/) ? [] : rest?.split(/\s*,\s*/) ?? [];

      const inst = new Instruction(op, []);
      inst.comment = comment;
      inst.labels = labels;
      inst.lineno = i + 1;
      prog.add(inst);

      const methodInfo = ops[op];
      rest?.split(/\s*,\s*/).forEach((arg) => {
        const value = parseArg(inst, arg, methodInfo, strings);
      });

      comment = undefined;
      labels = [];
    }
  }

  if (comment || labels.length > 0) {
    const inst = new Instruction(".ret", []);
    inst.comment = comment;
    inst.labels = labels;
    prog.add(inst);
  }
  return prog;
}

export async function assemble(
  code: string
): Promise<RawBehavior | RawBlueprint> {
  let instructions = parseAssembly(code);
  const program: Behavior = splitProgram(instructions);

  const assembler = new Assembler(program);

  if (program.main[0]?.op == ".blueprint") {
    return assembler.assembleBlueprint();
  }
  return assembler.assembleBehavior();
}

class Assembler {
  subs: SubInfo[] = [];
  params: boolean[] = []; // true if parameter is modified, false if read only

  constructor(public program: Behavior) {
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
    this.program.main.apply((inst, i) => {
      switch (inst.op) {
        case ".name":
          bp.name = string(inst, inst.args[0]!);
          break;
        case ".powered_down":
          bp.powered_down = bool(inst.args[0]);
          break;
        case ".disconnected":
          bp.disconnected = bool(inst.args[0]);
          break;
        case ".logistics":
          bp.logistics ??= {};
          bp.logistics[string(inst, inst.args[0])] = bool(inst.args[1]);
          break;
        case ".reg":
          bp.regs ??= {};
          const regNo = num(inst, inst.args[0]);
          if (inst.args[1]?.type !== "value") {
            throw new Error(
              `Register value must be a value at line ${inst.lineno}`
            );
          }
          bp.regs[regNo] = inst.args[1].value;
          break;
        case ".lock":
          bp.locks ??= [];
          const lockNo = num(inst, inst.args[0]);
          const type = inst.args[1];
          if (type?.type === "string" || type?.type === "boolean") {
            bp.locks[lockNo] = type.value;
          } else if (isId(type)) {
            bp.locks[lockNo] = type.value.id!;
          }
          break;
        case ".link":
          bp.links ??= [];
          bp.links.push([num(inst, inst.args[0]), num(inst, inst.args[1])]);
          break;
        case ".component": {
          bp.components ??= [];
          const [index, id, code] = inst.args;
          const ctype = string(inst, id);
          if (code?.type === "label") {
            const behavior = this.program.others.get(code.label);
            if (!behavior) {
              throw new Error(
                `Behavior ${code.label} not found at line ${inst.lineno}`
              );
            }
            const p = new Assembler({
              ...this.program,
              main: behavior,
            }).assembleBehavior();
            bp.components.push([ctype, num(inst, index), p]);
          } else {
            bp.components.push([ctype, num(inst, index)]);
          }
        }
      }
    });
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

  assembleSub(prog: Program): RawBehavior {
    const code = prog.code;
    const savedParams = this.params;
    this.params = [];
    try {
      if (code.length == 0 || code[0].op == ".ret") {
        return {};
      }

      let labelInfo = new LabelInfo();

      const result: RawBehavior = {};

      prog.apply(pseudoPass(result, labelInfo));
      prog.apply(removeNopPass(labelInfo));
      removeDeadCode(prog, labelInfo);

      const resolver = resolveLabelsPass(prog, {
        behavior: result,
        labelInfo,
        resolveSub: this.resolveSub.bind(this),
        resolveBp: this.resolveBp.bind(this),
      });
      prog.apply(resolver);

      for (let i = 0; i < this.params.length; i++) {
        this.params[i] ??= false;
      }
      result.parameters = this.params;

      return result;
    } finally {
      this.params = savedParams;
    }
  }

  resolveSub(subName: string) {
    if (subName === this.program.mainLabel) {
      return new ResolvedSub(0);
    }
    const sub = this.subs.find((v) => v.name == subName);
    if (sub) {
      return new ResolvedSub(sub.label);
    }
  }

  resolveBp(bpName: string) {
    const prog = {
      ...this.program,
      main: this.program.bps.get(bpName)!,
    };
    if (!prog.main) {
      throw new Error(`Blueprint ${bpName} not found.`);
    }
    return new Assembler(prog).assembleBlueprint();
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
    } else {
      return { id: a };
    }
  }
}

function findReferencedSubs(program: Behavior): SubInfo[] {
  const result = new Map<string, SubInfo>();
  program.main.apply((inst) => {
    if (inst.op == "call") {
      const subName = inst.sub?.type === "label" && inst.sub.label;
      if (!subName) return;
      if (subName === program.mainLabel) {
        // This is a recursive call to the initial function.
        return;
      }
      const sub = program.subs.get(subName);
      if (!sub) {
        throw new Error(`Sub ${subName} not found at line ${inst.lineno}`);
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

function isPseudoJump(inst: Instruction) {
  return inst.op == "jump" && inst.args[0]?.type === "label";
}

function parseArg(
  inst: Instruction,
  arg: string,
  methodInfo: MethodInfo | undefined,
  strings: Map<string, string>,
  skipPush = false
): Arg | undefined {
  arg = arg.trim();
  let keyMatch = arg.match(/^\$(sub|txt|c|nx|ny|bp|next)=(.+)/);
  if (keyMatch) {
    const key = keyMatch[1];
    const value = parseArg(inst, keyMatch[2], methodInfo, strings, true);
    key;
    setKey(inst, key, value!);
    return value;
  }
  let result: Arg | undefined;
  let m: RegExpMatchArray | null;
  try {
    result = RegRef.parse(arg);
  } catch {}
  if (result) {
  } else if (arg.startsWith(":")) {
    result = new Label(arg.substring(1));
  } else if (arg === "nil") {
    result = undefined;
  } else if (arg === "true") {
    if (!inst.op.startsWith(".")) {
      throw new Error(`Invalid boolean arg at line ${inst.lineno}`);
    }
    result = TRUE;
  } else if (arg === "false") {
    if (inst.op.startsWith(".")) {
      return FALSE;
    } else {
      return STOP;
    }
  } else if (arg.match(numberLiteralExactPattern)) {
    result = new LiteralValue({ num: Number(arg) });
  } else if ((m = arg.match(itemNumPattern))) {
    result = new LiteralValue({ id: m[1], num: Number(m[2]) });
  } else if ((m = arg.match(coordPattern))) {
    result = new LiteralValue({ coord: { x: Number(m[1]), y: Number(m[2]) } });
  } else if (arg) {
    if (strings.has(arg)) {
      arg = strings.get(arg)!;
    }
    result = new LiteralValue({ id: arg });
  }
  if (!skipPush) {
    inst.args.push(result);
  }
  return result;
}

function setKey(inst: Instruction, key: string, value: Arg) {
  switch (key) {
    case "sub":
    case "bp":
    case "next":
      if (value.type !== "label") {
        throw new Error(
          `Invalid ${key}: ${JSON.stringify(value)} at line ${inst.lineno}`
        );
      }
      inst[key] = value;
      return;
    case "txt":
      if (isId(value) || value.type === "string") {
        inst.text = value.stringValue();
        return;
      }
      throw new Error(
        `Invalid txt: ${JSON.stringify(value)} at line ${inst.lineno}`
      );
    case "c":
      if (value.type === "value" && value.value.num != null) {
        inst.c = value.value.num;
        return;
      }
      throw new Error(
        `Invalid c: ${JSON.stringify(value)} at line ${inst.lineno}`
      );
    case "nx":
    case "ny":
      if (value.type === "value" && value.value.num != null) {
        inst[key] = value.value.num;
        return;
      }
  }
  throw new Error(
    `Invalid ${key}: ${JSON.stringify(value)} at line ${inst.lineno}`
  );
}

function splitProgram(prog: Program): Behavior {
  const result: Behavior = {
    mainLabel: prog.code[0]?.labels[0],
    main: prog,
    subs: new Map(),
    bps: new Map(),
    others: new Map(),
  };
  const splitter: Pass = (instr, i) => {
    let key: "subs" | "others" | "bps" | undefined;
    if (i == 0) return;
    switch (instr.op) {
      case ".sub":
        key = "subs";
        break;
      case ".behavior":
        key = "others";
        break;
      case ".blueprint":
        key = "bps";
        break;
    }
    if (key) {
      const newCode = prog.code.splice(i);
      const newProg = new Program();
      newProg.code = newCode;
      const label = instr.labels[0] ?? newCode[1]?.labels[0];
      if (!label) {
        throw new Error(`No label for ${instr.op} at line ${instr.lineno}`);
      }
      const group: NamedInstrs = result[key];
      group.set(label, newProg);
    }
  };
  splitter.reverse = true;
  prog.apply(splitter);
  return result;
}

function string(inst: Instruction, a: Arg | undefined) {
  if (isId(a) || a?.type === "string") {
    return a.stringValue()!;
  }
  throw new Error(
    `Expected string: ${JSON.stringify(a)} at line ${inst.lineno}`
  );
}

function num(inst: Instruction, a: Arg | undefined): number {
  if (a?.type === "value" && a.value.num != null) {
    return a.value.num;
  }
  throw new Error(
    `Expected number: ${JSON.stringify(a)} at line ${inst.lineno}`
  );
}

function bool(a: Arg | undefined) {
  return a?.type === "boolean" && a.value;
}

function pseudoPass(behavior: RawBehavior, labelInfo: LabelInfo): Pass {
  const pass: Pass = (instr, i, prog) => {
    if (isPseudoJump(instr)) {
      if (!instr.args[0]) {
        throw new Error(`Invalid jump instruction at line ${instr.lineno}`);
      }
      const label = instr.args[0] as Label;
      instr.labels.forEach((l) => labelInfo.alias(l, label.label));

      replaceJump(prog, i, label);
    } else if (instr.op.startsWith(".")) {
      switch (instr.op) {
        case ".ret":
          if (instr.labels.length > 0) {
            instr.labels.forEach((l) => labelInfo.return(l));
          } else {
            replaceJump(prog, i, STOP);
            return;
          }
          break;
        case ".sub":
        case ".behavior":
        case ".blueprint":
          break;
        case ".name":
          behavior.name = string(instr, instr.args[0]);
          break;
        case ".pname": {
          const [reg, name] = instr.args;
          if (
            reg?.type !== "regRef" ||
            typeof reg.reg === "string" ||
            reg.reg < 1
          ) {
            throw new Error(
              `Unknown parameter register ${reg} at line ${instr.lineno}`
            );
          }
          behavior.pnames ??= [];
          behavior.pnames[reg.reg - 1] = string(instr, name);
          break;
        }
        case ".out": {
          const [reg] = instr.args;
          if (
            reg?.type !== "regRef" ||
            typeof reg.reg === "string" ||
            reg.reg < 1
          ) {
            throw new Error(
              `Unknown parameter register ${reg} at line ${instr.lineno}`
            );
          }
          behavior.parameters ??= [];
          behavior.parameters[reg.reg - 1] = true;
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
        replaceJump(prog, i, instr.next);
      } else {
        prog.code.splice(i, 1);
      }
    }
  };
  pass.reverse = true;

  return pass;
}

function replaceJump(
  prog: Program,
  ip: number,
  target: Label | Stop | NodeRef
) {
  if (target.type === "nodeRef") {
    throw new Error(
      `Unexpected type of "target". Labels should not be resolved`
    );
  }
  if (ip == 0) {
    prog.code[0] = new Instruction("nop", []);
    prog.code[0].next = target;
  } else {
    prog.code[ip - 1].next = target;
    prog.code.splice(ip, 1);
  }
}

function removeNopPass(labelInfo: LabelInfo): Pass {
  let isLastInstr = true;
  const pass: Pass = (instr, i, prog) => {
    if (isLastInstr) {
      isLastInstr = false;
      instr.next ??= STOP;
    }
    if (instr.op !== "nop") {
      return;
    }

    // Remove the nop instruction.
    prog.code.splice(i, 1);

    if (instr.next !== undefined) {
      if (instr.next.type === "nodeRef") {
        throw new Error(
          `Unexpected type of "instr.next". Labels should not be resolved`
        );
      }
      const next: Label | Stop = instr.next;
      // Handle the case when the nop is a jump
      instr.labels.forEach((l) => {
        if (next.type === "stop") {
          labelInfo.return(l);
        } else {
          labelInfo.alias(l, next.label);
        }
      });
      if (i > 0) {
        let prev = prog.code[i - 1];
        if (prev.next == undefined) {
          prev.next = next;
        }
      } else {
        // The code starts with a nop that is a jump. Reorder the instructions.
        if (next.type === "stop") {
          // The code is actually empty.
          prog.code.length = 0;
          return;
        }
        let target = labelInfo.resolve(next.label);
        let targetIndex: number | undefined = undefined;
        for (let j = 0; j < prog.code.length; ++j) {
          if (prog.code[j].labels.includes(target)) {
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
          let prefix = prog.code.splice(0, targetIndex);

          // If the code before targetIndex has no next, then it now requires one
          let newLastInstr = prefix[prefix.length - 1];
          if (newLastInstr.next === undefined) {
            newLastInstr.next = new Label(target);
          }
          prog.code.push(...prefix);
        }
      }
    } else if (instr.labels.length > 0) {
      // Handle the case when the nop is a label
      if (i < prog.code.length) {
        // There is an instruction after the nop, move the labels
        let next = prog.code[i];
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
  };
  pass.reverse = true;
  return pass;
}

function removeDeadCode(code: Program, labelInfo: LabelInfo) {
  // Try to remove dead code until there is no more changes.
  let codeIsStable = false;
  while (!codeIsStable) {
    codeIsStable = true;

    // 1. Compute the list of labels that are the target of a jump or an operations
    const accessibleLabels = new Set<string>();
    code.apply((instr) => {
      if (instr.next?.type === "label") {
        accessibleLabels.add(labelInfo.resolve(instr.next.label));
      }
      instr.args.forEach((arg) => {
        if (arg?.type === "label") {
          accessibleLabels.add(labelInfo.resolve(arg.label));
        }
      });
    });

    // 2. Remove unreachable code only considering accessibleLabels
    code.apply(
      reversePass((instr, i) => {
        if (i == 0) return;
        let prev = code.code[i - 1];
        let prevInfo = instructions[prev.op];
        instr.labels = instr.labels.filter((l) => accessibleLabels.has(l));
        if (instr.labels.length > 0) {
          return;
        }
        if (instr.op === "label") return;
        if (prev.next !== undefined || prevInfo?.terminates) {
          code.code.splice(i, 1);
          codeIsStable = false;
        }
      })
    );
  }
}

function resolveLabelsPass(
  code: Program,
  {
    labelInfo,
    behavior,
    resolveBp,
    resolveSub,
  }: {
    labelInfo: LabelInfo;
    behavior: RawBehavior;
    resolveBp: (string) => RawBlueprint | undefined;
    resolveSub: (string) => ResolvedSub | undefined;
  }
): Pass {
  const labelMap = new Map<string, number | false>();
  code.apply((instr, i) => {
    instr.labels.forEach((l) => {
      if (!labelMap.has(l)) {
        labelMap.set(l, i + 1);
      }
    });
  });

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

  return (instr, i) => {
    behavior[i] = {
      op: instr.op,
    };
    if (instr.next != null) {
      if (instr.next.type === "label") {
        const resolved = labelMap.get(instr.next.label);
        if (resolved == null) {
          throw new Error(
            `Unknown label ${instr.next} at line ${instr.lineno}`
          );
        }
        if (resolved != i + 2) {
          behavior[i].next = resolved;
        }
      } else if (instr.next.type === "nodeRef") {
        if (instr.next.nodeIndex === i + 1) {
          behavior[i].next = undefined;
        } else {
          behavior[i].next = instr.next.nodeIndex;
        }
      } else {
        behavior[i].next = false;
      }
    }
    addSpecialOptions(instr, behavior[i], resolveSub, resolveBp);
    instr.args.forEach((v, vi) => {
      let value: any;
      switch (v?.type) {
        case null:
        case undefined:
          value = undefined;
          break;
        case "label": {
          const resolved = labelMap.get(labelInfo.resolve(v.label));
          if (resolved == null) {
            throw new Error(`Unknown label ${v.label} at line ${instr.lineno}`);
          }
          if (resolved == false) {
            value = false;
          } else if (resolved !== i + 2) {
            value = resolved;
          }
          break;
        }
        case "stop":
          value = false;
          break;
        case "nodeRef":
          value = v.nodeIndex;
          break;
        case "value":
        case "boolean":
        case "string":
          value = v.value;
          break;
        case "regRef":
          value = v.reg;
          break;
        default:
          throw new Error(`Unrecognized arg: ${JSON.stringify(v)}`);
      }

      if (value != null) {
        behavior[i][vi] = value;
      }
    });
  };
}

function addSpecialOptions(
  instr: Instruction,
  ds: RawInstruction,
  resolveSub: (string) => ResolvedSub | undefined,
  resolveBp: (string) => RawBlueprint | undefined
) {
  if (instr.comment) {
    ds.cmt = instr.comment;
  }
  if (instr.text) {
    ds.txt = instr.text;
  }
  if (instr.sub) {
    if (instr.sub.type === "label") {
      instr.sub = resolveSub(instr.sub.label);
    }
    ds.sub = instr.sub?.index;
  }
  if (instr.bp) {
    if (instr.bp.type === "label") {
      ds.bp = resolveBp(instr.bp.label);
    }
  }
  if (instr.c != null) {
    ds.c = instr.c;
  }
  if (instr.nx != null && instr.ny != null) {
    ds.nx = instr.nx;
    ds.ny = instr.ny;
  }
}
