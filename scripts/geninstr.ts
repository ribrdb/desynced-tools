// To update the instruction defs:
// - generate instructions.json: `node scripts/extractor.cjs path/to/instructions.lua`
// - `npx ts-node scripts/geninstr.ts`

import * as fs from "fs";
import instrJson from "../instructions.json";
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

const { instructions } = instrJson as any as {
  instructions: { [key: string]: InstrInfo };
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
  )}
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

type AnyValue = Coord | ItemNum | FrameNum | RadarFilter;
type Coord = [number, number];
type CoordNum = Coord | number;

type RadarFilter =
  | Resource
  | "v_own_faction"
  | "v_ally_faction"
  | "v_enemy_faction"
  | "v_world_faction"
  | "v_bot"
  | "v_building"
  | "v_is_foundation"
  | "v_construction"
  | "v_droppeditem"
  | "v_resource"
  | "v_mineable"
  | "v_anomaly"
  | "v_valley"
  | "v_plateau"
  | "v_not_blight"
  | "v_blight"
  | "v_alien_faction"
  | "v_human_faction"
  | "v_robot_faction"
  | "v_bug_faction"
  | "v_solved"
  | "v_unsolved"
  | "v_can_loot"
  | "v_in_powergrid"
  | "v_mothership"
  | "v_damaged"
  | "v_infected"
  | "v_broken"
  | "v_unpowered"
  | "v_emergency"
  | "v_powereddown"
  | "v_pathblocked"
  | "v_idle";

type Item =
  | Comp
  | "metalore"
  | "crystal"
  | "laterite"
  | "aluminiumrod"
  | "aluminiumsheet"
  | "silica"
  | "fused_electrodes"
  | "reinforced_plate"
  | "optic_cable"
  | "circuit_board"
  | "infected_circuit_board"
  | "obsidian"
  | "metalbar"
  | "metalplate"
  | "foundationplate"
  | "ldframe"
  | "energized_plate"
  | "hdframe"
  | "beacon_frame"
  | "refined_crystal"
  | "crystal_powder"
  | "obsidian_brick"
  | "alien_artifact"
  | "alien_artifact_research"
  | "silicon"
  | "wire"
  | "cable"
  | "icchip"
  | "micropro"
  | "cpu"
  | "steelblock"
  | "concreteslab"
  | "ceramictiles"
  | "polymer"
  | "robot_datacube"
  | "alien_datacube"
  | "human_datacube"
  | "blight_datacube"
  | "virus_research_data"
  | "empty_databank"
  | "datacube_matrix"
  | "robot_research"
  | "human_research"
  | "alien_research"
  | "blight_research"
  | "virus_research"
  | "adv_data"
  | "human_databank"
  | "alien_databank"
  | "drone_transfer_package"
  | "drone_transfer_package2"
  | "drone_miner_package"
  | "drone_adv_miner_package"
  | "drone_defense_package1"
  | "flyer_package_m"
  | "satellite_package"
  | "blight_crystal"
  | "blight_extraction"
  | "blightbar"
  | "blight_plasma"
  | "microscope"
  | "transformer"
  | "smallreactor"
  | "engine"
  | "datakey"
  | "alien_core"
  | "bot_ai_core"
  | "elain_ai_core"
  | "broken_ai_core"
  | "bug_carapace"
  | "anomaly_particle"
  | "anomaly_cluster"
  | "resimulator_core"
  | "power_petal"
  | "phase_leaf"
  | "virus_source_code"
  | "rainbow_research";

type ItemNum = Item | number | { id: Item; num: number };
type Comp =
  | "c_refinery"
  | "c_robotics_factory"
  | "c_small_relay"
  | "c_large_power_relay"
  | "c_solar_panel"
  | "c_capacitor"
  | "c_higrade_capacitor"
  | "c_small_battery"
  | "c_shared_storage"
  | "c_internal_storage"
  | "c_autobase"
  | "c_portablecrane"
  | "c_internal_crane1"
  | "c_internal_crane2"
  | "c_radio_storage"
  | "c_modulehealth_s"
  | "c_modulehealth_m"
  | "c_modulehealth_l"
  | "c_modulevisibility_s"
  | "c_modulevisibility_m"
  | "c_modulevisibility_l"
  | "c_moduleefficiency_s"
  | "c_moduleefficiency_m"
  | "c_moduleefficiency_l"
  | "c_modulespeed_s"
  | "c_modulespeed_m"
  | "c_modulespeed_l"
  | "c_particle_leaves"
  | "c_glitch"
  | "c_damageself"
  | "c_small_storage"
  | "c_destroyself"
  | "c_phase_plant"
  | "c_damage_plant"
  | "c_damage_plant_internal"
  | "c_large_storage"
  | "c_fusion_generator"
  | "c_battery"
  | "c_large_battery"
  | "c_large_power_transmitter"
  | "c_medium_storage"
  | "c_blight_container_i"
  | "c_blight_container_s"
  | "c_blight_container_m"
  | "c_virus_decomposer"
  | "c_alien_attack"
  | "c_alien_extractor"
  | "c_alien_factory"
  | "c_human_refinery"
  | "c_human_factory_robots"
  | "c_human_science_analyzer_robots"
  | "c_human_commandcenter"
  | "c_human_barracks"
  | "c_human_spaceport"
  | "c_human_science"
  | "c_alien_research";
type CompNum = Comp | number | { id: Comp; num: number };

type Resource =
  | "metalore"
  | "crystal"
  | "laterite"
  | "silica"
  | "obsidian"
  | "alien_artifact"
  | "alien_artifact_research"
  | "blight_crystal"
  | "blight_extraction"
  | "bug_carapace";
type ResourceNum = Resource | number | { id: Resource; num: number };
type Frame =
  | "f_building1x1a"
  | "f_building1x1b"
  | "f_building1x1c"
  | "f_building1x1d"
  | "f_building1x1f"
  | "f_building1x1g"
  | "f_building2x1a"
  | "f_building2x1e"
  | "f_building2x1f"
  | "f_building2x1g"
  | "f_building2x2b"
  | "f_building2x2f"
  | "f_bot_1s_as"
  | "f_bot_1s_adw"
  | "f_bot_2m_as"
  | "f_bot_1s_a"
  | "f_bot_1s_b"
  | "f_bot_2s"
  | "f_construction"
  | "f_foundation"
  | "f_human_foundation"
  | "f_human_foundation_basic"
  | "f_feature"
  | "f_blocking_feature"
  | "f_floating_feature"
  | "f_dropped_resource"
  | "f_building1x1e"
  | "f_building2x1b"
  | "f_building2x1c"
  | "f_building2x1d"
  | "f_building2x2a"
  | "f_building2x2c"
  | "f_building2x2d"
  | "f_building2x2e"
  | "f_building_pf"
  | "f_transport_bot"
  | "f_bot_1m1s"
  | "f_bot_1m_b"
  | "f_bot_1m_c"
  | "f_bot_1l_a"
  | "f_flyer_bot"
  | "f_drone_transfer_a"
  | "f_drone_transfer_a2"
  | "f_drone_miner_a"
  | "f_drone_adv_miner"
  | "f_drone_defense_a"
  | "f_flyer_m"
  | "f_satellite"
  | "f_building3x2a"
  | "f_building3x2b"
  | "f_building_fg"
  | "f_human_flyer"
  | "f_human_tank"
  | "f_human_miner"
  | "f_alienbot"
  | "f_human_explorable_5x5_a"
  | "f_carrier_bot";
type FrameNum = Frame | number | { id: Frame; num: number };
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
