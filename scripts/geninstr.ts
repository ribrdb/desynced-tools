// To update the instruction defs:
// - generate dumped-game-data.json:
//   - Launch game, install Data Dump mod
//   - In the main menu go to Options -> Mods -> Data Dump
//   - Click Copy, navigate to https://swazrgb.github.io/desynced-data-dump/
//   - Paste clipboard contents in Data String, press Convert to JSON
//   - Paste resulting JSON in dumped-game-data.json
// - `npx ts-node scripts/geninstr.ts`

import * as fs from "fs";
import { gameData, GameData } from "../data";
import overrides from "./overrides.json";

const dtsProps: string[] = [];
const dtsMethods: string[] = [];
const dtsFunctions: string[] = [];
const decompileInfos: { [key: string]: any } = {};
const compileInfos: { [key: string]: CompileInfo } = {};
type filter =
  | "any"
  | "entity"
  | "num"
  | "coord"
  | "coord_num"
  | "item"
  | "item_num"
  | "comp"
  | "comp_num"
  | "frame"
  | "frame_num"
  | "radar"
  | "resource"
  | "resource_num";

const FilterTypes = {
  any: "Value | AnyValue",
  entity: "Value",
  num: "Value | number",
  number: "Value | number",
  coord: "Value | Coord",
  coord_num: "Value | CoordNum",
  item: "Value | Item",
  item_num: "Value | ItemNum",
  comp: "Value | Comp",
  comp_num: "Value | CompNum",
  frame: "Value | Frame",
  frame_num: "Value | FrameNum",
  radar: "Value | RadarFilter",
  resource: "Value | Resource",
  resource_num: "Value | ResourceNum",
};

type ArgInfo = [string, (string | null)?, filter?, boolean?];
interface InstrInfo {
  args?: ["in" | "out" | "exec", ...ArgInfo][];
  exec_arg?: false | [number, ...ArgInfo];
  name?: string;
  desc?: string;
  category?: string;
}

interface GenInfo {
  js: string;
  op: string;
  c?: number;
  txt?: boolean;
  bp?: boolean;
  conditions?: { [key: string]: boolean | string };
  type: "operator" | "method" | "property" | "function";
  thisArg?: number;
  autoself?: boolean;
  loop?: boolean;
  terminates?: boolean;
  aliases?: Partial<GenInfo>[];
  optional?: number;
  inArgs: [number, ...ArgInfo][];
  outArgs: [number, ...ArgInfo][];
  execArgs: [number, ...ArgInfo][];
}

interface CompileInfo {
  id: string;
  in?: number[];
  out?: number | number[];
  exec?: { [key: string]: number | "next" };
  thisArg?: number;
  autoSelf?: boolean;
  loop?: boolean;
  special?: "txt" | "bp";
  c?: number;
}

const instructions = gameData.instructions as unknown as {
  [key: string]: InstrInfo
};

