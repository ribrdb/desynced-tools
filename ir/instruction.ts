export class LiteralValue {
  readonly type = "value";
  constructor(
    public value: {
      num?: number;
      id?: string;
      coord?: { x: number; y: number };
    }
  ) {}

  stringValue() {
    return this.value.id;
  }
}

export class Label {
  readonly type = "label";
  constructor(public label: string) {}
}

export class Stop {
  readonly type = "stop";
  constructor() {}
}

export const STOP = new Stop();

export class NodeRef {
  readonly type = "nodeRef";
  constructor(public nodeIndex: number) {}
}

const regNums = {
  nil: 0,
  goto: -1,
  store: -2,
  visual: -3,
  signal: -4,
};
const regNames = ["nil", "goto", "store", "visual", "signal"];

export class RegRef {
  readonly type = "regRef";

  constructor(readonly reg: number | string) {
    if (typeof reg === "number") {
      if (reg < -4) {
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
    } else if (this.reg <= 0) {
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

export class Boolean {
  readonly type = "boolean";
  constructor(public value: boolean) {}
}

export const TRUE = new Boolean(true);
export const FALSE = new Boolean(false);

export class StringLiteral {
  readonly type = "string";
  constructor(public value: string) {}

  stringValue() {
    return this.value;
  }
}

export class ResolvedSub {
  readonly type = "resolvedSub";
  constructor(public index: number) {}
}

export class VariableRef<T=unknown> {
  readonly type = "variableRef";
  constructor(public variable: T) {}
}

export type Arg =
  | LiteralValue
  | Label
  | NodeRef
  | RegRef
  | Stop
  | Boolean
  | StringLiteral
  | VariableRef;

export function isId(
  value: Arg | undefined
): value is LiteralValue & { value: { id: string } } {
  return value?.type == "value" && typeof value.value.id === "string";
}

export function parseLuaNodeRef(x: number | false): NodeRef | Stop {
  if (x == false) {
    return STOP;
  } else {
    return new NodeRef(x - 1);
  }
}

export class Instruction {
  next?: Label | NodeRef | Stop;
  text?: string;
  c?: number;
  sub?: Label;
  resolvedSub?: ResolvedSub;
  bp?: Label;
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
