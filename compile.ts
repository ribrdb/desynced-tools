// Copyright 2023 Ryan Brown

import * as ts from "typescript";
import {MethodInfo, methods} from "./methods";
import {Code} from "./ir/code";
import {Arg, Instruction, Label, LiteralValue, RegRef, Stop, StringLiteral, VariableRef,} from "./ir/instruction";
import {generateAsm} from "./decompile/disasm";
import {getDataById} from "./data";
import {CompilerOptions} from "./compiler_options"
export {CompilerOptions}

// Some arbitrary things to use for dynamic jump labels
const dynamicLabels = [
  "v_own_faction",
  "v_ally_faction",
  "v_enemy_faction",
  "v_world_faction",
  "v_bot",
  "v_building",
  "v_is_foundation",
  "v_construction",
  "v_droppeditem",
  "v_resource",
  "v_mineable",
  "v_anomaly",
  "v_valley",
  "v_plateau",
  "v_not_blight",
  "v_blight",
  "v_alien_faction",
  "v_human_faction",
  "v_robot_faction",
  "v_bug_faction",
  "v_solved",
  "v_unsolved",
  "v_can_loot",
  "v_in_powergrid",
  "v_mothership",
  "v_damaged",
  "v_infected",
  "v_broken",
  "v_unpowered",
  "v_emergency",
  "v_powereddown",
  "v_pathblocked",
  "v_idle",
];

function compileFile(f: ts.SourceFile): string {
  const c = new Compiler();
  f.statements.forEach((n) => {
    if (ts.isFunctionDeclaration(n)) {
      let subName = (n.name as ts.Identifier).text;
      if (c.subs.has(subName)) {
        throw new Error("sub ${subName} declared multiple times");
      }
      c.subs.set(subName, n);
    } else {
      throw new Error(`unsupported node ${n.kind} ${ts.SyntaxKind[n.kind]}`);
    }
  });
  for (const sub of c.subs.values()) {
    if (isMainFunction(sub)) {
      c.compileBehavior(sub, true);
    }
  }
  for (const sub of c.subs.values()) {
    if (!isMainFunction(sub)) {
      c.compileBehavior(sub, false);
    }
  }
  return c.asm();
}

interface LoopInfo {
  label?: string;
  cont?: string;
  brk?: string;
  needLabel?: boolean;
}

class VariableScope {
  parent?: VariableScope;
  children: VariableScope[] = [];
  namedVariables = new Map<string, Variable>();
  anonymousVariables: Variable[] = [];

  newScope(): VariableScope {
    let result = new VariableScope();
    result.parent = this;
    this.children.push(result);
    return result;
  }

  has(name: string): boolean {
    return this.namedVariables.has(name) || (this.parent?.has(name) ?? false);
  }

  new(name: string): Variable {
    if (!this.namedVariables.has(name)) {
      this.namedVariables.set(name, new Variable());
    }
    return this.get(name);
  }

  name(name: string, variable: Variable): Variable {
    if (this.namedVariables.has(name)) {
      throw new Error("Name already in use in scope: " + name);
    }

    this.namedVariables.set(name, variable);
    const anonymousIndex = this.anonymousVariables.indexOf(variable);
    if (anonymousIndex > -1) {
      this.anonymousVariables.splice(anonymousIndex, 1);
    }

    return variable;
  }

  get(name: string, reg?: RegRef): Variable {
    if (!this.has(name)) {
      this.namedVariables.set(name, new Variable(reg));
    }
    return this.namedVariables.get(name) || this.parent!.get(name);
  }

  newAnonymousVariable(): Variable {
    let variable = new Variable();
    this.anonymousVariables.push(variable);
    return variable;
  }

  allocate(availables: RegRef[], paramCounter: number): number {
    const currentAvailables = [...availables];
    let newParametersCount = 0;
    const assignVariable = (variable: Variable) => {
      if (variable.reg !== undefined) {
        return;
      }
      if (variable.operations != VariableOperations.All) {
        variable.reg = nilReg;
        return;
      }
      if (currentAvailables.length > 0) {
        variable.reg = currentAvailables.shift()!;
        return;
      }
      // A new parameter is introduced
      variable.reg = new RegRef(paramCounter + ++newParametersCount);
    };
    this.namedVariables.forEach(assignVariable);
    this.anonymousVariables.forEach(assignVariable);
    let chidrenNewParametersCount = 0;
    this.children.forEach((scope) => {
      chidrenNewParametersCount = Math.max(
        chidrenNewParametersCount,
        scope.allocate(currentAvailables, paramCounter + newParametersCount)
      );
    });
    return newParametersCount + chidrenNewParametersCount;
  }
}

class FunctionScope {
  paramCounter = 0;
  program = new Code();
  scope = new VariableScope();
  outputs: Variable[] = [];
  loops: LoopInfo[] = [];

  pendingLabels: string[] = [];

  addOutputParameter() {
    let i = this.paramCounter + 1;
    this.paramCounter++;
    const reg = new RegRef(i);
    this.emit(".pname", reg);
    this.emit(".out", reg);
    this.outputs.push(new Variable(reg));
  }

  withNewVariableScope(f: () => undefined) {
    let scope = this.scope;
    this.scope = this.scope.newScope();
    try {
      f();
    } finally {
      this.scope = scope;
    }
  }

  emitLabel(label: string) {
    this.pendingLabels.push(label);
  }

  emit(name: string, ...args: Arg[]): Instruction {
    const instr = new Instruction(name, args);
    this.rawEmit(instr);
    return instr;
  }

  rawEmit(i: Instruction) {
    if (this.pendingLabels.length > 0) {
      i.labels.push(...this.pendingLabels);
      this.pendingLabels = [];
    }
    this.program.add(i);
  }
}

function isMainFunction(f: ts.FunctionDeclaration): boolean {
  return (
    f.modifiers?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword) || false
  );
}

class Compiler {
  labelCounter = 0;
  dynamicLabelCounter = 0;
  subs = new Map<string, ts.FunctionDeclaration>();
  functionScopes: FunctionScope[] = [];
  currentScope: FunctionScope = new FunctionScope();
  haveBehavior = false;

  constructor() {}

  setupNewScope() {
    this.currentScope = new FunctionScope();
    this.functionScopes.push(this.currentScope);
  }

