import { RawBlueprint } from "./RawBlueprint";

export interface RawInstruction {
  op: string;
  cmt?: string;
  next?: number | false;
  [key: number]: unknown;
  c?: number;
  txt?: string;
  bp?: string|RawBlueprint;
  sub?: number;
  nx?: number;
  ny?: number;
}
