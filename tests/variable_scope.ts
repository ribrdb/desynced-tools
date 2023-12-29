export function foo(v: Value) {
  let bar = v;
  while (true) {
    if (bar != v) {
      notify(bar);
      bar = v;
    }
  }
}
