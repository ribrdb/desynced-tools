import { behavior_dts } from "./behavior_dts.js";
import { CompilerOptions, compileProgram } from "./compile.js";
import { lib_dts } from "./lib_dts.js";
import * as tsvfs from "@typescript/vfs";
import * as ts from "typescript";

export { CompilerOptions, compileProgram };
export { DesyncedStringToObject, ObjectToDesyncedString } from "./dsconvert.js";
export { Disassembler } from "./decompile/disasm.js";
export { assemble } from "./assembler";

export function makeProgram(tsCode: string, compilerOptions = CompilerOptions) {
  const fsMap = new Map<string, string>();
  for (const lib in lib_dts) {
    fsMap.set(lib, lib_dts[lib]);
  }
  fsMap.set("index.ts", tsCode);
  fsMap.set("behavior.d.ts", behavior_dts);

  const system = tsvfs.createSystem(fsMap);
  const host = tsvfs.createVirtualCompilerHost(system, compilerOptions, ts);

  return ts.createProgram({
    rootNames: [...fsMap.keys()],
    options: compilerOptions,
    host: host.compilerHost,
  });
}
