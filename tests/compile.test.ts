import { CompilerOptions, compileProgram } from "../compile";
import { expect, test } from "@jest/globals";
import { globSync } from "glob";
import * as path from "path";
import * as ts from "typescript";

for (const filename of globSync(`${__dirname}/*.ts`)) {
  if (filename.endsWith(".test.ts")) {
    continue;
  }
  test(path.basename(filename), () => {
    const files = [filename, `${__dirname}/../behavior.d.ts`];
    const program = ts.createProgram(files, {
      types: [],
      ...CompilerOptions,
    });
    const asm = compileProgram(filename, program);
    expect(asm).toMatchSnapshot();
  });
}
