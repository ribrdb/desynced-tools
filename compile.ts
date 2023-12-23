// Copyright 2023 Ryan Brown

import * as ts from "typescript";
import { MethodInfo, methods } from "./methods";

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

function compileFile(f: ts.SourceFile, typeChecker: ts.TypeChecker): string {
  const c = new Compiler(typeChecker);
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

class FunctionScope {
  regCounter = 0;
  tempCounter = 0;
  paramCounter = 0;
  instructions: Instruction[] = [];
  scope = new Map<string, Variable>();
  outputs: Variable[] = [];
  haveBehavior = false;
  loops: LoopInfo[] = [];

  addOutputParameter() {
    let outIndex = this.outputs.length;
    let i = this.paramCounter + 1;
    this.paramCounter++;
    const reg = `p${i}`;
    this.rawEmit(".pname", reg);
    this.rawEmit(".out", reg);
    this.outputs.push({
      name: `out${outIndex}`,
      reg,
      refs: [],
    });
  }

  rawEmit(name: string, ...args: string[]) {
    this.instructions.push({ name, args: args });
  }

}

function isMainFunction(f: ts.FunctionDeclaration): boolean {
  return f.modifiers?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword) || false;
}

class Compiler {
  labelCounter = 0;
  dynamicLabelCounter = 0;
  subs = new Map<string, ts.FunctionDeclaration>();
  functionScopes: FunctionScope[] = [];
  currentScope: FunctionScope = new FunctionScope();
  haveBehavior = false;

