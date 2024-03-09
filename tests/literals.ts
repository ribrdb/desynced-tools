export function foo(v: Value) {
    let x = 5;
    x.fullBattery();

    v = undefined;
    v.fullBattery();
    v = 1;
    v.fullBattery();
    v = value("c_battery");
    v.fullBattery();
    v = value("c_small_relay", 2);
    v.fullBattery();
    v = coord(10, 20);
    v.fullBattery();
    v = setNumber(v, 30);
    v = self.count("c_battery");
    v = self.count(value("c_battery"))
    v = self.count(v);

    v = v - 1;
    v = v + 1;

    let v2: Value = value("c_battery");
    let v3: Value = 10;
    v2 = v3 + 1;
}