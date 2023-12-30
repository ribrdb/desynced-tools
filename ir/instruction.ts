export interface LiteralValue {
  num?: number;
  id?: string;
  coord?: { x: number; y: number };
}

export function isLiteralValue(x: unknown): x is LiteralValue {
  return (
    typeof x === "object" &&
    x != null &&
    ((x as LiteralValue).num !== undefined ||
      (x as LiteralValue).id !== undefined ||
      (x as LiteralValue).coord !== undefined)
  );
}

export interface Label {
  label: string;
}

export function parseLabel(x: string): Label {
  if (x.startsWith(":")) {
    return { label: x.substring(1) };
  } else if (x.endsWith(":")) {
    return { label: x.substring(0, x.length - 1) };
  }
  throw new Error(`Invalid label: ${x}`);
}

export function isLabel(x: unknown): x is Label {
  return (
    typeof x === "object" && x != null && typeof (x as Label).label === "string"
  );
}

export interface Stop {
  stop: true;
}

export function isStop(x: unknown): x is Stop {
  return typeof x === "object" && x != null && (x as Stop).stop === true;
}

export interface NodeRef {
  nodeIndex: number;
}

export function isNodeRef(x: unknown): x is NodeRef {
  return (
    typeof x === "object" &&
    x != null &&
    typeof (x as NodeRef).nodeIndex === "number"
  );
}

export interface VarRef {
  varname: string;
}

export function isVarRef(x: unknown): x is VarRef {
  return (
    typeof x === "object" &&
    x != null &&
    typeof (x as VarRef).varname === "string"
  );
}

const regNums = {
  goto: -1,
  store: -2,
  visual: -3,
  signal: -4,
};
const regNames = [, "goto", "store", "visual", "signal"];

export class RegRef {
  constructor(readonly reg: number | string) {
    if (typeof reg === "number") {
      if (reg == 0 || reg < -4) {
        throw new Error(`Invalid register: ${reg}`);
      }
    } else {
      if (!/^[A-Z]$/.test(reg)) {
        throw new Error(`Invalid register: ${reg}`);
      }
    }
  }

  name(): string {
    if (typeof this.reg == "string") {
      return this.reg;
    } else if (this.reg < 0) {
      return regNames[-this.reg]!;
    } else {
      return `p${this.reg}`;
    }
  }

  static parse(x: string): RegRef {
    if (x.startsWith("p")) {
      return new RegRef(Number(x.substring(1)));
    } else if (x in regNums) {
      return new RegRef(regNums[x]);
    } else {
      return new RegRef(x);
    }
  }
}

export function isRegRef(x: unknown): x is RegRef {
  return typeof x === "object" && x != null && (x as RegRef).reg != null;
}

export interface SimpleLiteral {
  literal: string | boolean | number;
}

export function isSimpleLiteral(x: unknown): x is SimpleLiteral {
  return typeof x === "object" && x != null && "literal" in x;
}

export type Arg =
  | LiteralValue
  | Label
  | NodeRef
  | VarRef
  | RegRef
  | Stop
  | SimpleLiteral;

export function parseLuaNodeRef(x: number | false): NodeRef | Stop {
  if (x == false) {
    return { stop: true };
  } else {
    return { nodeIndex: x - 1 };
  }
}

export class Instruction {
  next?: Label | NodeRef | Stop;
  text?: string;
  c?: number;
  sub?: Label | number;
  bp?: unknown;
  comment?: string;
  labels: string[] = [];
  lineno?: number;
  nx?: number;
  ny?: number;

  constructor(readonly op: string, public args: (Arg | undefined)[]) {}

  forArgs(
    indexes: number[] | undefined,
    f: (arg: Arg | undefined, i: number) => void
  ) {
    if (indexes == null) {
      return;
    }
    for (let i = 0; i < indexes.length; i++) {
      const index = indexes[i];
      const arg = this.args[index];
      f(arg, index);
    }
  }
}
