
export function foo(v:Value) {
    if (self.fullBattery()) {
        return;
    }
    const missing = v.solve();
    if (missing) {
        notify("no solution");
    } else {
        notify("solved");
    }
    let a:number;
    switch (missing?.type) {
        case "Item": {
            a = 1;
            break;
        }
        case "Entity": {
            a = 2;
            break;
        }
        case "Component": {
            a = 3;
            break;
        }
        default:
            a = 4;
    }
    for (const e of entitiesInRange(20, "v_construction")) {
        const l = self.getDistance(e);
    }
}