import { gameData } from "../data";
import { DesyncedStringToObject } from "../dsconvert";
import { Code, Pass } from "../ir/code";
import {
  Arg,
  FALSE,
  Instruction,
  Label,
  LiteralValue,
  NodeRef,
  RegRef,
  Stop,
  STOP,
  StringLiteral,
  TRUE,
} from "../ir/instruction";
import { RawBehavior } from "./RawBehavior";
import { RawBlueprint } from "./RawBlueprint";
import { RawInstruction } from "./RawInstruction";
import { instructions } from "./dsinstr";

interface RawValue {
  id?: string;
  num?: number;
  coord?: { x: number; y: number };
}

export class Disassembler {
  program = new Code();
  output: string[] = [];
  mainBehavior?: RawBehavior;
  extraBehaviors: RawBehavior[] = [];
  bps: RawBlueprint[] = [];
  nextLabel = 0;

  pendingLabels: string[] = [];

  constructor(obj: RawBlueprint | RawBehavior) {
    this.#label("main");
    if ("frame" in obj) {
      this.blueprint(obj);
    } else {
      this.mainBehavior = obj;
    }
    this.#doExtras();
  }

  code() {
    if (this.output.length == 0) {
      this.output = generateAsm(this.program);
    }
    return this.output.join("\n");
  }

