import { Instruction } from "./instruction";

export interface Pass {
    reverse?: boolean;
    (instr: Instruction, i: number): void;
}

export class Program {
    code: Instruction[] = [];

    add(instr: Instruction) {
        if (this.code.length > 0) {
            const last = this.code[this.code.length - 1];
            last.next ??= {nodeIndex: this.code.length};
        }
        this.code.push(instr);
    }

    apply(pass: Pass) {
        if (pass.reverse) {
            this.#applyReverse(pass);
            return;
        }
        for (let i = 0; i < this.code.length; i++) {
            const instr = this.code[i];
            pass(instr, i);
        }
    }

    #applyReverse(pass: Pass) {
        for (let i = this.code.length - 1; i >= 0; i--) {
            const instr = this.code[i];
            pass(instr, i);
        }
    }

    // TODO: moveInstruction
}