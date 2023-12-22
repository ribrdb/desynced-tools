import { expect, test } from "@jest/globals";
import * as ts from "typescript";
import { CompilerOptions, compileProgram } from "../compile";
import { globSync } from "glob";

for (const filename of globSync(`${__dirname}/*.ts`)) {
  if (filename.endsWith(".test.ts")) {
    continue;
  }
  test(filename, () => {
    const files = [filename, `${__dirname}/../behavior.d.ts`];
    const program = ts.createProgram(files, {
      types: [],
      ...CompilerOptions,
    });
    const asm = compileProgram(program);
    expect(asm).toMatchSnapshot();
  });
}
