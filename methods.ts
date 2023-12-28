export interface MethodInfo {
  id: string;
  in?: number[];
  out?: number | number[];
  exec?: { [key: string]: number | "next" };
  thisArg?: number;
  autoSelf?: boolean;
  loop?: boolean;
  special?: 'txt'|'bp';
  c?: number;
  sub?: string;
}
export const methods: { [key: string]: MethodInfo } = {
  "nop": {
    "id": "nop"
  },
  "call": {
    "id": "call"
  },
  "last": {
    "id": "last"
  },
  "exit": {
    "id": "exit"
  },
  "unlock": {
    "id": "unlock"
  },
  "lock": {
    "id": "lock"
  },
  "label": {
    "id": "label",
    "in": [
      0
    ]
  },
  "jump": {
    "id": "jump",
    "in": [
      0
    ]
  },
  "wait": {
    "id": "wait",
    "in": [
      0
    ]
  },
  "compareItem": {
    "id": "compare_item",
    "exec": {
      "true": "next",
      "false": 0
    },
    "in": [
      1,
      2
    ]
  },
  "compareEntity": {
    "id": "compare_entity",
    "exec": {
      "true": "next",
      "false": 0
    },
    "in": [
      1,
      2
    ]
  },
  "isA": {
    "id": "is_a",
    "thisArg": 1,
    "exec": {
      "true": "next",
      "false": 0
    },
    "in": [
      1,
      2
    ]
  },
  "getType": {
    "id": "get_type",
    "in": [
      0
    ],
    "out": 1
  },
  "type": {
    "id": "value_type",
    "thisArg": 0,
    "exec": {
      "No Match": "next",
      "Item": 1,
      "Entity": 2,
      "Component": 3,
      "Tech": 4,
      "Value": 5,
      "Coord": 6
    },
    "in": [
      0
    ]
  },
  "getFirstLocked0": {
    "id": "get_first_locked_0",
    "out": 0
  },
  "unitType": {
    "id": "unit_type",
    "thisArg": 0,
    "exec": {
      "No Unit": "next",
      "Building": 1,
      "Bot": 2,
      "Construction": 3
    },
    "in": [
      0
    ]
  },
  "selectNearest": {
    "id": "select_nearest",
    "exec": {
      "next": "next",
      "A": 0,
      "B": 1
    },
    "in": [
      2,
      3
    ],
    "out": 4
  },
  "nearerThan": {
    "id": "select_nearest",
    "thisArg": 2,
    "exec": {
      "true": 0,
      "false": 1
    },
    "in": [
      2,
      3
    ]
  },
  "entitiesInRange": {
    "id": "for_entities_in_range",
    "loop": true,
    "exec": {
      "true": "next",
      "false": 5
    },
    "in": [
      0,
      1,
      2,
      3
    ],
    "out": 4
  },
  "availableResearch": {
    "id": "for_research",
    "loop": true,
    "exec": {
      "true": "next",
      "false": 1
    },
    "out": 0
  },
  "getResearch": {
    "id": "get_research",
    "out": 0
  },
  "setResearch": {
    "id": "set_research",
    "in": [
      0
    ]
  },
  "clearResearch": {
    "id": "clear_research",
    "in": [
      0
    ]
  },
  "checkNumber": {
    "id": "check_number",
    "exec": {
      "=": "next",
      ">": 0,
      "<": 1
    },
    "in": [
      2,
      3
    ]
  },
  "setReg": {
    "id": "set_reg",
    "in": [
      0
    ],
    "out": 1
  },
  "setCompReg": {
    "id": "set_comp_reg",
    "in": [
      0,
      1,
      2
    ]
  },
  "getCompReg": {
    "id": "get_comp_reg",
    "in": [
      0,
      2
    ],
    "out": 1
  },
  "setNumber": {
    "id": "set_number",
    "in": [
      0,
      1
    ],
    "out": 2
  },
  "combineCoordinate": {
    "id": "combine_coordinate",
    "in": [
      0,
      1
    ],
    "out": 2
  },
  "separateCoordinate": {
    "id": "separate_coordinate",
    "in": [
      0
    ],
    "out": [
      1,
      2
    ]
  },
  "combineRegister": {
    "id": "combine_register",
    "in": [
      0,
      1,
      3,
      4
    ],
    "out": 2
  },
  "separateRegister": {
    "id": "separate_register",
    "in": [
      0
    ],
    "out": [
      1,
      2,
      3,
      4,
      5
    ]
  },
  "add": {
    "id": "add",
    "in": [
      0,
      1
    ],
    "out": 2
  },
  "sub": {
    "id": "sub",
    "in": [
      0,
      1
    ],
    "out": 2
  },
  "mul": {
    "id": "mul",
    "in": [
      0,
      1
    ],
    "out": 2
  },
  "div": {
    "id": "div",
    "in": [
      0,
      1
    ],
    "out": 2
  },
  "modulo": {
    "id": "modulo",
    "in": [
      0,
      1
    ],
    "out": 2
  },
  "getfreespace": {
    "id": "getfreespace",
    "thisArg": 2,
    "autoSelf": true,
    "in": [
      0,
      2
    ],
    "out": 1
  },
  "haveFreeSpace": {
    "id": "checkfreespace",
    "exec": {
      "false": 0,
      "true": "next"
    },
    "in": [
      1
    ]
  },
  "lockSlots": {
    "id": "lock_slots",
    "in": [
      0,
      1
    ]
  },
  "unlockSlots": {
    "id": "unlock_slots",
    "in": [
      0
    ]
  },
  "getHealth": {
    "id": "get_health",
    "in": [
      0
    ],
    "out": [
      1,
      2,
      3
    ]
  },
  "getEntityAt": {
    "id": "get_entity_at",
    "in": [
      0
    ],
    "out": 1
  },
  "getGridEffeciency": {
    "id": "get_grid_effeciency",
    "out": 0
  },
  "getBattery": {
    "id": "get_battery",
    "out": 0
  },
  "getSelf": {
    "id": "get_self",
    "out": 0
  },
  "readSignal": {
    "id": "read_signal",
    "in": [
      0
    ],
    "out": 1
  },
  "readRadio": {
    "id": "read_radio",
    "in": [
      0
    ],
    "out": 1
  },
  "deprecatedSignals": {
    "id": "for_signal",
    "loop": true,
    "exec": {
      "true": "next",
      "false": 2
    },
    "in": [
      0
    ],
    "out": 1
  },
  "matchingSignals": {
    "id": "for_signal_match",
    "loop": true,
    "exec": {
      "true": "next",
      "false": 3
    },
    "in": [
      0
    ],
    "out": [
      1,
      2
    ]
  },
  "altitude": {
    "id": "check_altitude",
    "thisArg": 0,
    "autoSelf": true,
    "exec": {
      "false": "next",
      "Valley": 1,
      "Plateau": 2
    },
    "in": [
      0
    ]
  },
  "inBlight": {
    "id": "check_blightness",
    "thisArg": 0,
    "autoSelf": true,
    "exec": {
      "true": 1,
      "false": "next"
    },
    "in": [
      0
    ]
  },
  "fullHealth": {
    "id": "check_health",
    "thisArg": 1,
    "autoSelf": true,
    "exec": {
      "true": 0,
      "false": "next"
    },
    "in": [
      1
    ]
  },
  "fullBattery": {
    "id": "check_battery",
    "thisArg": 1,
    "autoSelf": true,
    "exec": {
      "true": 0,
      "false": "next"
    },
    "in": [
      1
    ]
  },
  "fullGridEfficiency": {
    "id": "check_grid_effeciency",
    "thisArg": 1,
    "autoSelf": true,
    "exec": {
      "true": 0,
      "false": "next"
    },
    "in": [
      1
    ]
  },
  "count": {
    "id": "count_item",
    "thisArg": 2,
    "autoSelf": true,
    "in": [
      0,
      2
    ],
    "out": 1
  },
  "countReserved": {
    "id": "count_item",
    "thisArg": 2,
    "autoSelf": true,
    "c": 2,
    "in": [
      0,
      2
    ],
    "out": 1
  },
  "countAllSlots": {
    "id": "count_slots",
    "thisArg": 1,
    "autoSelf": true,
    "in": [
      1
    ],
    "out": 0
  },
  "countStorageSlots": {
    "id": "count_slots",
    "thisArg": 1,
    "autoSelf": true,
    "c": 2,
    "in": [
      1
    ],
    "out": 0
  },
  "countGasSlots": {
    "id": "count_slots",
    "thisArg": 1,
    "autoSelf": true,
    "c": 3,
    "in": [
      1
    ],
    "out": 0
  },
  "countVirusSlots": {
    "id": "count_slots",
    "thisArg": 1,
    "autoSelf": true,
    "c": 4,
    "in": [
      1
    ],
    "out": 0
  },
  "countAnomolySlots": {
    "id": "count_slots",
    "thisArg": 1,
    "autoSelf": true,
    "c": 5,
    "in": [
      1
    ],
    "out": 0
  },
  "getMaxStack": {
    "id": "get_max_stack",
    "in": [
      0
    ],
    "out": 1
  },
  "hasItem": {
    "id": "have_item",
    "thisArg": 2,
    "autoSelf": true,
    "exec": {
      "true": 1,
      "false": "next"
    },
    "in": [
      0,
      2
    ]
  },
  "equip": {
    "id": "equip_component",
    "exec": {
      "false": 0,
      "true": "next"
    },
    "in": [
      1,
      2
    ]
  },
  "unequip": {
    "id": "unequip_component",
    "exec": {
      "false": 0,
      "true": "next"
    },
    "in": [
      1,
      2
    ]
  },
  "getClosestEntity": {
    "id": "get_closest_entity",
    "in": [
      0,
      1,
      2
    ],
    "out": 3
  },
  "match": {
    "id": "match",
    "thisArg": 0,
    "exec": {
      "false": 4,
      "true": "next"
    },
    "in": [
      0,
      1,
      2,
      3
    ]
  },
  "switch": {
    "id": "switch",
    "exec": {
      "1": 2,
      "2": 4,
      "3": 6,
      "4": 8,
      "5": 10,
      "Default": "next"
    },
    "in": [
      0,
      1,
      3,
      5,
      7,
      9
    ]
  },
  "drop": {
    "id": "dodrop",
    "in": [
      0,
      1
    ]
  },
  "dropSpecificAmount": {
    "id": "dodrop",
    "c": 1,
    "in": [
      0,
      1
    ]
  },
  "pickup": {
    "id": "dopickup",
    "in": [
      0,
      1
    ]
  },
  "requestItem": {
    "id": "request_item",
    "in": [
      0
    ]
  },
  "orderToSharedStorage": {
    "id": "order_to_shared_storage"
  },
  "requestWait": {
    "id": "request_wait",
    "in": [
      0
    ]
  },
  "getResourceNum": {
    "id": "get_resource_num",
    "in": [
      0
    ],
    "out": 1
  },
  "firstInventoryItem": {
    "id": "get_inventory_item",
    "exec": {
      "true": "next",
      "false": 1
    },
    "out": 0
  },
  "getInventoryItem": {
    "id": "get_inventory_item_index",
    "exec": {
      "true": "next",
      "false": 2
    },
    "in": [
      0
    ],
    "out": 1
  },
  "inventoryItems": {
    "id": "for_inventory_item",
    "loop": true,
    "exec": {
      "true": "next",
      "false": 1
    },
    "out": [
      0,
      2,
      3,
      4,
      5
    ]
  },
  "recipieIngredients": {
    "id": "for_recipe_ingredients",
    "loop": true,
    "exec": {
      "true": "next",
      "false": 2
    },
    "in": [
      0
    ],
    "out": 1
  },
  "getDistance": {
    "id": "get_distance",
    "thisArg": 2,
    "autoSelf": true,
    "in": [
      0,
      2
    ],
    "out": 1
  },
  "orderTransfer": {
    "id": "order_transfer",
    "in": [
      0,
      1
    ]
  },
  "sameGrid": {
    "id": "is_same_grid",
    "thisArg": 0,
    "exec": {
      "true": "next",
      "false": 2
    },
    "in": [
      0,
      1
    ]
  },
  "isMoving": {
    "id": "is_moving",
    "thisArg": 3,
    "autoSelf": true,
    "exec": {
      "Moving": "next",
      "Not Moving": 0,
      "Path Blocked": 1,
      "No Result": 2
    },
    "in": [
      3
    ]
  },
  "isFixed": {
    "id": "is_fixed",
    "exec": {
      "true": "next",
      "false": 1
    },
    "in": [
      0
    ]
  },
  "isEquipped": {
    "id": "is_equipped",
    "exec": {
      "true": "next",
      "false": 1
    },
    "in": [
      0
    ],
    "out": 2
  },
  "shutdown": {
    "id": "shutdown"
  },
  "turnon": {
    "id": "turnon"
  },
  "connect": {
    "id": "connect"
  },
  "disconnect": {
    "id": "disconnect"
  },
  "enableTransportRoute": {
    "id": "enable_transport_route"
  },
  "disableTransportRoute": {
    "id": "disable_transport_route"
  },
  "sortStorage": {
    "id": "sort_storage"
  },
  "unpackageAll": {
    "id": "unpackage_all",
    "thisArg": 0,
    "autoSelf": true,
    "in": [
      0
    ]
  },
  "packageAll": {
    "id": "package_all",
    "thisArg": 0,
    "autoSelf": true,
    "in": [
      0
    ]
  },
  "solve": {
    "id": "solve",
    "thisArg": 0,
    "exec": {
      "true": 2,
      "false": "next"
    },
    "in": [
      0
    ],
    "out": 1
  },
  "stop": {
    "id": "stop"
  },
  "getLocation": {
    "id": "get_location",
    "in": [
      0
    ],
    "out": 1
  },
  "moveEast": {
    "id": "move_east",
    "in": [
      0
    ]
  },
  "moveWest": {
    "id": "move_west",
    "in": [
      0
    ]
  },
  "moveNorth": {
    "id": "move_north",
    "in": [
      0
    ]
  },
  "moveSouth": {
    "id": "move_south",
    "in": [
      0
    ]
  },
  "domoveAsync": {
    "id": "domove_async",
    "in": [
      0
    ]
  },
  "domove": {
    "id": "domove",
    "in": [
      0
    ]
  },
  "domoveRange": {
    "id": "domove_range",
    "in": [
      0
    ]
  },
  "moveawayRange": {
    "id": "moveaway_range",
    "in": [
      0
    ]
  },
  "scout": {
    "id": "scout"
  },
  "radar": {
    "id": "scan",
    "exec": {
      "true": "next",
      "false": 4
    },
    "in": [
      0,
      1,
      2
    ],
    "out": 3
  },
  "mine": {
    "id": "mine",
    "exec": {
      "ok": "next",
      "unable": 1,
      "full": 2
    },
    "in": [
      0
    ]
  },
  "getStability": {
    "id": "get_stability",
    "out": 0
  },
  "percentValue": {
    "id": "percent_value",
    "in": [
      0,
      1
    ],
    "out": 2
  },
  "remapValue": {
    "id": "remap_value",
    "in": [
      0,
      1,
      2,
      3,
      4
    ],
    "out": 5
  },
  "daytime": {
    "id": "is_daynight",
    "exec": {
      "true": 0,
      "false": 1
    }
  },
  "nighttime": {
    "id": "is_daynight",
    "exec": {
      "false": 0,
      "true": 1
    }
  },
  "factionItemAmount": {
    "id": "faction_item_amount",
    "exec": {
      "true": "next",
      "false": 2
    },
    "in": [
      0
    ],
    "out": 1
  },
  "readkey": {
    "id": "readkey",
    "in": [
      0
    ],
    "out": 1
  },
  "canProduce": {
    "id": "can_produce",
    "exec": {
      "true": 0,
      "false": "next"
    },
    "in": [
      1
    ]
  },
  "getIngredients": {
    "id": "get_ingredients",
    "in": [
      0
    ],
    "out": [
      1,
      2,
      3
    ]
  },
  "notify": {
    "id": "notify",
    "special": "txt",
    "in": [
      0
    ]
  },
  "resourceType": {
    "id": "get_resource_item",
    "thisArg": 0,
    "exec": {
      "true": "next",
      "false": 2
    },
    "in": [
      0
    ],
    "out": 1
  },
  "trust": {
    "id": "gettrust",
    "thisArg": 3,
    "exec": {
      "false": "next",
      "ally": 0,
      "neutral": 1,
      "enemy": 2
    },
    "in": [
      3
    ]
  },
  "gethome": {
    "id": "gethome",
    "out": 0
  },
  "ping": {
    "id": "ping",
    "in": [
      0
    ]
  },
  "build": {
    "id": "build",
    "special": "bp",
    "exec": {
      "true": "next",
      "false": 2
    },
    "in": [
      0,
      1
    ]
  },
  "produce": {
    "id": "produce",
    "special": "bp"
  },
  "setSignpost": {
    "id": "set_signpost",
    "special": "txt"
  },
  "launch": {
    "id": "launch"
  },
  "land": {
    "id": "land"
  },
  "gatherInformation": {
    "id": "gather_information",
    "in": [
      0
    ]
  },
  "makeCarrier": {
    "id": "make_carrier",
    "exec": {
      "true": "next",
      "false": 1
    },
    "in": [
      0
    ]
  },
  "makeMiner": {
    "id": "make_miner",
    "exec": {
      "true": "next",
      "false": 1
    },
    "in": [
      0
    ]
  },
  "serveConstruction": {
    "id": "serve_construction",
    "exec": {
      "true": "next",
      "false": 0
    }
  },
  "makeProducer": {
    "id": "make_producer",
    "exec": {
      "true": "next",
      "false": 4
    },
    "in": [
      0,
      1,
      2,
      3
    ]
  },
  "makeTurretBots": {
    "id": "make_turret_bots",
    "exec": {
      "true": "next",
      "false": 1
    },
    "in": [
      0
    ]
  }
}
