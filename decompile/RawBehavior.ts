import { RawInstruction } from "./RawInstruction";


export interface RawBehavior {
  [key: number]: RawInstruction;
  parameters?: unknown[];
  name?: string;
  pnames?: string[];
  vars?: unknown[];
  subs?: RawBehavior[];
}