for (const op in instructions) {
  const inst = instructions[op as keyof typeof instructions];
  const ov: Partial<GenInfo> =
    (overrides[op as keyof typeof overrides] as Partial<GenInfo>) ?? {};
  const genInfo: GenInfo = {
    js: jsName(op),
    op,
    terminates: false,
    type: "function",
    inArgs: [],
    outArgs: [],
    execArgs: [],
    ...ov,
  };
  inst.args?.forEach((v, i) => {
    const [kind, ...info]: ["in" | "out" | "exec", ...ArgInfo] = v;
    genInfo[(kind + "Args") as "inArgs" | "outArgs" | "execArgs"].push([
      i,
      ...info,
    ]);
  });
  let thisArg = genInfo.inArgs.find((v) => v[2]?.includes("if not self"))?.[0];
  if (ov.thisArg == undefined) {
    genInfo.autoself = thisArg != undefined;
  }
  if (genInfo.type == "property" || genInfo.type == "method") {
    if (thisArg == undefined) {
      thisArg = genInfo.inArgs[0][0];
    }
  }
  genInfo.thisArg = thisArg;
  if (thisArg && genInfo.type == "function") {
    genInfo.type = genInfo.inArgs.length == 1 ? "property" : "method";
  }
  genInfo.terminates = genInfo.execArgs.length == 0 && inst.exec_arg == false;
  if (genInfo.execArgs.length > 0) {
    genInfo.conditions ??= {};
    if (inst.exec_arg != false) {
      genInfo.conditions["next"] ??= inst?.exec_arg?.[1] ?? "next";
    }
    genInfo.execArgs.forEach((v) => {
      genInfo.conditions![v[1]] ??= v[1];
    });
    if (genInfo.execArgs.length == 1 && genInfo.conditions.next == "next") {
      genInfo.conditions.next = true;
      genInfo.conditions[genInfo.execArgs[0][1]] = false;
    }
  }
  const infos = [genInfo];
  if (ov.aliases) {
    infos.push(...ov.aliases.map((v) => ({ ...genInfo, ...v })));
  }
  for (const info of infos) {
    generateDecompile(info);
    generateCompile(info);
    generateTypes(info, inst.desc ?? inst.name);
  }
}

function jsName(name: string) {
  return name
    .split("_")
    .map((v, i) => (i == 0 ? v : v[0].toUpperCase() + v.slice(1)))
    .join("");
}
function generateDecompile(genInfo: GenInfo) {
  if (genInfo.op in decompileInfos) {
    return;
  } else {
    const dc: any = {
      ...genInfo,
      inArgs: genInfo.inArgs.map((v) => v[0]),
      outArgs: genInfo.outArgs.map((v) => v[0]),
      execArgs: genInfo.execArgs.map((v) => v[0]),
    };
    if (dc.js == dc.op) {
      delete dc.js;
    }
    delete dc.op;

    ["inArgs", "outArgs", "execArgs"].forEach((v) => {
      if (dc[v].length == 0) delete dc[v];
    });
    ["terminates", "autoself"].forEach((v) => {
      if (dc[v] == false) delete dc[v];
    });

    decompileInfos[genInfo.op] = dc;
  }
}

function generateCompile(genInfo: GenInfo) {
  const info: CompileInfo = {
    id: genInfo.op,
  };
  if (genInfo.thisArg != undefined) {
    info.thisArg = genInfo.thisArg;
  }
  if (genInfo.autoself) {
    info.autoSelf = true;
  }
  if (genInfo.loop) {
    info.loop = true;
  }
  const specials: ("txt" | "bp")[] = ["txt", "bp"];
  for (const v of specials) {
    if (genInfo[v]) {
      info.special = v;
    }
  }
  if (genInfo.c != null) {
    info.c = genInfo.c;
  }
  if (genInfo.conditions) {
    info.exec = {};
    for (const [k, v] of Object.entries(genInfo.conditions)) {
      if (k == "next") {
        info.exec[`${v}`] = k;
      } else {
        const arg = genInfo.execArgs.find((v) => v[1] == k);
        info.exec[`${v}`] = arg![0];
      }
    }
  }
  if (genInfo.inArgs.length > 0) {
    info.in = genInfo.inArgs.map((v) => v[0]);
  }
  if (genInfo.outArgs.length == 1) {
    info.out = genInfo.outArgs[0][0];
  } else if (genInfo.outArgs.length > 1) {
    info.out = genInfo.outArgs.map((v) => v[0]);
  }
  compileInfos[genInfo.js] = info;
}

interface ParamInfo {
  name: string;
  doc?: string;
  type: string;
}

