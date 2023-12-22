
export function foo(v:Value) {
    let a = getBattery();
    if (a.num < 20) {
        domove(gethome());
        return;
    }
    let [h] = getHealth(self);
    if (h.num <= 50) {
        domove(gethome());
    } else {
        notify("ok")
    }

}