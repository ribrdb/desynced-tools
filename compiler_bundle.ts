
import * as tsvfs from "@typescript/vfs";
import * as ts from "typescript";
import { CompilerOptions, compileProgram } from "./compile.js";
import { behavior_dts } from "./behavior_dts.js";
export { CompilerOptions, compileProgram };

export async function makeProgram(
  tsCode: string,
  compilerOptions = CompilerOptions
) {
  const fsMap = await tsvfs.createDefaultMapFromCDN(
    compilerOptions,
    ts.version,
    true,
    ts
  );
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