function generateTypes(genInfo: GenInfo, doc?: string) {
  if (genInfo.type == "operator") {
    return;
  }
  const params: ParamInfo[] = uniqify(
    genInfo.inArgs
      .filter((v) => v[0] != genInfo.thisArg)
      .map((v, i) => {
        const type = (v[3] && FilterTypes[v[3]]) ?? "Value";
        // TODO: should other arguments be optional?
        let optional = genInfo.optional! <= i || v[3] == "radar" ? "?" : "";
        return {
          name: makeJSVarName(v[1]) + optional,
          doc: v[2] || undefined,
          type,
        };
      })
  );
  if (genInfo.txt) {
    params.unshift({
      name: "text",
      type: "string",
    });
  }
  const jsdoc = generateDoc(genInfo, params, doc);

  const outTypes = genInfo.outArgs.map((v) => "Value");
  let returnType =
    outTypes.length == 0
      ? "void"
      : outTypes.length == 1
      ? outTypes[0]
      : `[${outTypes.join(", ")}]`;
  const inTypes = genInfo.inArgs
    .filter((v) => v[0] != genInfo.thisArg)
    .map((v) => (v[3] ? FilterTypes[v[3]] : "Value"));
  if (genInfo.loop) {
    returnType = `IterableIterator<${returnType}>`;
  } else if (genInfo.conditions) {
    returnType = makeConditionType(genInfo, returnType);
  } else if (genInfo.terminates) {
    returnType = "never";
  }

  if (genInfo.type == "property") {
    let q = returnType.endsWith("| undefined") ? "?" : "";
    if (q) {
      returnType = returnType.slice(
        0,
        returnType.length - " | undefined".length
      );
    }
    dtsProps.push(`  ${jsdoc}${genInfo.js}${q}: ${returnType};`);
  } else {
    const paramStrs = params.map((v) => `${v.name}: ${v.type}`);
    const decl = `${genInfo.js}(${paramStrs.join(", ")}): ${returnType};`;
    if (genInfo.type == "function") {
      dtsFunctions.push(`${jsdoc}declare function ${decl}`);
    } else {
      dtsMethods.push(`  ${jsdoc}${decl}`);
    }
  }
}

function generateDoc(
  genInfo: GenInfo,
  params: ParamInfo[],
  methodDoc?: string
): string | undefined {
  let indent = genInfo.type == "function" ? "" : "  ";
  let allDocs: string[] = [];

  if (genInfo.type == "property") {
    methodDoc ||= genInfo.outArgs[0]?.[2] || undefined;
  } else {
    allDocs.push(
      ...params.filter((v) => v.doc).map((v) => `@param ${v.name} ${v.doc}`)
    );
    if (genInfo.outArgs.length == 1 && genInfo.outArgs[0][2]) {
      allDocs.push(`@returns ${genInfo.outArgs[0][2]}`);
    } else if (genInfo.outArgs.length > 1) {
      allDocs.push(
        `@returns [${genInfo.outArgs.map((v) => v[2] || v[1]).join(", ")}]`
      );
    }
  }

  if (methodDoc) {
    allDocs.unshift(methodDoc!);
  }

  if (allDocs.length == 0) {
    return "";
  }
  return `/**
${indent} * ${allDocs.join(`\n${indent} * `)}
${indent} */
${indent}`;
}

function makeConditionType(genInfo: GenInfo, returnType: string): string {
  if (genInfo.outArgs.length > 0) {
    return `${returnType} | undefined`;
  }
  const values = [...Object.values(genInfo.conditions!)];
  if (values.every((v) => typeof v == "boolean")) {
    return "boolean";
  }
  returnType = values
    .filter((v) => typeof v === "string")
    .map((v) => `"${v}"`)
    .join(" | ");
  if (values.some((v) => typeof v !== "string")) {
    return `${returnType} | undefined`;
  }
  return returnType;
}

function uniqify(params: ParamInfo[]) {
  params.forEach((v, i) => {
    let name = v.name;
    let n = 1;
    let optional = name.endsWith("?");
    let plainName = name.substring(0, name.length - (optional ? 1 : 0));
    let suffix = optional ? "?" : "";
    for (let j = i + 1; j < params.length; j++) {
      if (params[j].name == name) {
        v.name = `${plainName}1${suffix}`;
        params[j].name = `${plainName}${++n}${suffix}`;
      }
    }
  });
  return params;
}

