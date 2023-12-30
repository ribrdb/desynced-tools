import { RawBehavior } from "./RawBehavior";
import { RawBlueprint } from "./RawBlueprint";
import { RawInstruction } from "./RawInstruction";
import { instructions } from "./dsinstr";
import { DesyncedStringToObject } from "../dsconvert";
import { Pass, Program } from "../ir/program";
import {
  Arg,
  Instruction,
  RegRef,
  isLabel,
  isLiteralValue,
  isNodeRef,
  isRegRef,
  isStop,
  isSimpleLiteral,
  LiteralValue,
  Stop,
  NodeRef,
} from "../ir/instruction";

interface RawValue {
  id?: string;
  num?: number;
  coord?: { x: number; y: number };
}

export class Disassembler {
  program = new Program();
  output: string[] = [];
  mainBehavior?: RawBehavior;
  extraBehaviors: RawBehavior[] = [];
  bps: RawBlueprint[] = [];
  nextLabel = 0;

  pendingLabels: string[] = [];

  constructor(obj: Record<string, unknown>) {
    this.#label("main");
    if ("frame" in obj) {
      this.blueprint(obj as unknown as RawBlueprint);
    } else {
      this.mainBehavior = obj as unknown as RawBehavior;
    }
    this.#doExtras();
  }

  code() {
    if (this.output.length == 0) {
      buildLabels(this.program);
      this.program.apply(RenderAssembly(this.output));
    }
    return this.output.join("\n");
  }

  blueprint(obj: RawBlueprint) {
    this.#emit(".blueprint", obj.frame);
    if (obj.name) {
      this.#emit(".name", obj.name);
    }
    if (obj.powered_down) {
      this.#emit(".powered_down");
    }
    if (obj.disconnected) {
      this.#emit(".disconnected");
    }
    if (obj.logistics) {
      for (const [k, v] of Object.entries(obj.logistics)) {
        this.#emit(`.logistics`, k, { literal: v });
      }
    }
    if (obj.regs) {
      for (const [k, v] of Object.entries(obj.regs)) {
        this.#emit(`.reg`, { num: Number(k) }, v);
      }
    }
    obj.locks?.forEach?.(
      (v, i) =>
        typeof v === "string" && this.#emit(`.lock`, { num: i }, { id: v })
    );
    if (obj.links) {
      for (const [k, v] of obj.links) {
        this.#emit(`.link`, { num: k }, { num: v });
      }
    }
    if (obj.components) {
      for (const [v, k, code] of obj.components) {
        if (code) {
          this.extraBehaviors.push(code);
          this.#emit(
            `.component`,
            { num: k },
            { id: v },
            { label: `behavior${this.extraBehaviors.length}` }
          );
        } else {
          this.#emit(`.component`, { num: k }, { id: v });
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
      this.#emitInstr(obj[`${i}`], i, nodeOffset, subOffset, main);
    }
    this.program.code[this.program.code.length - 1].next ??= { stop: true };
  }

  #emitInstr(
    raw: RawInstruction,
    ip: number,
    nodeOffset,
    subOffset: number,
    main: string
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
      inst.sub = { label: subLabel };
    }
    if (raw.txt) {
      inst.text = raw.txt;
    } else if (raw.c != null) {
      inst.c = raw.c;
    } else if (raw.bp) {
      inst.bp = { label: `bp${this.bps.length}` };
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
        return { nodeIndex: op - 1 +nodeOffset };
      } else {
        return new RegRef(op);
      }
    } else if (op == false) {
      return { stop: true };
    }
    const rv = op as RawValue;
    const v: LiteralValue = {
      id: rv.id,
      num: rv.num,
      coord: rv.coord,
    };
    return v;
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
    this.extraBehaviors.forEach((behavior, i) => {
      let mainName = `behavior${i + 1}`;

      this.#label(mainName);
      this.#emit(".behavior");
      this.disasemble(behavior, mainName, subOffset);

      behavior.subs?.forEach((sub, i) => {
        this.#label(`sub${i + subOffset + 1}`);
        this.#emit(".sub");
        this.disasemble(sub, mainName, subOffset);
      });
      subOffset += behavior.subs?.length || 0;
    });

    this.bps.forEach((bp, i) => {
      this.#label(`bp${i + 1}`);
      this.blueprint(bp);
    });
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
        return { id: x };
      } else {
        return { literal: x };
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
    if (isLabel(instr.bp)) {
      args.push(`$bp=:${instr.bp.label}`);
    }
    if (instr.text) {
      args.push(`$txt=${JSON.stringify(instr.text)}`);
    }
    if (isLabel(instr.sub)) {
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
    if (isLabel(instr.next)) {
      output.push(`  jump\t:${instr.next.label}`);
    } else if (isStop(instr.next)) {
      output.push(`  .ret`);
    } else if (instr.next) {
      throw new Error(`Unexpected next: ${instr.next}`);
    }
  };
}

function renderArg(arg: Arg | undefined): string {
  if (!arg) {
    return "nil";
  } else if (isLiteralValue(arg)) {
    if (arg.id) {
      if (arg.coord) {
        throw new Error(`Unexpected coord: ${JSON.stringify(arg)}`);
      }
      if (arg.num) {
        return `${arg.id}@${arg.num}`;
      } else {
        return `${arg.id}`;
      }
    } else if (arg.coord) {
      if (arg.num) {
        throw new Error(`Unexpected num: ${JSON.stringify(arg)}`);
      }
      return `${arg.coord[0]} ${arg.coord[1]}`;
    }
    return arg.num!.toString();
  } else if (isLabel(arg)) {
    return `:${arg.label}`;
  } else if (isNodeRef(arg)) {
    return `:${arg.nodeIndex}`;
  } else if (isStop(arg)) {
    return `false`;
  } else if (isRegRef(arg)) {
    return arg.name();
  } else if (isSimpleLiteral(arg)) {
    return JSON.stringify(arg.literal);
  }
  throw new Error(`Unrecognized arg: ${JSON.stringify(arg)}`);
}

function buildLabels(prog: Program) {
  const labels = new Map<number, string>();
  prog.apply((inst, i) => {
    if (isNodeRef(inst.next)) {
      if (inst.next.nodeIndex === i + 1) {
        inst.next = undefined;
      } else {
        if (!labels.has(inst.next.nodeIndex)) {
          labels.set(inst.next.nodeIndex, `label${labels.size}`);
        }
        inst.next = { label: labels.get(inst.next.nodeIndex)! };
      }
    }
    const def = instructions[inst.op];
    inst.forArgs(def?.execArgs, (arg, index) => {
      arg ??= { nodeIndex: i + 1 }; // TODO: should we really emit labels for the next instruction?
      if (isNodeRef(arg)) {
        if (!labels.has(arg.nodeIndex)) {
          labels.set(arg.nodeIndex, `label${labels.size}`);
        }
        inst[index] = labels.get(arg.nodeIndex)!;
      }
    });
  });
  prog.apply((inst, i) => {
    if (labels.has(i)) {
      inst.labels.push(labels.get(i)!);
    }
  });
}