  constructor(private typeChecker: ts.TypeChecker) {}

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
    this.#rawEmit(".name", JSON.stringify(subName));
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
      const reg = `p${i + 1}`;
      this.currentScope.paramCounter = i + 1;
      this.#rawEmit(".pname", reg, name);
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
    const available = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
    const vars: Liveness[] = [];
    for (const v of this.currentScope.scope.values()) {
      if (/^(p\d+|signal|visual|store|goto)$/.test(v.reg)) {
        continue;
      }
      const l: Liveness = {
        name: v.name,
        start: 0,
        end: 0,
        refs: [...v.refs],
        reg: "",
      };
      l.refs.sort((a, b) => a.instruction - b.instruction);
      while (l.refs[l.refs.length - 1]?.dir == "w") {
        const ref = l.refs.pop()!;
        this.#rewrite(ref, "nil");
      }
      if (l.refs.length == 0) {
        continue;
      }
      if (l.refs.length == 1 && l.refs[0].dir != "rw") {
        continue;
      }

      l.start = l.refs[0].instruction;
      l.end = l.refs[l.refs.length - 1].instruction;
      vars.push(l);
    }
    vars.sort((a, b) => a.start - b.start);
    let live: Liveness[] = [];
    for (let i = 0; i < this.currentScope.instructions.length; i++) {
      while (vars[0]?.start == i) {
        const v = vars.shift()!;
        if (available.length == 0) {
          available.push(`p${++this.currentScope.paramCounter}`);
          this.#rawEmit(
            ".pname",
            available[0],
            JSON.stringify(`temp (${v.name})`)
          );
        }
        v.reg = available.shift()!;
        v.refs.forEach((ref) => this.#rewrite(ref, v.reg));
        live.push(v!);
      }
      live = live.filter(
        (v) => v.end >= i || (available.unshift(v.reg), false)
      );
      if (live.length + vars.length == 0) {
        break;
      }
    }
  }

  comment(txt: string) {
    this.currentScope.instructions[this.currentScope.instructions.length - 1].comment = txt;
  }

  compileStatement(n: ts.Statement) {
    if (ts.isExpressionStatement(n)) {
      this.compileExpr(n.expression);
    } else if (ts.isVariableStatement(n)) {
      this.compileVarDecl(n.declarationList);
    } else if (ts.isIfStatement(n)) {
      this.compileIf(n);
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
      n.statements.forEach(this.compileStatement.bind(this));
    } else if (ts.isSwitchStatement(n)) {
      this.compileSwitch(n);
    } else if (ts.isLabeledStatement(n)) {
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
      this.compileForOf(n);
    } else if (
      ts.isForStatement(n) ||
      ts.isWhileStatement(n) ||
      ts.isDoStatement(n)
    ) {
      this.compileLoop(n);
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
          if (ts.isIdentifier(e.left)) {
            const lvar = this.variable(e.left);
            this.compileExpr(e.right, lvar);
            if (dest) {
              this.#emit(methods.setReg, lvar, dest);
              dest.refs.push({
                instruction: this.currentScope.instructions.length,
                arg: 0,
                dir: "w",
              });
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
                  `unsupported array element ${el.kind} ${
                    ts.SyntaxKind[el.kind]
                  }`,
                  e
                );
              }
            });
            return this.compileCall(e.right as ts.CallExpression, outs);
          } else {
            this.#error(
              `unsupported assignment to ${e.left.kind} ${
                ts.SyntaxKind[e.left.kind]
              }`,
              e
            );
          }
        default:
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
        if (e.name.text === "num") {
          return this.compileExpr(e.expression, dest);
        } else {
          return this.compileResolvedCall(
            e,
            e.name.text,
            e.expression,
            [],
            [dest]
          );
        }
      }
    } else if (ts.isIdentifier(e)) {
      if (e.text == "self" && !this.currentScope.scope.has(e.text)) {
        const v = this.variable(e);
        this.#emit(methods.getSelf, v);
      }
      if (dest) {
        this.#emit(methods.setReg, this.variable(e), this.ref(dest, 1, "w"));
      }
      return this.variable(e);
    } else if (ts.isNumericLiteral(e)) {
      const value = Number(e.text);
      if (dest) {
        this.#emit(methods.setReg, `${value}`, this.ref(dest, 1, "w"));
      } else {
        return {
          refs: [],
          name: "",
          reg: `${value}`,
        };
      }
      return dest;
    } else if (ts.isStringLiteral(e)) {
      return {
        refs: [],
        name: "",
        reg: JSON.stringify(e.text),
      };
    }
    this.#error(`unsupported expression ${e.kind} ${ts.SyntaxKind[e.kind]}`, e);
  }

  compileNumOp(e: ts.BinaryExpression, dest?: Variable) {
    const args = [e.left, e.right];
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
    return this.compileResolvedCall(e, name, undefined, args, [dest]);
  }

  compileCall(
    e: ts.CallExpression,
    outs: (Variable | undefined)[] = []
  ): Variable {
    let thisArg: ts.Expression | undefined;
    let name: string;
    if (ts.isIdentifier(e.expression)) {
      name = e.expression.text;
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
    rawArgs: Array<ts.Expression> = [],
    outs: (Variable | undefined)[] = []
  ): Variable {
    let dest = outs[0] || this.#temp();
    const args: (string | Variable)[] = [];
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
      }
    }
    if (!info) {
      this.#error(`unknown method ${name}`, refNode);
    }

    const hasTxt =
      info.special == "txt" && rawArgs[0] && ts.isStringLiteral(rawArgs[0]);
    const txtArg = hasTxt && (rawArgs.shift() as ts.StringLiteral).text;

    info.in?.forEach((v, i) => {
      let value = rawArgs[i] ? this.compileExpr(rawArgs[i]) : "nil";
      args[v] = value;
    });
    if (info.thisArg != null) {
      if (
        info.autoSelf &&
        thisArg &&
        ts.isIdentifier(thisArg) &&
        thisArg.text == "self"
      ) {
        args[info.thisArg] = "nil";
      } else {
        args[info.thisArg] = thisArg ? this.compileExpr(thisArg) : "nil";
      }
    }
    let outDefs = typeof info.out === "number" ? [info.out] : info.out;
    outDefs?.forEach((v, i) => {
      let value = outs[i] || "nil";
      args[v] = value;
    });

    if (info.exec != null) {
      dest.exec = new Map();
      for (const [e, i] of Object.entries(info.exec)) {
        dest.exec.set(e.match(/^(true|false)$/) ? e == "true" : e, {
          instruction: this.currentScope.instructions.length,
          arg: i,
          dir: "w",
        });
      }
    }
    for (let i = 0; i < args.length; i++) {
      if (!args[i]) {
        args[i] = "nil";
      }
    }
    if (txtArg) {
      args.push(`$txt=${JSON.stringify(txtArg)}`);
    }
    if (info.c != null) {
      args.push(`$c=${info.c}`);
    }
    if (info.sub) {
      args.push(`$sub=:${info.sub}`);
    }
    this.#emit(info, ...args);
    dest.exec?.forEach((ref) => {
      this.#rewrite(ref, null);
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
          this.#compileDynamicJump(s, theEnd, label);
        }
        if (variable) {
          if (!variable.exec) {
            this.#error(
              "switch statement must use a flow control instruction",
              s
            );
          }
          for (const clause of s.caseBlock.clauses) {
            const clauseLabel = this.#label();
            this.#emitLabel(clauseLabel);
            if (ts.isCaseClause(clause)) {
              const key = this.#parseNormalSwitchExpression(clause.expression);
              this.#rewriteLabel(variable.exec.get(key)!, clauseLabel);
            } else {
              variable.exec.forEach((ref) => {
                this.#rewriteLabel(ref, clauseLabel, true);
              });
            }
            clause.statements.forEach(this.compileStatement, this);
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
    end: string,
    label: string | undefined
  ) {
    const cond = this.#temp();
    const labelType = dynamicLabels[this.dynamicLabelCounter++];
    if (!labelType) {
      this.#error("Too many switch statements", s);
    }
    this.#emit(
      methods.setNumber,
      labelType,
      this.ref(this.compileExpr(s.expression), 1, "r"),
      this.ref(cond, 2, "w")
    );

    const defaultClause = s.caseBlock.clauses.find((clause) =>
      ts.isDefaultClause(clause)
    );
    this.#emit(methods.jump, this.ref(cond, 0, "r"));
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
        this.#emit(methods.label, `${labelType}@${clause.expression.text}`);
      } else {
        this.#emitLabel(defaultLabel!);
      }
      clause.statements.forEach(this.compileStatement, this);
    }
  }

  compileIf(s: ts.IfStatement, dest?: Variable, parentEnd?: string) {
    if (
      s.expression.kind === ts.SyntaxKind.TrueKeyword
    ) {
      this.compileStatement(s.thenStatement);
      return;
    } else if (
      s.expression.kind === ts.SyntaxKind.FalseKeyword
    ) {
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
    this.#rawEmit("jump", ":" + label);
  }

  #emitLabel(label: string) {
    this.#rawEmit(label + ":");
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
    return this.variable(`t${this.currentScope.tempCounter++}`);
  }

  compileVarDecl(s: ts.VariableDeclarationList) {
    s.declarations.forEach((decl: ts.VariableDeclaration) => {
      if (decl.initializer) {
        if (ts.isIdentifier(decl.name)) {
          this.compileExpr(decl.initializer, this.variable(decl.name));
        } else if (ts.isArrayBindingPattern(decl.name)) {
          if (ts.isCallExpression(decl.initializer)) {
            const outs = decl.name.elements.map((el) => {
              if (ts.isOmittedExpression(el)) {
                return undefined;
              } else if (ts.isIdentifier(el.name)) {
                return this.variable(el.name);
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
            this.#error("only call expression are valid for array initializer", decl);
          }
        } else {
          this.#error("Unable to bind object", decl);
        }
      }
    });
  }

  variable(id: ts.Identifier | string, reg?: string): Variable {
    const name = typeof id === "string" ? id : id.text;
    if (name.match(/^(goto|store|visual|signal)$/)) {
      reg = name;
    }
    if (!this.currentScope.scope.has(name)) {
      this.currentScope.scope.set(name, {
        name,
        reg: reg ?? `r${this.currentScope.regCounter++}`,
        refs: [],
      });
    }
    return this.currentScope.scope.get(name)!;
  }

  ref(
    varname: string | ts.Identifier | Variable,
    argNum: number,
    dir: "r" | "w" | "rw" = "rw"
  ): Variable {
    const v = isVar(varname) ? varname : this.variable(varname);
    v.refs.push({ instruction: this.currentScope.instructions.length, arg: argNum, dir });
    return v;
  }

  #label() {
    return `l${this.labelCounter++}`;
  }

  #rawEmit(name: string, ...args: string[]) {
    this.currentScope.rawEmit(name, ...args);
  }

  #emit(info: MethodInfo, ...args: (string | Variable)[]) {
    const name = info.id;
    if (name == 'get_distance') debugger;
    const strArgs = args.map((v, i) => {
      if (typeof v === "string") {
        return v;
      }
      if (name == "call") {
        return this.ref(v, i, "rw").reg;
      } else if (
        info?.out == i ||
        (Array.isArray(info?.out) && info.out.includes(i))
      ) {
        return this.ref(v, i, "w").reg;
      } else {
        return this.ref(v, i, "r").reg;
      }
    });
    while (strArgs[strArgs.length - 1] == "nil") {
      strArgs.pop();
    }
    this.currentScope.instructions.push({ name, args: strArgs });
  }

  #rewriteLabel(ref: ArgRef, label: string, skipIfSet = false) {
    return this.#rewrite(ref, ":" + label, skipIfSet);
  }

  #rewrite(ref: ArgRef, value: string | null, skipIfSet = false) {
    if (ref.extraArg) {
      this.#rewrite(
        { instruction: ref.instruction, arg: ref.extraArg, dir: ref.dir },
        value,
        skipIfSet
      );
    }
    const instr = this.currentScope.instructions[ref.instruction];
    if (ref.arg === "next") {
      if (skipIfSet && instr.next !== null) {
        return;
      }
      instr.next = value;
      return;
    }
    if (skipIfSet && instr.args[ref.arg] !== null) {
      return;
    }
    instr.args[ref.arg] = value;
  }

  asm() {
    return this.functionScopes.flatMap((scope) => scope.instructions).map(formatInstruction).join("\n");
  }
}
interface Instruction {
  name: string;
  args: (string | null)[];
  next?: (string | null);
  comment?: string;
}
interface ArgRef {
  instruction: number;
  arg: number | "next";
  extraArg?: number | "next"; // For <= and >=
  dir: "r" | "w" | "rw";
}
interface Variable {
  name: string;
  reg: string;
  refs: ArgRef[];
  exec?: Map<string | boolean, ArgRef>;
}

