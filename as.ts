#!/usr/bin/env node
import { assemble } from "./assembler";
import { ObjectToDesyncedString } from "./dsconvert";
import * as fs from "fs";

const code = fs.readFileSync(process.argv[2], "utf8");
const obj = assemble(code);
let typ = "C";
if ("frame" in obj) {
  typ = "B";
}
const str = ObjectToDesyncedString(obj, typ);
fs.writeFileSync(process.argv[2] + ".txt", str);
fs.writeFileSync(process.argv[2] + ".json", JSON.stringify(obj, undefined, 2));
