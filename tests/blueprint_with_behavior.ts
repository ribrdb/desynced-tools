export const bpBuilding1 = blueprint.building2x1_2M_1({
    name: "Bot Factory",
    medium: [
        component.roboticsAssembler([
            {name: "craft1", to: "active1"},
            {to: visual},
            {name: "targetLocation1"}
        ]),
        component.roboticsAssembler({
            // Register links can use also use number-keyed objects
            0: {name: "craft2", to: "active2"},
            1: {to: visual},
            2: {name: "targetLocation2"}
        })
    ],
    internal: [
        component.internalStorage(),
        component.internalStorage(),
        component.internalStorage(),
        component.behaviorController(fnBotFactory, {
            // Behavior component links can use parameter names
            targetLocation: {to: ["targetLocation1", "targetLocation2"]},
            active1: {name: "active1"},
            active2: {name: "active2"},
            craft1: {to: "craft1"},
            craft2: {to: "craft2"}
        }),
    ]
});

function fnBotFactory(
    targetLocation: Value,
    craft1: Value,
    active1: Value,
    craft2: Value,
    active2: Value
) {
    produce(bpBot1);
    while(!compareItem(active1, null)) {}
    produce(bpBot2);
    while(!compareItem(active1, null)) {}
    craft2 = value("f_bot_1m_a", 1)
    while(!compareItem(active2, null)) {}
}

const bpBot1 = blueprint.cub({
    name: "Example Bot 1",
    visual: "c_power_transmitter",
    connected: true,
    channels: [2, 4],
    medium: [
        component.powerTransmitter()
    ],
    internal: [
        // Empty slot
        null,
        // Nested behaviors
        component.behaviorController(fnBot1, [
            value("metalore", 1),
            { value: value("metalore", 2), to: goto },
            { value: "metalore" },
            3
        ])
    ]
});

function fnBot1(p1: Value, p2: Value, p3: Value, p4: Value) {
    notify("Hello World");
}

const bpBot2 = blueprint.markV({
    name: "Example Bot 2",
    connected: false,
    deliver: false,
    construction: false,
    transportRoute: true,
    medium: [
        component.mediumStorage()
    ],
    internal: [
        component.internalSpeedModule(),
        // Empty behavior controllers
        component.behaviorController()
    ],
    locks: [
        "metalore",
        "metalbar",
        true,
        false,
        null,
        true,
        "metalore"
    ]
});