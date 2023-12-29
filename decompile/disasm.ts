import { RawBehavior } from "./RawBehavior";
import { RawBlueprint } from "./RawBlueprint";
import { RawInstruction } from "./RawInstruction";
import { instructions } from "./dsinstr";
import { DesyncedStringToObject } from "../dsconvert";

export class Disassembler {
  output: string[] = [];
  mainBehavior?: RawBehavior;
  extraBehaviors: RawBehavior[] = [];
  bps: RawBlueprint[] = [];
  nextLabel = 0;

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
        this.#emit(`.logistics`, k, v);
      }
    }
    if (obj.regs) {
      for (const [k, v] of Object.entries(obj.regs)) {
        this.#emit(`.reg`, Number(k), v);
      }
    }
    obj.locks?.forEach?.(
      (v, i) => typeof v === "string" && this.#emit(`.lock`, i, { id: v })
    );
    if (obj.links) {
      for (const [k, v] of obj.links) {
        this.#emit(`.link`, k, v);
      }
    }
    if (obj.components) {
      for (const [v, k, code] of obj.components) {
        if (code) {
          this.extraBehaviors.push(code);
          this.#emit(
            `.component`,
            k,
            { id: v },
            `:behavior${this.extraBehaviors.length}`
          );
        } else {
          this.#emit(`.component`, k, { id: v });
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
      const reg = { id: `p${i + 1}` };
      if (name) {
        this.#emit(".pname", reg, name);
      }
      if (v) {
        this.#emit(".out", reg);
      }
    });
    const labels = this.#buildLabels(obj);
    for (let i = 0; `${i}` in obj; i++) {
      this.#emitInstr(obj[`${i}`], i, labels, subOffset, main);
    }
  }

  #buildLabels(obj: RawBehavior) {
    const labels = new Map<number, string>();
    for (let i = 0; `${i}` in obj; i++) {
      const inst = obj[`${i}`];
      if (inst.next && !labels.has(inst.next)) {
        labels.set(inst.next, `:label${this.nextLabel++}`);
      }
      const def = instructions[inst.op];
      if (def?.execArgs) {
        for (const arg of def.execArgs) {
          const target = inst[arg] ?? i + 2;
          if (target && typeof target == "number" && obj[`${target-1}`]) {
            if (!labels.has(target)) {
              labels.set(target, `:label${this.nextLabel++}`);
            }
            inst[arg] = labels.get(target)!;
          }
        }
      }
    }
    return labels;
  }

  #emitInstr(
    inst: RawInstruction,
    ip: number,
    labels: Map<number, string>,
    subOffset: number,
    main: string
  ) {
    const label = labels.get(ip + 1);
    if (label) this.#label(label.substring(1));
    if (inst.cmt) {
      this.#nl();
      this.#emit(`; ${inst.cmt}`);
    }
    const args: any[] = [];

    for (const [k, v] of Object.entries(inst)) {
      if (k == `${Number(k)}`) {
        args[Number(k)] = this.#convertOp(v);
      }
    }
    if (inst.op == "call") {
      const sub = inst.sub;
      const subLabel = sub ? `:sub${subOffset + sub}` : `:${main}`;
      args.push({id:`$sub=${subLabel}`});
    }
    if (inst.txt) {
      args.push({ id: `$txt=${JSON.stringify(inst.txt)}` });
    } else if (inst.c != null) {
      args.push({ id: `$c=${inst.c}` });
    } else if (inst.bp) {
      if (typeof inst.bp == "string") {
        inst.bp = DesyncedStringToObject("DSB" + inst.bp) as RawBlueprint;
      }
      this.bps.push(inst.bp);
      args.push({ id: `$bp=:bp${this.bps.length}` });
    }
    if (inst.nx != null && inst.ny != null) {
      args.push({id:`$nx=${inst.nx}`});
      args.push({id:`$ny=${inst.ny}`});
    }
    this.#emit(inst.op, ...args);
    if (inst.next == false) {
      this.#emit(".ret");
    } else if (inst.next) {
      this.#emit("jump", labels.get(inst.next)!);
    }
  }

  #convertOp(op: unknown): any {
    if (typeof op == "string") {
      if (op.match(/^[A-Z]$/)) {
        return { id: op };
      }
      return op;
    } else if (typeof op == "number") {
      if (op > 0) {
        return { id: `p${op}` };
      } else {
        switch (-op) {
          case 1:
            return { id: "goto" };
          case 2:
            return { id: "store" };
          case 3:
            return { id: "visual" };
          case 4:
            return { id: "signal" };
        }
      }
    }
    return op;
  }

  #doExtras() {
    if (this.mainBehavior) {
      this.disasemble(this.mainBehavior);
      this.mainBehavior.subs?.forEach((sub, i) => {
        this.#nl(2);
        this.#label(`sub${i + 1}`);
        this.#emit(".sub");
        this.disasemble(sub);
      });
    }

    let subOffset = 0;
    this.extraBehaviors.forEach((behavior, i) => {
      let mainName = `behavior${i + 1}`;

      this.#nl(2);
      this.#label(mainName);
      this.#emit(".behavior");
      this.disasemble(behavior, mainName, subOffset);

      behavior.subs?.forEach((sub, i) => {
        this.#nl(2);
        this.#label(`sub${i + subOffset + 1}`);
        this.#emit(".sub");
        this.disasemble(sub, mainName, subOffset);
      });
      subOffset += behavior.subs?.length || 0;
    });

    this.bps.forEach((bp, i) => {
      this.#nl(2);
      this.#label(`bp${i + 1}`);
      this.blueprint(bp);
    });
  }

  #nl(count = 1) {
    for (let i = 0; i < count; i++) {
      this.output.push("");
    }
  }

  #label(label: string) {
    this.output.push(`${label}:`);
  }

  #emit(op: string, ...args: unknown[]) {
    this.output.push(
      `  ${op}\t${args.map((x) => this.#convert(x)).join(", ")}`
    );
  }

  #convert(x: unknown): string {
    if (typeof x === "string") {
      if (x[0] == ":") {
        return x;
      }
      return JSON.stringify(x);
    } else if (typeof x === "number") {
      return x.toString();
    } else if (typeof x === "boolean") {
      return x ? "true" : "false";
    } else if (x == null) {
      return "nil";
    } else if (typeof x != "object") {
      throw new Error(`Unrecognized type: ${typeof x}`);
    }
    const keys = new Set(Object.keys(x));
    for (const k of keys) {
      if (x[k] == undefined) {
        keys.delete(k);
      }
    }
    if (keys.size == 1) {
      switch (Object.keys(x)[0]) {
        case "id":
          return (x as any).id;
        case "num":
          return (x as any).num.toString();
        case "coord":
          return `${(x as any).coord.x} ${(x as any).coord.y}`;
      }
    } else if (keys.size == 2 && keys.has("id") && keys.has("num")) {
      return `${(x as any).id}@${(x as any).num}`;
    }
    throw new Error(`Unrecognized argument: ${JSON.stringify(x)}`);
  }
}
