export function foo(p1: Value) {
  const c1 = (1 + 2) * 3;
  const c2 = c1 * 99;
  const cUnused = 4;

  let v1 = (5 + 6) * 7;
  const c3 = 5 + c2 + v1;
  let vUnused = 8;

  p1 = -1;

  notify(c1);
  notify(c2);
  notify(v1);
  notify(12 * 12);
  notify(c3 * 5);

  let lVar2 = 9;
  if (p1.fullHealth()) {
    lVar2 = 10;
  } else {
    lVar2 = 11;
  }

  notify(lVar2);

  const cCoord = coord(-5 * 3, -10);
  domove(cCoord * 3);
  domove(cCoord);
}
