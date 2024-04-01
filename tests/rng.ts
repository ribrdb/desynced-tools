export function rng(max: Value, min: Value, state: Value) {
  unlock();
  let r = max - min + 1;
  if (state <= 0) {
    state = factionItemAmount("metalore");
  }
  state = modulo(17364 * state + 1, 65521);
  return (r * state) / 65521 + min;
}
