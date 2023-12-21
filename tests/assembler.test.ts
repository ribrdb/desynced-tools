import {expect, test} from '@jest/globals';
import * as fs from "fs";
import { assemble } from "../assembler";
import {globSync} from "glob";

for (const filename of globSync(`${__dirname}/*.asm`)) {
    const code = fs.readFileSync(filename, "utf8");
    test(filename, () => assemble(code).then((obj) => expect(obj).toMatchSnapshot()));
}
