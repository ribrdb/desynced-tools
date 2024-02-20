
export function foo(v:Value) {
    if (self.fullBattery()) {
        return;
    }
    const [isMissing, missingItem] = v.solve();
    if (isMissing) {
        notify("no solution");
    } else {
        notify("solved");
    }
    let a:number;
    switch (missingItem?.type) {
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