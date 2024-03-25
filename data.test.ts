import {expect, test} from "@jest/globals";
import {toJsFunctionName} from "./data";

test("toJsFunctionName", () => {
    const tests: [string, string][] = [
        ["Dashbot", "dashbot"],
        ["Command Center", "commandCenter"],
        ["Hi-grade Capacitor", "hiGradeCapacitor"],
        ["c_trilobyte_attack4", "trilobyteAttack4"],
        ["AI Explorer", "aiExplorer"],
        ["Building 1x1 (1M)", "building1x1_1M"],
        ["Building 2x2 (1M3S)", "building2x2_1M3S"],
        ["Human Explorer (Broken)", "humanExplorerBroken"]
    ];

    for(const [name, frameJsName] of tests) {
        expect(toJsFunctionName(name)).toBe(frameJsName);
    }
});