function quote(str: string) {
  return JSON.stringify(str);
}

function toEnum<T extends GameData>(data: Array<T> | Record<string, T>, fn?: (item: T) => boolean): string {
  const filter = fn ?? (() => true);
  if(!Array.isArray(data)) {
    data = Object.values(data);
  }

  return data.filter(filter).map(e => {
   return `  | ${quote(e.id)}`
  }).join("\n");
}

function makeJSVarName(name: string): string {
  return name
    .replace(/[^a-zA-Z0-9]/g, "_")
    .replace(/__+/g, "_")
    .toLowerCase();
}

fs.writeFileSync(
  "methods.ts",
  `export interface MethodInfo {
  id: string;
  in?: number[];
  out?: number | number[];
  exec?: { [key: string]: number | "next" };
  thisArg?: number;
  autoSelf?: boolean;
  loop?: boolean;
  special?: 'txt'|'bp';
  c?: number;
  sub?: string;
}
export const methods: { [key: string]: MethodInfo } = ${JSON.stringify(
    compileInfos,
    undefined,
    2
  )};

export const ops: {
  [key: string]: MethodInfo;
} = {};
for (const op of Object.values(methods)) {
  ops[op.id] = op;
}
`
);

const dtsContents = `
type Value = number & {
${dtsProps.join("\n")}

${dtsMethods.join("\n")}
}

${dtsFunctions.join("\n")}

declare const self: Value;
declare var goto: Value;
declare var store: Value;
declare var visual: Value;
declare var signal: Value;

type AnyValue = Coord | ItemNum | FrameNum | RadarFilter | ColorNum | ExtraNum;
type Coord = [number, number];
type CoordNum = Coord | number;

type NumOrPair<T> = T | number | {
  id: T,
  num: number
};

type Color =
${toEnum(gameData.values, e => e.tag === "color")};
type ColorNum = NumOrPair<Color>;

type Extra =
${toEnum(gameData.values, e => e.tag === "value")};
type ExtraNum = NumOrPair<Extra>;

type RadarFilter =
  | Resource
${toEnum(gameData.values, e => e.tag === "entityfilter")};

type Item =
  | Comp
  | Resource
${toEnum(gameData.items, item => item.tag !== "resource")};
type ItemNum = NumOrPair<Item>;

type Comp =
${toEnum(gameData.components)};
type CompNum = NumOrPair<Comp>;

type Resource =
${toEnum(gameData.items, item => item.tag === "resource")};
type ResourceNum = NumOrPair<Resource>;

type Frame =
${toEnum(gameData.frames)};
type FrameNum = NumOrPair<Frame>;

declare function coord(x: number, y: number): Value;
declare function value(id: Comp, num?: number): Value;
declare function value(id: Item, num?: number): Value;
declare function value(id: Resource, num?: number): Value;
declare function value(id: Frame, num?: number): Value;
declare function value(id: Color, num?: number): Value;
declare function value(id: Extra, num?: number): Value;
`;

fs.writeFileSync("behavior.d.ts", dtsContents);
fs.writeFileSync("behavior_dts.ts", `export const behavior_dts = ${JSON.stringify(dtsContents)}`);

fs.writeFileSync(
  "decompile/dsinstr.ts",
  `
interface InstrInfo {
  js?: string;
  c?: number;
  txt?: boolean;
  bp?: boolean;
  conditions?: { [key: string]: boolean | string };
  type: "operator" | "method" | "property" | "function";
  thisArg?: number;
  autoself?: boolean;
  loop?: boolean;
  terminates?: boolean;
  aliases?: Partial<InstrInfo>[];
  inArgs?: number[];
  outArgs?: number[];
  execArgs?: number[];
  optional?: number;
}
export const instructions:{[key:string]:InstrInfo} = ${JSON.stringify(
    decompileInfos,
    undefined,
    2
  )};
`
);
