export function foo(p: Value) {
  let a: Value = 1;
  {
    let a: Value = 2;
    p = a;
  }
  {
    let a: Value = 3;
    p = a;
  }
}
