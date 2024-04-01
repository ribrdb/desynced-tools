export function test(a) {
  let closest = a.nearerThan(signal);
  if (closest) {
    notify("a");
  } else {
    notify("b");
  }
}