  compileBehavior(f: ts.FunctionDeclaration, isMain: boolean) {
    let subName = (f.name as ts.Identifier).text;
    if (isMain && this.haveBehavior) {
      throw new Error("only one behavior supported per file");
    }
    this.haveBehavior = isMain;
    this.setupNewScope();
    // TODO: use jsdoc if present
    this.#emitLabel(subName);
    if (!isMain) {
      this.#rawEmit(".sub");
    }
    this.#rawEmit(".name", new StringLiteral(subName));
    this.compileInstructions(f);
  }

  countOutputs(f: ts.FunctionDeclaration): number {
    if (f.type) {
      if (ts.isTypeReferenceNode(f.type)) {
        return 1;
      } else if (ts.isTupleTypeNode(f.type)) {
        return f.type.elements.length;
      } else {
        this.#error(`Unsupported return type.`, f.type);
      }
    }
    return 0;
  }

  compileInstructions(f: ts.FunctionDeclaration) {
    f.parameters.forEach((param, i) => {
      const name = param.name.getText();
      const reg = new RegRef(i+1);
      this.currentScope.paramCounter = i + 1;
      this.#rawEmit(".pname", reg, new StringLiteral(name));
      this.variable(param.name as ts.Identifier, reg);
    });
    let outsCount = this.countOutputs(f);
    for (let outIndex = 0; outIndex < outsCount; outIndex++) {
      this.currentScope.addOutputParameter();
    }
    f.body?.statements.forEach(this.compileStatement.bind(this));
    this.#rawEmit(".ret");
    this.#regAlloc();
  }

