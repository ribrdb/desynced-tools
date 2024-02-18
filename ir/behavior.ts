import {Code, Pass} from "./code";

type NamedCode = Map<string, Code>;

export interface Behavior {
    mainLabel?: string;
    main: Code;
    subs: NamedCode;
    others: NamedCode; // Other behaviors for use in blueprints
    bps: NamedCode;
}

export function splitProgram(prog: Code): Behavior {
    const result: Behavior = {
        mainLabel: prog.code[0]?.labels[0],
        main: prog,
        subs: new Map(),
        bps: new Map(),
        others: new Map(),
    };
    const splitter: Pass = (instr, i) => {
        let key: "subs" | "others" | "bps" | undefined;
        if (i == 0) return;
        switch (instr.op) {
            case ".sub":
                key = "subs";
                break;
            case ".behavior":
                key = "others";
                break;
            case ".blueprint":
                key = "bps";
                break;
        }
        if (key) {
            const instructions = prog.code.splice(i);
            const newCode = new Code();
            newCode.code = instructions;
            const label = instr.labels[0] ?? instructions[1]?.labels[0];
            if (!label) {
                throw new Error(`No label for ${instr.op} at line ${instr.lineno}`);
            }
            const group: NamedCode = result[key];
            group.set(label, newCode);
        }
    };
    splitter.reverse = true;
    prog.apply(splitter);
    return result;
}