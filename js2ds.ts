#!/usr/bin/env node
import * as fs from "fs";
import * as ts from "typescript";
import { CompilerOptions, compileProgram } from "./compile";

const filename = process.argv[2];
const files = [filename, `${__dirname}/../behavior.d.ts`];
const program = ts.createProgram(files, CompilerOptions);
const asm = compileProgram(program);
fs.writeFileSync(filename + ".asm", asm);
