import { assemble } from "../assembler";
import { expect, test } from "@jest/globals";
import * as fs from "fs";
import { globSync } from "glob";
import path from "path";

for (const filename of globSync(`${__dirname}/*.asm`)) {
  const code = fs.readFileSync(filename, "utf8");
  test(path.basename(filename), () => expect(assemble(code)).toMatchSnapshot());
}
