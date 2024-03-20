import * as ts from "typescript";

export const CompilerOptions: ts.CompilerOptions = {
    lib: ["lib.es2023.d.ts"],
    types: [],
    target: ts.ScriptTarget.ES2022,
    moduleResolution: ts.ModuleResolutionKind.NodeNext,
    module: ts.ModuleKind.NodeNext,
    noEmit: true,
};