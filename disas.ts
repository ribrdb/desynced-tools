#!/usr/bin/env node
import * as fs from "fs";
import { DesyncedStringToObject } from "./dsconvert";
import { Disassembler } from "./decompile/disasm";

const code = fs.readFileSync(process.argv[2], "utf8");
const codeObj = DesyncedStringToObject(code);
const asm = new Disassembler(codeObj as any).code();
fs.writeFileSync(process.argv[2] + ".asm", asm);
