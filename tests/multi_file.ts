import { rng } from "./rng";

export function foo(rngState: Value) {
  rng(100, 1, rngState);
}
