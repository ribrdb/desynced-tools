import { RawInstruction } from "./RawInstruction";


export interface RawBehavior {
  [key: number]: RawInstruction;
  parameters?: boolean[];
  name?: string;
  pnames?: string[];
  vars?: unknown[];
  subs?: RawBehavior[];
}
