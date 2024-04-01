#!/usr/bin/env node
import { CompilerOptions, compileProgram } from "./compile";
import * as fs from "fs";
import * as ts from "typescript";

const filename = process.argv[2];
const files = [filename, `${__dirname}/../behavior.d.ts`];
const program = ts.createProgram(files, CompilerOptions);
const asm = compileProgram(filename, program);
fs.writeFileSync(filename + ".asm", asm);
