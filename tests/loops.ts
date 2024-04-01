export function loops() {
    for (let [a, b] of matchingSignals(value("metalore"))) {
        notify(a);
        notify(b);
    }

    let c: Value;
    let d: Value;
    for ([c, d] of matchingSignals(value("metalore"))) {
        let x: Value = 1;
        notify(x);
        break;
    }

    notify(c);
    notify(d);
}