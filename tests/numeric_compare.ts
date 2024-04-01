export function foo(v: Value) {
  let a = getBattery();
  if (a < 20) {
    domove(gethome());
    return;
  }
  let [h] = getHealth(self);
  if (h <= 50) {
    domove(gethome());
  } else {
    notify("ok");
  }
}