  #regAlloc() {
    // TODO: could probably do better dataflow analysis if we used SSA.
    const availables = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
      .split("")
      .map((c) => new RegRef(c));
    let newParameters = this.currentScope.scope.allocate(
      availables,
      this.currentScope.paramCounter
    );
    for (let i = 0; i < newParameters; ++i) {
      let reg = new RegRef(++this.currentScope.paramCounter);
      this.#rawEmit(".pname", reg, new LiteralValue({id:`temp`}));
    }
  }

  comment(txt: string) {
    this.currentScope.program.code[
      this.currentScope.program.code.length - 1
    ].comment = txt;
  }

  compileStatement(n: ts.Statement) {
    if (ts.isExpressionStatement(n)) {
      this.compileExpr(n.expression);
    } else if (ts.isVariableStatement(n)) {
      this.compileVarDecl(n.declarationList);
    } else if (ts.isIfStatement(n)) {
      this.currentScope.withNewVariableScope(() => {
        this.compileIf(n);
      });
    } else if (ts.isReturnStatement(n)) {
      let values: ts.Expression[] = [];
      if (n.expression) {
        if (ts.isArrayLiteralExpression(n.expression)) {
          n.expression.elements.map((el) => {
            values.push(el);
          });
        } else {
          values.push(n.expression);
        }
        while (values.length > this.currentScope.outputs.length) {
          this.currentScope.addOutputParameter();
        }
        values.forEach((value, i) => {
          this.compileExpr(value, this.currentScope.outputs[i]);
        });
      }
      this.#rawEmit(".ret");
    } else if (ts.isBlock(n)) {
      this.currentScope.withNewVariableScope(() => {
        n.statements.forEach(this.compileStatement.bind(this));
      });
    } else if (ts.isSwitchStatement(n)) {
      this.compileSwitch(n);
    } else if (ts.isLabeledStatement(n)) {
      this.currentScope.withNewVariableScope(() => {
        if (ts.isSwitchStatement(n.statement)) {
          this.compileSwitch(n.statement, n.label.text);
        } else if (ts.isForOfStatement(n.statement)) {
          this.compileForOf(n.statement, n.label.text);
        } else if (
          ts.isForStatement(n.statement) ||
          ts.isWhileStatement(n.statement) ||
          ts.isDoStatement(n.statement)
        ) {
          this.compileLoop(n.statement, n.label.text);
        } else {
          const theEnd = this.#label();
          this.#withLoop(
            {
              label: n.label.text,
              brk: theEnd,
              needLabel: true,
            },
            () => {
              this.compileStatement(n.statement);
              this.#emitLabel(theEnd);
            }
          );
        }
      });
    } else if (ts.isBreakOrContinueStatement(n)) {
      let isContinue = n.kind == ts.SyntaxKind.ContinueStatement;
      let info: LoopInfo | undefined;
      for (let i = this.currentScope.loops.length - 1; i >= 0; i--) {
        if (n.label) {
          if (this.currentScope.loops[i].label == n.label.text) {
            info = this.currentScope.loops[i];
            break;
          }
        } else {
          if (isContinue) {
            if (this.currentScope.loops[i].brk) {
              info = this.currentScope.loops[i];
              break;
            }
          } else if (!this.currentScope.loops[i].needLabel) {
            info = this.currentScope.loops[i];
            break;
          }
        }
      }
      if (!info || (isContinue && !info.cont)) {
        this.#error(`${ts.SyntaxKind[n.kind]} not in loop`, n);
      } else {
        if (isContinue) {
          if (info.cont == ".ret") {
            this.#rawEmit(".ret");
          } else if (info.cont) {
            this.#jump(info.cont);
          }
        } else {
          if (info.brk) {
            this.#jump(info.brk);
          } else {
            this.#rawEmit("last");
          }
        }
      }
    } else if (ts.isForOfStatement(n)) {
      this.currentScope.withNewVariableScope(() => {
        this.compileForOf(n);
      });
    } else if (
      ts.isForStatement(n) ||
      ts.isWhileStatement(n) ||
      ts.isDoStatement(n)
    ) {
      this.currentScope.withNewVariableScope(() => {
        this.compileLoop(n);
      });
    } else {
      this.#error(
        `unsupported statement ${n.kind} ${ts.SyntaxKind[n.kind]}`,
        n
      );
    }
  }

  #withLoop(info: LoopInfo, cb: () => void) {
    try {
      this.currentScope.loops.push(info);
      cb();
    } finally {
      this.currentScope.loops.pop();
    }
  }

  compileForOf(n: ts.ForOfStatement, label?: string) {
    if (
      !ts.isCallExpression(n.expression) ||
      !ts.isIdentifier(n.expression.expression)
    ) {
      this.#error("expected function call", n.expression);
    }
    const name = n.expression.expression.text;
    const info = methods[name];
    if (!(info && info.loop)) {
      this.#error("expected loop instruction", n.expression);
    }
    let init = ts.isVariableDeclarationList(n.initializer)
      ? n.initializer.declarations[0].name
      : n.initializer;
    let vars: (Variable | undefined)[] = [];
    if (ts.isIdentifier(init)) {
      vars = [this.variable(init)];
    } else if (ts.isArrayBindingPattern(init)) {
      vars = init.elements.map((el) =>
        ts.isOmittedExpression(el)
          ? undefined
          : this.variable(el.name as ts.Identifier)
      );
    } else {
      this.#error("expected variable", init);
    }
    if (vars.length > 1) {
      if (!Array.isArray(info.out) || vars.length >= info.out.length) {
        this.#error("too many variables", init);
      }
    }
    const loop = this.compileResolvedCall(
      n.expression,
      name,
      undefined,
      [...n.expression.arguments],
      vars
    );
    const body = this.#label();
    const theEnd = this.#label();
    this.#rewriteLabel(loop.exec!.get(true)!, body);
    this.#rewriteLabel(loop.exec!.get(false)!, theEnd);
    // TODO: fix return statement in the body.
    // Maybe emit a nop at the end of the function and jump there?
    this.#withLoop(
      {
        label,
        cont: ".ret",
      },
      () => {
        this.#emitLabel(body);
        this.compileStatement(n.statement);
        this.#rawEmit(".ret");
        this.#emitLabel(theEnd);
      }
    );
  }

  compileLoop(
    n: ts.ForStatement | ts.WhileStatement | ts.DoStatement,
    label?: string
  ) {
    const head = this.#label();
    const body = this.#label();
    const cont = this.#label();
    const brk = this.#label();
    this.#withLoop(
      {
        label,
        cont,
        brk,
      },
      () => {
        if (ts.isForStatement(n) && n.initializer) {
          if (ts.isVariableDeclarationList(n.initializer)) {
            this.compileVarDecl(n.initializer);
          } else {
            this.compileExpr(n.initializer);
          }
        }

        if (ts.isDoStatement(n)) {
          this.#jump(body);
        }
        this.#emitLabel(head);
        let cond = ts.isForStatement(n) ? n.condition : n.expression;
        if (cond) {
          let literal = this.#conditionLiteral(cond);
          if (literal == undefined) {
            const condExpr = this.compileCondition(cond, undefined);
            this.#rewriteLabel(condExpr.ref, body);
            condExpr.variable.exec!.forEach((v) => {
              this.#rewriteLabel(v, brk, true);
            });
          } else if (!literal) {
            this.#jump(brk);
          }
        }
        this.#emitLabel(body);
        this.compileStatement(n.statement);
        this.#emitLabel(cont);
        if (ts.isForStatement(n)) {
          if (n.incrementor) {
            this.compileExpr(n.incrementor);
          }
        }
        this.#jump(head);
        this.#emitLabel(brk);
      }
    );
  }

  isNullOrUndefined(e: ts.Expression): boolean {
    if (ts.isIdentifier(e)) {
      return e.text == "undefined";
    }
    if (ts.isLiteralTypeLiteral(e)) {
      return e.kind == ts.SyntaxKind.NullKeyword;
    }
    return false;
  }

  compileExpr(e: ts.Expression, dest?: Variable): Variable {
    if (ts.isBinaryExpression(e)) {
      switch (e.operatorToken.kind) {
        case ts.SyntaxKind.PlusToken:
        case ts.SyntaxKind.MinusToken:
        case ts.SyntaxKind.AsteriskToken:
        case ts.SyntaxKind.SlashToken:
        case ts.SyntaxKind.PercentToken:
          return this.compileNumOp(e, dest);
        case ts.SyntaxKind.EqualsToken:
          return this.compileAssignment(e as any, dest);
        default:
          if (
            e.operatorToken.kind > ts.SyntaxKind.FirstAssignment &&
            e.operatorToken.kind < ts.SyntaxKind.PercentEqualsToken
          ) {
            return this.compileCompoundAssignment(e, dest);
          }
          this.#error(
            `unsupported binary expression ${e.operatorToken.kind} ${
              ts.SyntaxKind[e.operatorToken.kind]
            }`,
            e
          );
      }
    } else if (ts.isCallExpression(e)) {
      return this.compileCall(e, [dest]);
    } else if (ts.isPropertyAccessExpression(e)) {
      if (ts.isIdentifier(e.name)) {
        return this.compileResolvedCall(
          e,
          e.name.text,
          e.expression,
          [],
          [dest]
        );
      }
    } else if (this.isNullOrUndefined(e)) {
      if (dest) {
        this.#emit(
          methods.setReg,
          nilReg,
          this.ref(dest, VariableOperations.Write)
        );
      } else {
        return new Variable(nilReg);
      }
      return dest;
    } else if (ts.isIdentifier(e)) {
      if (e.text == "self" && !this.currentScope.scope.has(e.text)) {
        const v = this.variable(e);
        this.#emit(methods.getSelf, v);
      }
      if (dest) {
        this.#emit(
          methods.setReg,
          this.variable(e),
          this.ref(dest, VariableOperations.Write)
        );
      }
      return this.variable(e);
    } else if (ts.isNumericLiteral(e)) {
      const value = new LiteralValue({ num: Number(e.text) });
      if (dest) {
        this.#emit(
          methods.setReg,
          value,
          this.ref(dest, VariableOperations.Write)
        );
      } else {
        return new Variable(value);
      }
      return dest;
    } else if (ts.isStringLiteral(e)) {
      const value = new LiteralValue({ id: getDataById(e.text)?.id ?? e.text  });
      if (dest) {
        this.#emit(
          methods.setReg,
          value,
          this.ref(dest, VariableOperations.Write)
        );
      } else {
        return new Variable(value);
      }
      return dest;
    } else if (ts.isArrayLiteralExpression(e)) {
      let arr: number[] = [];
      for(const property of e.elements) {
        const value = this.compileExpr(property);
        if(value.reg?.type !== 'value' || value.reg.value.num == null) {
          this.#error(`unsupported property ${property.kind}`, property);
        }

        arr.push(value.reg.value.num);
      }

      const value = new LiteralValue({
        coord: {
          x: arr[0],
          y: arr[1]
        }
      });
      if (dest) {
        this.#emit(
          methods.setReg,
          value,
          this.ref(dest, VariableOperations.Write)
        );
      } else {
        return new Variable(value);
      }
      return dest;
    } else if (ts.isObjectLiteralExpression(e)) {
      let obj = {};
      for(const property of e.properties) {
        const name = property.name;
        if(!name) {
          this.#error(`property missing name`, property);
        }

        if (ts.isPropertyAssignment(property)) {
          const value = this.compileExpr(property.initializer);
          if(value.reg?.type !== 'value') {
            this.#error(`unsupported property ${property.kind}`, property);
          }

          obj = {
            ...obj,
            ...value.reg.value
          }
        } else {
          this.#error(`unsupported property ${property.kind}`, property);
        }
      }

      const value = new LiteralValue(obj);
      if (dest) {
        this.#emit(
          methods.setReg,
          value,
          this.ref(dest, VariableOperations.Write)
        );
      } else {
        return new Variable(value);
      }
      return dest;
    } else if (ts.isParenthesizedExpression(e)) {
      return this.compileExpr(e.expression, dest);
    } else if (ts.isAsExpression(e)) {
      return this.compileExpr(e.expression, dest);
    } else if (ts.isPrefixUnaryExpression(e)) {
      if(e.operator == ts.SyntaxKind.PlusToken) {
        return this.compileExpr(e.operand, dest);
      } else if (e.operator == ts.SyntaxKind.MinusToken) {
        return this.compileExpr(ts.factory.createBinaryExpression(ts.factory.createNumericLiteral(0), ts.SyntaxKind.MinusToken, e.operand));
      } else {
        this.#error(`unsupported prefix expression ${e.kind} ${ts.SyntaxKind[e.kind]}`, e);
      }
    }
    this.#error(`unsupported expression ${e.kind} ${ts.SyntaxKind[e.kind]}`, e);
  }

  compileCompoundAssignment(e: ts.BinaryExpression, dest?: Variable): Variable {
    let op: ts.SyntaxKind;
    switch (e.operatorToken.kind) {
      case ts.SyntaxKind.PlusEqualsToken:
        op = ts.SyntaxKind.PlusToken;
        break;
      case ts.SyntaxKind.MinusEqualsToken:
        op = ts.SyntaxKind.MinusToken;
        break;
      case ts.SyntaxKind.AsteriskEqualsToken:
        op = ts.SyntaxKind.AsteriskToken;
        break;
      case ts.SyntaxKind.SlashEqualsToken:
        op = ts.SyntaxKind.SlashToken;
        break;
      case ts.SyntaxKind.PercentEqualsToken:
        op = ts.SyntaxKind.PercentToken;
        break;
      default:
        this.#error(
          `unsupported compound assignment ${e.operatorToken.kind} ${
            ts.SyntaxKind[e.operatorToken.kind]
          }`,
          e
        );
    }
    return this.compileAssignment(
      ts.factory.createAssignment(
        e.left,
        ts.factory.createBinaryExpression(e.left, op, e.right)
      ),
      dest
    );
  }

  compileAssignment(
    e: ts.AssignmentExpression<ts.AssignmentOperatorToken>,
    dest?: Variable
  ): Variable {
    if (ts.isIdentifier(e.left)) {
      const lvar = this.variable(e.left);
      this.compileExpr(e.right, lvar);
      if (dest) {
        this.#emit(methods.setReg, lvar, dest);
      } else {
        dest = lvar;
      }
      return dest;
    } else if (ts.isArrayLiteralExpression(e.left)) {
      if (!ts.isCallExpression(e.right)) {
        this.#error("expected function call", e.right);
      }
      const outs = e.left.elements.map((el) => {
        if (ts.isOmittedExpression(el)) {
          return undefined;
        } else if (ts.isIdentifier(el)) {
          return this.variable(el);
        } else {
          this.#error(
            `unsupported array element ${el.kind} ${ts.SyntaxKind[el.kind]}`,
            e
          );
        }
      });
      return this.compileCall(e.right as ts.CallExpression, outs);
    } else if (ts.isPropertyAccessExpression(e.left)) {
      if (
        ts.isIdentifier(e.left.name) &&
        e.left.name.text == "num" /* || e.left.name == "coord"*/
      ) {
        return this.compileAssignment(
          ts.factory.createAssignment(e.left.expression, e.right),
          dest
        );
      }
    }
    this.#error(
      `unsupported assignment to ${e.left.kind} ${ts.SyntaxKind[e.left.kind]}`,
      e
    );
  }

  compileNumOp(e: ts.BinaryExpression, dest?: Variable) {
    const leftArg = this.compileExpr(e.left);
    const rightArg = this.compileExpr(e.right);

    const getNum = (v: Variable) => v.reg?.type === "value" && v.reg.value.num;
    const isNum = (v: unknown): v is number => typeof v === 'number';

    const leftLiteral = getNum(leftArg);
    const rightLiteral = getNum(rightArg);

    literalOp: if (isNum(leftLiteral) && isNum(rightLiteral)) {
      let value: number;
      switch (e.operatorToken.kind) {
        case ts.SyntaxKind.PlusToken:
          value = leftLiteral + rightLiteral;
          break;
        case ts.SyntaxKind.MinusToken:
          value = leftLiteral - rightLiteral;
          break;
        case ts.SyntaxKind.AsteriskToken:
          value = leftLiteral * rightLiteral;
          break;
        case ts.SyntaxKind.SlashToken:
          value = leftLiteral / rightLiteral;
          break;
        case ts.SyntaxKind.PercentToken:
          value = leftLiteral % rightLiteral;
          break;
        default:
          break literalOp;
      }

      if (dest) {
        this.#emit(
            methods.setReg,
            new LiteralValue({num: value}),
            this.ref(dest, VariableOperations.Write)
        );
        return dest;
      } else {
        return new Variable(new LiteralValue({num: value}));
      }
    }

    let name: string;
    switch (e.operatorToken.kind) {
      case ts.SyntaxKind.PlusToken:
        name = "add";
        break;
      case ts.SyntaxKind.MinusToken:
        name = "sub";
        break;
      case ts.SyntaxKind.AsteriskToken:
        name = "mul";
        break;
      case ts.SyntaxKind.SlashToken:
        name = "div";
        break;
      case ts.SyntaxKind.PercentToken:
        name = "modulo";
        break;
      default:
        this.#error(`unsupported binary expression ${e.operatorToken.kind}`, e);
    }
    return this.compileResolvedCall(e, name, undefined, [leftArg, rightArg], [dest]);
  }

  parseBuiltinArg(arg: ts.Expression) {
    const value = this.compileExpr(arg);

    if(value.reg?.type === 'value') {
      const v = value.reg.value;
      if (v.num != null) {
        return v.num;
      } else if (v.id != null) {
        return v.id;
      }
    }

    this.#error(`Unsupported argument type: ${ts.SyntaxKind[arg.kind]}`, arg);
  };

  builtins: Record<string, (e: ts.CallExpression) => LiteralValue> = {
    value: (e) => {
      if (e.arguments.length < 1 || e.arguments.length > 2) {
        this.#error(`Unsupported argument length: ${e.arguments.length}`, e);
      }

      const a = this.parseBuiltinArg(e.arguments[0]);

      if (typeof a !== 'string') {
        this.#error(`Unsupported argument type for argument 1: (${ts.SyntaxKind[e.arguments[0].kind]})`, e.arguments[0]);
      }

      if (e.arguments.length === 1) {
        return new LiteralValue({
          id: getDataById(a)?.id ?? a
        })
      }

      const b = this.parseBuiltinArg(e.arguments[1]);
      if (typeof b !== 'number') {
        this.#error(`Unsupported argument type for argument 2: (${ts.SyntaxKind[e.arguments[1].kind]})`, e.arguments[1]);
      }

      return new LiteralValue({
        id: getDataById(a)?.id ?? a,
        num: b
      });
    },
    coord: (e) => {
      if (e.arguments.length !== 2) {
        this.#error(`Unsupported argument length: ${e.arguments.length}`, e);
      }

      const a = this.parseBuiltinArg(e.arguments[0]);
      const b = this.parseBuiltinArg(e.arguments[1]);

      if (typeof a !== 'number' || typeof b !== 'number') {
        this.#error(`Unsupported argument types: (${ts.SyntaxKind[e.arguments[0].kind]}, ${ts.SyntaxKind[e.arguments[1].kind]})`, e);
      }

      return new LiteralValue({
        coord: {
          x: a,
          y: b
        }
      });
    }
  }

  compileCall(
    e: ts.CallExpression,
    outs: (Variable | undefined)[] = []
  ): Variable {
    let thisArg: ts.Expression | undefined;
    let name: string;
    if (ts.isIdentifier(e.expression)) {
      name = e.expression.text;

      if(name in this.builtins) {
        const value = this.builtins[name](e);

        if (outs[0]) {
          this.#emit(
            methods.setReg,
            value,
            this.ref(outs[0], VariableOperations.Write)
          );

          return outs[0];
        } else {
          return new Variable(value);
        }
      }
    } else if (ts.isPropertyAccessExpression(e.expression)) {
      name = e.expression.name.text;
      thisArg = e.expression.expression;
    } else {
      this.#error(
        `unsupported call ${e.expression.kind} ${
          ts.SyntaxKind[e.expression.kind]
        }`,
        e
      );
    }
    return this.compileResolvedCall(e, name, thisArg, [...e.arguments], outs);
  }

  compileResolvedCall(
      refNode: ts.Node,
      name: string,
      thisArg?: ts.Expression,
      rawArgs?: Array<ts.Expression>,
      outs?: (Variable | undefined)[]
  ): Variable;
  compileResolvedCall(
      refNode: ts.Node,
      name: string,
      thisArg?: Variable,
      rawArgs?: Array<Variable>,
      outs?: (Variable | undefined)[]
  ): Variable;
  compileResolvedCall(
    refNode: ts.Node,
    name: string,
    thisArg?: ts.Expression | Variable,
    rawArgs: Array<ts.Expression | Variable> = [],
    outs: (Variable | undefined)[] = []
  ): Variable {
    let dest = outs[0] || (outs[0] = this.#temp());
    const args: (Arg | Variable)[] = [];
    let info = methods[name];
    if (!info && this.subs.has(name)) {
      let f = this.subs.get(name)!;
      let ins: number[] = [];
      for (let i = 0; i < f.parameters.length; i++) {
        ins.push(i);
      }
      let out: number[] = [];
      for (let i = 0; i < this.countOutputs(f); i++) {
        out.push(f.parameters.length + i);
      }
      info = {
        id: "call",
        in: ins,
        out,
        sub: name,
      };
    }
    if (!info) {
      this.#error(`unknown method ${name}`, refNode);
    }

    const inst = new Instruction(info.id, []);

    const getTxt = (v: ts.Expression | Variable | undefined) => {
      if (v != null && isVar(v)) {
        return v.reg?.type === "value" ? v.reg.value.id : undefined;
      } else if (v != null && ts.isStringLiteral(v)) {
        return v.text;
      } else {
        return undefined;
      }
    }

    const txtArg = info.special == "txt" && getTxt(rawArgs[0]);
    if (txtArg) {
      rawArgs.shift();
    }

    info.in
      ?.filter(v => info.thisArg !== v)
      .forEach((v, i) => {
        const rawArg = rawArgs[i];
        if (isVar(rawArg)) {
          args[v] = rawArg;
        } else if (rawArg) {
          args[v] = this.compileExpr(rawArg);
        } else {
          args[v] = nilReg;
        }
      });
    if (info.thisArg != null) {
      if (
        info.autoSelf &&
        thisArg &&
        !isVar(thisArg) &&
        ts.isIdentifier(thisArg) &&
        thisArg.text == "self"
      ) {
        args[info.thisArg] = nilReg;
      } else if (isVar(thisArg)) {
        args[info.thisArg] = thisArg;
      } else {
        args[info.thisArg] = thisArg ? this.compileExpr(thisArg) : nilReg;
      }
    }
    let outDefs = typeof info.out === "number" ? [info.out] : info.out;
    outDefs?.forEach((v, i) => {
      args[v] = outs[i] || nilReg;
    });

    if (info.exec != null) {
      dest.exec = new Map();
      for (const [e, i] of Object.entries(info.exec)) {
        dest.exec.set(e.match(/^(true|false)$/) ? e == "true" : e, {
          instruction: this.currentScope.program.code.length,
          arg: i,
        });
      }
    }
    for (let i = 0; i < args.length; i++) {
      if (!args[i]) {
        args[i] = nilReg;
      }
    }
    if (txtArg) {
      inst.text = txtArg;
    }
    if (info.c != null) {
      inst.c = info.c;
    }
    if (info.sub) {
      inst.sub = new Label(info.sub);
    }
    this.#emitInstr(inst, outDefs ?? [], args);
    dest.exec?.forEach((ref) => {
      this.#rewrite(ref, undefined);
    });
    return dest;
  }

  compileSwitch(s: ts.SwitchStatement, label?: string) {
    const theEnd = this.#label();
    this.#withLoop(
      {
        label,
        brk: theEnd,
      },
      () => {
        let variable: Variable | undefined;

        if (ts.isIdentifier(s.expression)) {
          variable = this.variable(s.expression);
        } else if (ts.isCallExpression(s.expression)) {
          variable = this.compileCall(s.expression);
        } else if (ts.isPropertyAccessExpression(s.expression)) {
          variable = this.compileResolvedCall(
            s.expression,
            (s.expression.name as ts.Identifier).text,
            s.expression.expression,
            []
          );
        } else {
          this.#compileDynamicJump(s, theEnd);
        }
        if (variable) {
          if (!variable.exec) {
            this.#error(
              "switch statement must use a flow control instruction",
              s
            );
          }
          let hasDefault = false;
          for (const clause of s.caseBlock.clauses) {
            const clauseLabel = this.#label();
            this.#emitLabel(clauseLabel);
            if (ts.isCaseClause(clause)) {
              const key = this.#parseNormalSwitchExpression(clause.expression);
              this.#rewriteLabel(variable.exec.get(key)!, clauseLabel);
            } else {
              hasDefault = true;
              variable.exec.forEach((ref) => {
                this.#rewriteLabel(ref, clauseLabel, true);
              });
            }
            clause.statements.forEach(this.compileStatement, this);
          }

          if(!hasDefault) {
            variable.exec.forEach((ref) => {
              this.#rewriteLabel(ref, theEnd, true);
            });
          }
        }

        this.#emitLabel(theEnd);
      }
    );
  }

  #parseNormalSwitchExpression(e: ts.Expression) {
    if (ts.isStringLiteral(e)) {
      return e.text;
    } else if (e.kind == ts.SyntaxKind.TrueKeyword) {
      return true;
    } else if (e.kind == ts.SyntaxKind.FalseKeyword) {
      return false;
    }
    this.#error(`unsupported case expression ${ts.SyntaxKind[e.kind]}`, e);
  }

  #compileDynamicJump(
    s: ts.SwitchStatement,
    end: string
  ) {
    const cond = this.#temp();
    const labelType = dynamicLabels[this.dynamicLabelCounter++];
    if (!labelType) {
      this.#error("Too many switch statements", s);
    }
    this.#emit(
      methods.setNumber,
      new LiteralValue({ id: labelType }),
      this.ref(this.compileExpr(s.expression), VariableOperations.Read),
      this.ref(cond, VariableOperations.Write)
    );

    const defaultClause = s.caseBlock.clauses.find((clause) =>
      ts.isDefaultClause(clause)
    );
    this.#emit(methods.jump, this.ref(cond, VariableOperations.Read));
    let defaultLabel = defaultClause && this.#label();
    this.#jump(defaultLabel || end);

    for (const clause of s.caseBlock.clauses) {
      if (ts.isCaseClause(clause)) {
        if (!ts.isNumericLiteral(clause.expression)) {
          this.#error(
            `unsupported switch expression ${ts.SyntaxKind[s.expression.kind]}`,
            s
          );
        }
        this.#emit(
          methods.label,
          new LiteralValue({
            id: labelType,
            num: Number(clause.expression.text),
          })
        );
      } else {
        this.#emitLabel(defaultLabel!);
      }
      clause.statements.forEach(this.compileStatement, this);
    }
  }

  compileIf(s: ts.IfStatement, dest?: Variable, parentEnd?: string) {
    if (s.expression.kind === ts.SyntaxKind.TrueKeyword) {
      this.compileStatement(s.thenStatement);
      return;
    } else if (s.expression.kind === ts.SyntaxKind.FalseKeyword) {
      if (s.elseStatement) {
        this.compileStatement(s.elseStatement);
      }
      return;
    }
    const { variable, ref } = this.compileCondition(s.expression, dest);
    const end = parentEnd || this.#label();
    const then = this.#label();
    this.#rewriteLabel(ref, then);
    this.#emitLabel(then);
    this.compileStatement(s.thenStatement);
    this.#jump(end);
    if (s.elseStatement) {
      if (ts.isIfStatement(s.elseStatement)) {
        this.compileIf(s.elseStatement, variable, end);
      } else {
        const elseLabel = this.#label();
        variable.exec?.forEach((v) => {
          this.#rewriteLabel(v, elseLabel, true);
        });
        this.#emitLabel(elseLabel);
        this.compileStatement(s.elseStatement);
        this.#jump(end);
      }
    }
    if (!parentEnd) {
      variable.exec?.forEach((v) => {
        this.#rewriteLabel(v, end, true);
      });
      this.#emitLabel(end);
    }
  }

  #jump(label: string) {
    this.#rawEmit("jump", new Label(label));
  }

  #emitLabel(label: string) {
    this.currentScope.emitLabel(label);
  }

  compileCondition(
    expression: ts.Expression,
    dest: Variable | undefined
  ): { variable: Variable; ref: ArgRef } {
    let variable: Variable;
    let key: string | boolean;
    let extraKey: string | undefined;
    const assertNoDest = () => {
      if (dest) {
        this.#error("else clause does not match condition", expression);
      }
    };
    if (ts.isIdentifier(expression)) {
      variable = this.variable(expression);
      key = true;
    } else if (ts.isCallExpression(expression)) {
      assertNoDest();
      variable = this.compileCall(expression);
      key = true;
    } else if (ts.isPrefixUnaryExpression(expression)) {
      if (expression.operator !== ts.SyntaxKind.ExclamationToken) {
        this.#error("unsupported prefix operator", expression);
      }
      return this.#negate(this.compileCondition(expression.operand, dest));
    } else if (ts.isBinaryExpression(expression)) {
      switch (expression.operatorToken.kind) {
        case ts.SyntaxKind.EqualsToken:
          assertNoDest();
          variable = this.compileExpr(expression);
          key = true;
          break;
        case ts.SyntaxKind.EqualsEqualsEqualsToken:
        case ts.SyntaxKind.EqualsEqualsToken:
          return this.#compileEquality(expression, dest);
        case ts.SyntaxKind.ExclamationEqualsToken:
        case ts.SyntaxKind.ExclamationEqualsEqualsToken:
          return this.#negate(this.#compileEquality(expression, dest));
        case ts.SyntaxKind.LessThanEqualsToken:
          extraKey = "=";
          // fallthrough
        case ts.SyntaxKind.LessThanToken:
          key = "<";
          assertNoDest();
          variable = this.compileResolvedCall(
            expression,
            "checkNumber",
            undefined,
            [getNumeric(expression.left), getNumeric(expression.right)]
          );
          break;
        case ts.SyntaxKind.GreaterThanEqualsToken:
          extraKey = "=";
          // fallthrough
        case ts.SyntaxKind.GreaterThanToken:
          key = ">";
          assertNoDest();
          variable = this.compileResolvedCall(
            expression,
            "checkNumber",
            undefined,
            [getNumeric(expression.left), getNumeric(expression.right)]
          );
          break;
        default:
          this.#error(
            `unsupported condition ${expression.operatorToken.getText()}`,
            expression
          );
      }
    } else {
      this.#error(
        `unsupported condition ${expression.kind} ${
          ts.SyntaxKind[expression.kind]
        }`,
        expression
      );
    }
    let ref = variable.exec!.get(key)!;
    if (extraKey) {
      ref = Object.assign({}, ref, {
        extraArg: variable.exec!.get(extraKey)!.arg,
      });
    }
    return { variable, ref };
  }

  #conditionLiteral(value: ts.Expression) {
    switch (value.kind) {
      case ts.SyntaxKind.TrueKeyword:
        return true;
      case ts.SyntaxKind.FalseKeyword:
      case ts.SyntaxKind.NullKeyword:
      case ts.SyntaxKind.UndefinedKeyword:
        return false;
    }
    if (ts.isNumericLiteral(value)) {
      return Number(value.text) != 0;
    }
    return undefined;
  }

  #compileEquality(
    expression: ts.BinaryExpression,
    dest: Variable | undefined
  ): { variable: Variable; ref: ArgRef } {
    let variable: Variable | undefined;
    let key: string | boolean = true;
    const assertNoDest = () => {
      if (dest) {
        this.#error("else clause does not match condition", expression);
      }
    };
    if (
      expression.operatorToken.kind >= ts.SyntaxKind.EqualsEqualsEqualsToken
    ) {
      if (
        !(
          ts.isLiteralExpression(expression.left) ||
          ts.isLiteralExpression(expression.right)
        )
      ) {
        assertNoDest();
        variable = this.compileResolvedCall(
          expression,
          "compareEntity",
          undefined,
          [expression.left, expression.right]
        );
        return { variable, ref: variable.exec!.get(true)! };
      }
    }
    if (expression.left.kind === ts.SyntaxKind.TrueKeyword) {
      return this.compileCondition(expression.right, dest);
    } else if (expression.right.kind === ts.SyntaxKind.TrueKeyword) {
      return this.compileCondition(expression.left, dest);
    } else if (expression.left.kind === ts.SyntaxKind.FalseKeyword) {
      ({ variable } = this.compileCondition(expression.right, dest));
      key = false;
    } else if (expression.right.kind === ts.SyntaxKind.FalseKeyword) {
      ({ variable } = this.compileCondition(expression.right, dest));
      key = false;
    } else if (isNumeric(expression.left) || isNumeric(expression.right)) {
      assertNoDest();
      variable = this.compileResolvedCall(
        expression,
        "checkNumber",
        undefined,
        [getNumeric(expression.left), getNumeric(expression.right)]
      );
      key = "=";
    } else if (ts.isStringLiteral(expression.left)) {
      variable = dest || this.compileExpr(expression.right);
      key = expression.left.text;
    } else if (ts.isStringLiteral(expression.right)) {
      variable = dest || this.compileExpr(expression.left);
      key = expression.right.text;
    } else {
      assertNoDest();
      variable = this.compileResolvedCall(
        expression,
        "compareEntity",
        undefined,
        [expression.left, expression.right]
      );
    }
    return { variable, ref: variable.exec!.get(key)! };
  }

  #negate({ variable, ref }: { variable: Variable; ref: ArgRef }): {
    variable: Variable;
    ref: ArgRef;
  } {
    const negations: { [key: string]: string } = {
      false: "true",
      true: "false",
      "<=": ">",
      "<": ">=",
      "=": "<>",
      "<>": "=",
      ">=": "<",
      ">": "<=",
    };
    let key1: string | boolean | undefined;
    let key2: string | boolean | undefined;
    variable.exec!.forEach((v, k) => {
      if (v.arg === ref.arg) {
        key1 = k;
      } else if (v.arg === ref.extraArg) {
        key2 = k;
      }
    });
    if (!key1) {
      throw new Error("Invalid ref");
    }
    const negatedKey = negations[`${key1}${key2 || ""}`];
    if (!negatedKey) {
      throw new Error(`cannot negate ${key1}`);
    }
    if (negatedKey.length === 2) {
      ref = Object.assign({}, variable.exec!.get(negatedKey[0])!);
      ref.extraArg = variable.exec!.get(negatedKey[1])!.arg;
      return { variable, ref };
    } else if (negatedKey.length === 1) {
      ref = variable.exec!.get(negatedKey)!;
      return { variable, ref };
    } else {
      ref = variable.exec!.get(JSON.parse(negatedKey))!;
      return { variable, ref };
    }
  }

  #error(msg: string, node: ts.Node): never {
    const lineNum = ts.getLineAndCharacterOfPosition(
      node.getSourceFile(),
      node.getStart()
    );
    const filename = node.getSourceFile().fileName;
    throw new Error(`${filename}:${lineNum.line + 1}: ${msg}`);
  }

  #temp() {
    return this.currentScope.scope.newAnonymousVariable();
  }

  compileVarDecl(s: ts.VariableDeclarationList) {
    s.declarations.forEach((decl: ts.VariableDeclaration) => {
      const isConst = (ts.getCombinedNodeFlags(decl) & ts.NodeFlags.BlockScoped) === ts.NodeFlags.Const;

      if (decl.initializer) {
        if (ts.isIdentifier(decl.name)) {
          if (isConst) {
            const value = this.compileExpr(decl.initializer);
            this.currentScope.scope.name(decl.name.text, this.ref(value, VariableOperations.Write));
          } else {
            this.compileExpr(decl.initializer, this.newVariable(decl.name));
          }
        } else if (ts.isArrayBindingPattern(decl.name)) {
          if (ts.isCallExpression(decl.initializer)) {
            const outs = decl.name.elements.map((el) => {
              if (ts.isOmittedExpression(el)) {
                return undefined;
              } else if (ts.isIdentifier(el.name)) {
                return this.newVariable(el.name);
              } else {
                this.#error(
                  `unsupported array element ${el.kind} ${
                    ts.SyntaxKind[el.kind]
                  }`,
                  decl
                );
              }
            });
            return this.compileCall(decl.initializer, outs);
          } else {
            this.#error(
              "only call expression are valid for array initializer",
              decl
            );
          }
        } else {
          this.#error("Unable to bind object", decl);
        }
      }
    });
  }

  variable(id: ts.Identifier | string, reg?: RegRef): Variable {
    const name = typeof id === "string" ? id : id.text;
    if (name.match(/^(goto|store|visual|signal)$/)) {
      return new Variable(RegRef.parse(name));
    }
    return this.currentScope.scope.get(name, reg);
  }

  newVariable(id: ts.Identifier): Variable {
    return this.currentScope.scope.new(id.text);
  }

  ref(
    varname: string | ts.Identifier | Variable,
    operation: VariableOperations
  ): Variable {
    const v = isVar(varname) ? varname : this.variable(varname);
    v.operations |= operation;
    return v;
  }

  #label() {
    return `l${this.labelCounter++}`;
  }

  #rawEmit(name: string, ...args: Arg[]) {
    this.currentScope.emit(name, ...args);
  }

  #emit(info: MethodInfo, ...args: (Arg | Variable)[]) {
    const name = info.id;
    const inst = new Instruction(name, []);
    const outArgs = typeof info.out == "number" ? [info.out] : info.out;
    return this.#emitInstr(inst, outArgs ?? [], args);
  }

  #emitInstr(inst: Instruction, outArgs: number[], args: (Arg | Variable)[]) {
    const instArgs: Arg[] = args.map((v, i) => {
      if (!(v instanceof Variable)) {
        return v;
      }
      if (inst.op == "call") {
        v = this.ref(v, VariableOperations.All);
      } else if (outArgs.includes(i)) {
        v = this.ref(v, VariableOperations.Write);
      } else {
        v = this.ref(v, VariableOperations.Read);
      }
      return v.reg ?? new VariableRef(v);
    });
    while (instArgs[instArgs.length - 1] == nilReg) {
      instArgs.pop();
    }
    inst.args = instArgs;
    this.currentScope.rawEmit(inst);
  }

  #rewriteLabel(ref: ArgRef, label: string, skipIfSet = false) {
    return this.#rewrite(ref, new Label(label), skipIfSet);
  }

  #rewrite(ref: ArgRef, value: Label | Stop | undefined, skipIfSet = false) {
    if (ref.extraArg) {
      this.#rewrite(
        { instruction: ref.instruction, arg: ref.extraArg },
        value,
        skipIfSet
      );
    }
    const instr = this.currentScope.program.code[ref.instruction];
    if (ref.arg === "next") {
      if (skipIfSet && instr.next != null) {
        return;
      }
      instr.next = value;
      return;
    }
    if (skipIfSet && instr.args[ref.arg] != null) {
      return;
    }
    instr.args[ref.arg] = value;
  }

  program() {
    const finalProg = new Code();
    finalProg.code = this.functionScopes.flatMap((scope) => scope.program.code);
    finalProg.apply(resolveVariables);
    return finalProg;
  }
  asm() {
    const output = generateAsm(this.program());
    return output.join("\n");
  }
}
interface ArgRef {
  instruction: number;
  arg: number | "next";
  extraArg?: number | "next"; // For <= and >=
}
enum VariableOperations {
  None = 0,
  Read = 1 << 0,
  Write = 1 << 1,
  All = ~(~0 << 2),
}
const VariableSymbol = Symbol();
class Variable {
  type = VariableSymbol;
  operations = VariableOperations.None;
  reg?: RegRef | LiteralValue;
  exec?: Map<string | boolean, ArgRef>;