interface Liveness {
  start: number;
  end: number;
  name: string;
  reg: string;
  refs: ArgRef[];
}

function isVar(t: unknown): t is Variable {
  return typeof (t as Variable).reg === "string";
}
function formatInstruction(i: Instruction) {
  if (i.name.endsWith(":")) return i.name;
  const comment = i.comment ? "\t; " + i.comment : "";
  const next = i.next ? `\n  jump\t${i.next}` : "";
  return `  ${i.name}\t${i.args.join(", ")}${comment}${next}`;
}

export const CompilerOptions = {
  lib: ["lib.es2023.d.ts"],
  target: ts.ScriptTarget.ES2022,
};


export function compileProgram(program: ts.Program):string {
  // TODO: ended up not using the typechecker. Should probably just parse
  // to reduce bundle size.
  ts.getPreEmitDiagnostics(program).forEach((diagnostic) => {
    if (diagnostic.file) {
      let { line, character } = ts.getLineAndCharacterOfPosition(
        diagnostic.file,
        diagnostic.start!
      );
      let message = ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n");
      console.log(
        `${diagnostic.file.fileName} (${line + 1},${character + 1}): ${message}`
      );
    } else {
      console.log(ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n"));
    }
  });
  for (const f of program.getSourceFiles()) {
    if (!f.fileName.endsWith(".d.ts")) {
      const withoutExtension = f.fileName.substring(0, f.fileName.length - 3);
      try {
        return compileFile(f, program.getTypeChecker());
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