  blueprint(obj: RawBlueprint) {
    const frame = gameData.frames[obj.frame];

    this.#emit(".blueprint", obj.frame);
    if (obj.name) {
      this.#emit(".name", obj.name);
    }
    if (obj.powered_down) {
      this.#emit(".powered_down");
    }
    if (obj.disconnected ?? frame?.start_disconnected) {
      this.#emit(".disconnected");
    }
    if (obj.logistics) {
      for (const [k, v] of Object.entries(obj.logistics)) {
        this.#emit(`.logistics`, k, v ? TRUE : FALSE);
      }
    }
    if (obj.regs) {
      for (const [k, v] of Object.entries(obj.regs)) {
        this.#emit(
          `.reg`,
          new LiteralValue({ num: Number(k) }),
          new LiteralValue(v),
        );
      }
    }
    obj.locks?.forEach?.(
      (v, i) =>
        typeof v === "string" &&
        this.#emit(
          `.lock`,
          new LiteralValue({ num: i }),
          new LiteralValue({ id: v }),
        ),
    );
    if (obj.links) {
      for (const [k, v] of obj.links) {
        this.#emit(
          `.link`,
          new LiteralValue({ num: k }),
          new LiteralValue({ num: v }),
        );
      }
    }
    if (obj.components) {
      for (const [v, k, code] of obj.components) {
        if (code) {
          this.extraBehaviors.push(code);
          this.#emit(
            `.component`,
            new LiteralValue({ num: k }),
            new LiteralValue({ id: v }),
            new Label(`behavior${this.extraBehaviors.length}`),
          );
        } else {
          this.#emit(
            `.component`,
            new LiteralValue({ num: k }),
            new LiteralValue({ id: v }),
          );
        }
      }
    }
  }

  disasemble(obj: RawBehavior, main = "main", subOffset = 0) {
    if (obj.name) {
      this.#emit(".name", obj.name);
    }
    obj.parameters?.forEach((v, i) => {
      let name = obj.pnames?.[i];
      const reg = new RegRef(i + 1);
      if (name) {
        this.#emit(".pname", reg, name);
      }
      if (v) {
        this.#emit(".out", reg);
      }
    });
    const nodeOffset = this.program.code.length;
    for (let i = 0; `${i}` in obj; i++) {
      this.#emitInstr(obj[`${i}`], nodeOffset, subOffset, main);
    }
    this.program.code[this.program.code.length - 1].next ??= STOP;
  }

  #emitInstr(
    raw: RawInstruction,
    nodeOffset: number,
    subOffset: number,
    main: string,
  ) {
    const args: Arg[] = [];
    const def = instructions[raw.op];

    for (const [k, v] of Object.entries(raw)) {
      const kn = Number(k);
      if (k == `${kn}`) {
        args[kn] = this.#convertOp(v, nodeOffset, def.execArgs?.includes(kn));
      }
    }
    const inst = this.#emit(raw.op, ...args);

    if (raw.cmt) {
      inst.comment = raw.cmt;
    }
    if (raw.op == "call") {
      const sub = raw.sub;
      const subLabel = sub ? `sub${subOffset + sub}` : `${main}`;
      inst.sub = new Label(subLabel);
    }
    if (raw.txt) {
      inst.text = raw.txt;
    } else if (raw.c != null) {
      inst.c = raw.c;
    } else if (raw.bp) {
      inst.bp = new Label(`bp${this.bps.length + 1}`);
      if (typeof raw.bp == "string") {
        raw.bp = DesyncedStringToObject("DSB" + raw.bp) as RawBlueprint;
      }
      this.bps.push(raw.bp);
    }
    if (raw.next != null) {
      inst.next = this.#convertOp(raw.next, nodeOffset, true) as Stop | NodeRef;
    }
    if (raw.nx != null && raw.ny != null) {
      inst.nx = raw.nx;
      inst.ny = raw.ny;
    }
  }

  #convertOp(op: unknown, nodeOffset: number, isExec?: boolean): Arg {
    if (typeof op == "string") {
      if (op.match(/^[A-Z]$/)) {
        return new RegRef(op);
      }
    } else if (typeof op == "number") {
      if (isExec) {
        return new NodeRef(op - 1 + nodeOffset);
      } else {
        return new RegRef(op);
      }
    } else if (op == false) {
      return STOP;
    }
    const rv = op as RawValue;
    return new LiteralValue({
      id: rv.id,
      num: rv.num,
      coord: rv.coord,
    });
  }

  #doExtras() {
    if (this.mainBehavior) {
      this.disasemble(this.mainBehavior);
      this.mainBehavior.subs?.forEach((sub, i) => {
        this.#label(`sub${i + 1}`);
        this.#emit(".sub");
        this.disasemble(sub);
      });
    }

    let subOffset = 0;
    let extraBehaviorIndex = 0;
    let blueprintIndex = 0;

    do {
      for (
        ;
        extraBehaviorIndex < this.extraBehaviors.length;
        extraBehaviorIndex++
      ) {
        const behavior = this.extraBehaviors[extraBehaviorIndex];
        if (!behavior) continue;

        let mainName = `behavior${extraBehaviorIndex + 1}`;

        this.#label(mainName);
        this.#emit(".behavior");
        this.disasemble(behavior, mainName, subOffset);

        behavior.subs?.forEach((sub, i) => {
          this.#label(`sub${i + subOffset + 1}`);
          this.#emit(".sub");
          this.disasemble(sub, mainName, subOffset);
        });

        subOffset += behavior.subs?.length || 0;
      }

      for (; blueprintIndex < this.bps.length; blueprintIndex++) {
        const bp = this.bps[blueprintIndex];
        this.#label(`bp${blueprintIndex + 1}`);
        this.blueprint(bp);
      }
    } while (extraBehaviorIndex < this.extraBehaviors.length);
  }

  #label(label: string) {
    this.pendingLabels.push(label);
  }

  #emit(op: string, ...args: (Arg | string)[]) {
    const convertedArgs = args.map((x) => this.#convert(x));
    const instr = new Instruction(op, convertedArgs);
    if (this.pendingLabels.length > 0) {
      instr.labels = this.pendingLabels;
      this.pendingLabels = [];
    }
    this.program.add(instr);
    return instr;
  }

  #convert(x: Arg | string): Arg {
    if (typeof x === "string") {
      if (x.match(/^[a-zA-Z_]\w*$/)) {
        return new LiteralValue({ id: x });
      } else {
        return new StringLiteral(x);
      }
    }
    return x;
  }
}

