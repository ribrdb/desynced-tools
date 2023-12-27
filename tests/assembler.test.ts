import {expect, test} from '@jest/globals';
import * as fs from "fs";
import { assemble } from "../assembler";
import {globSync} from "glob";
import path from 'path';

for (const filename of globSync(`${__dirname}/*.asm`)) {
    const code = fs.readFileSync(filename, "utf8");
    test(path.basename(filename), () => assemble(code).then((obj) => expect(obj).toMatchSnapshot()));
}
