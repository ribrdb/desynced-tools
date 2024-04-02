export function foo(v: Value) {
  let [branch, nearest] = selectNearest(v, signal);
  switch (branch) {
    case "A":
      notify("A is closest", nearest);
      break;
    case "B":
      notify("B is closest", nearest);
      break;
    default:
      notify("Default branch");
      break;
  }
}
