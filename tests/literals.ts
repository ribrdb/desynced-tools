export function foo(v: Value) {
    let x = 5;
    x.fullBattery();

    v = undefined;
    v.fullBattery();
    v = 1;
    v.fullBattery();
    v = "c_battery";
    v.fullBattery();
    v = value("c_small_relay", 2);
    v = {
        id: "c_battery",
        num: 3
    } as ItemNum;
    v.fullBattery();
    v = coord(10, 20);
    v = [30, 40] as Coord;
    v.fullBattery();
    v = setNumber(v, 30);

    v = +v - 1;
    v = v as number + 1;

    let v2: Value = "c_battery";
    let v3: Value = 10;
    v2 = +v2 + 1;
}