  constructor(reg?: RegRef | LiteralValue) {
    this.reg = reg;
  }
}
function isVar(t: unknown): t is Variable {
  return (t as Variable)?.type === VariableSymbol;
}

function resolveVariables(inst:Instruction) {
  for (let i = 0; i < inst.args.length; i++) {
    let arg = inst.args[i];
    if (arg?.type == "variableRef" && arg.variable instanceof Variable) {
      if (!arg.variable.reg) {
        throw new Error("Variable is used and has not been assigned");
      }
      inst.args[i] = arg.variable.reg;
    }
  }
}

const nilReg = new RegRef(0);

export function compileProgram(program: ts.Program): string {
  // TODO: ended up not using the typechecker. Should probably just parse
  // to reduce bundle size.
  ts.getPreEmitDiagnostics(program).forEach((diagnostic) => {
    if (diagnostic.file) {
      let { line, character } = ts.getLineAndCharacterOfPosition(
        diagnostic.file,
        diagnostic.start!
      );
      let message = ts.flattenDiagnosticMessageText(
        diagnostic.messageText,
        "\n"
      );
      console.log(
        `${diagnostic.file.fileName} (${line + 1},${character + 1}): ${message}`
      );
    } else {
      console.log(
        ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n")
      );
    }
  });
  for (const f of program.getSourceFiles()) {
    if (!f.fileName.endsWith(".d.ts")) {
      f.fileName.substring(0, f.fileName.length - 3);
      try {
        return compileFile(f);
      } catch (ex) {
        console.error(ex);
      }
    }
  }
  throw new Error("No source file found");
}

function isNumeric(e: ts.Expression) {
  return (
    ts.isNumericLiteral(e) ||
    (ts.isPropertyAccessExpression(e) &&
      ts.isIdentifier(e.name) &&
      e.name.text === "num")
  );
}

function getNumeric(e: ts.Expression): ts.Expression {
  if (ts.isPropertyAccessExpression(e) && isNumeric(e)) {
    return e.expression;
  }
  return e;
}