export function RenderAssembly(output: string[]): Pass {
  return (instr, ip) => {
    if (ip != 0 && [".behavior", ".sub", ".blueprint"].includes(instr.op)) {
      output.push("");
      output.push("");
    }
    if (instr.comment) {
      output.push("");
      output.push(`; ${instr.comment}`);
    }
    instr.labels?.forEach((label) => {
      output.push(`${label}:`);
    });
    const args = instr.args.map((arg) => renderArg(arg));
    if (instr.bp?.type === "label") {
      args.push(`$bp=:${instr.bp.label}`);
    }
    if (instr.text) {
      args.push(`$txt=${JSON.stringify(instr.text)}`);
    }
    if (instr.sub) {
      args.push(`$sub=:${instr.sub.label}`);
    }
    if (instr.c != null) {
      args.push(`$c=${instr.c}`);
    }
    if (instr.nx != null && instr.ny != null) {
      args.push(`$nx=${instr.nx}`);
      args.push(`$ny=${instr.ny}`);
    }
    output.push(`  ${instr.op}\t${args.join(", ")}`);
    if (instr.next?.type === "label") {
      output.push(`  jump\t:${instr.next.label}`);
    } else if (instr.next?.type === "stop") {
      output.push(`  .ret`);
    } else if (instr.next) {
      throw new Error(`Unexpected next: ${instr.next}`);
    }
  };
}

function renderArg(arg: Arg | undefined): string {
  if (!arg) {
    return "nil";
  }
  switch (arg.type) {
    case "value":
      if (arg.value.id) {
        if (arg.value.coord) {
          throw new Error(`Unexpected coord: ${JSON.stringify(arg)}`);
        }
        if (arg.value.num) {
          return `${arg.value.id}@${arg.value.num}`;
        } else {
          return `${arg.value.id}`;
        }
      } else if (arg.value.coord) {
        if (arg.value.num) {
          throw new Error(`Unexpected num: ${JSON.stringify(arg.value)}`);
        }
        return `${arg.value.coord.x} ${arg.value.coord.y}`;
      }
      return arg.value.num!.toString();
    case "label":
      return `:${arg.label}`;
    case "nodeRef":
      return `:${arg.nodeIndex}`;
    case "stop":
      return "false";
    case "regRef":
      return arg.name();
    case "boolean":
      return arg.value ? "true" : "false";
    case "string":
      return JSON.stringify(arg.value);
  }

  throw new Error(`Unrecognized arg: ${JSON.stringify(arg)}`);
}

function buildLabels(prog: Code) {
  const labels = new Map<number, string>();
  prog.apply((inst, i) => {
    if (inst.next?.type === "nodeRef") {
      if (inst.next.nodeIndex === i + 1) {
        inst.next = undefined;
      } else {
        if (!labels.has(inst.next.nodeIndex)) {
          labels.set(inst.next.nodeIndex, `label${labels.size}`);
        }
        inst.next = new Label(labels.get(inst.next.nodeIndex)!);
      }
    }
    const def = instructions[inst.op];
    inst.forArgs(def?.execArgs, (arg, index) => {
      arg ??= new NodeRef(i + 1); // TODO: should we really emit labels for the next instruction?
      if (arg?.type === "nodeRef") {
        if (!labels.has(arg.nodeIndex)) {
          labels.set(arg.nodeIndex, `label${labels.size}`);
        }
        inst.args[index] = new Label(labels.get(arg.nodeIndex)!);
      }
    });
  });
  prog.apply((inst, i) => {
    if (labels.has(i)) {
      inst.labels.push(labels.get(i)!);
    }
  });
}

export function generateAsm(prog: Code): string[] {
  buildLabels(prog);
  const output: string[] = [];
  prog.apply(RenderAssembly(output));
  return output;
}
