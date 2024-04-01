export function test(a) {
  const t = a.unitType;
  if (t == "Bot") {
    notify("Bot");
  } else if (t == "Building") {
    notify("Building");
  } else {
    notify("Other");
  }
}
