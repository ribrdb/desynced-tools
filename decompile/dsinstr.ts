
interface InstrInfo {
  js?: string;
  c?: number;
  txt?: boolean;
  bp?: boolean;
  conditions?: { [key: string]: boolean | string };
  type: "operator" | "method" | "property" | "function";
  thisArg?: number;
  autoself?: boolean;
  loop?: boolean;
  terminates?: boolean;
  aliases?: Partial<InstrInfo>[];
  inArgs?: number[];
  outArgs?: number[];
  execArgs?: number[];
  optional?: number;
}
export const instructions:{[key:string]:InstrInfo} = {
  "nop": {
    "type": "function"
  },
  "call": {
    "type": "operator"
  },
  "last": {
    "terminates": true,
    "type": "operator"
  },
  "exit": {
    "terminates": true,
    "type": "function"
  },
  "unlock": {
    "type": "function"
  },
  "lock": {
    "type": "function"
  },
  "label": {
    "type": "function",
    "inArgs": [
      0
    ]
  },
  "jump": {
    "type": "function",
    "inArgs": [
      0
    ]
  },
  "wait": {
    "type": "function",
    "inArgs": [
      0
    ]
  },
  "compare_item": {
    "js": "compareItem",
    "type": "operator",
    "inArgs": [
      1,
      2
    ],
    "execArgs": [
      0
    ],
    "conditions": {
      "next": true,
      "If Different": false
    }
  },
  "compare_entity": {
    "js": "compareEntity",
    "type": "operator",
    "inArgs": [
      1,
      2
    ],
    "execArgs": [
      0
    ],
    "conditions": {
      "next": true,
      "If Different": false
    }
  },
  "is_a": {
    "js": "isA",
    "type": "method",
    "inArgs": [
      1,
      2
    ],
    "execArgs": [
      0
    ],
    "conditions": {
      "next": true,
      "If Different": false
    },
    "thisArg": 1
  },
  "get_type": {
    "js": "getType",
    "type": "function",
    "inArgs": [
      0
    ],
    "outArgs": [
      1
    ]
  },
  "value_type": {
    "js": "type",
    "type": "property",
    "inArgs": [
      0
    ],
    "execArgs": [
      1,
      2,
      3,
      4,
      5,
      6
    ],
    "conditions": {
      "next": "No Match",
      "Item": "Item",
      "Entity": "Entity",
      "Component": "Component",
      "Tech": "Tech",
      "Value": "Value",
      "Coord": "Coord"
    },
    "thisArg": 0
  },
  "get_first_locked_0": {
    "js": "getFirstLocked0",
    "type": "function",
    "outArgs": [
      0
    ]
  },
  "unit_type": {
    "js": "unitType",
    "type": "property",
    "inArgs": [
      0
    ],
    "execArgs": [
      1,
      2,
      3
    ],
    "conditions": {
      "next": "No Unit",
      "Building": "Building",
      "Bot": "Bot",
      "Construction": "Construction"
    },
    "thisArg": 0
  },
  "select_nearest": {
    "js": "selectNearest",
    "type": "operator",
    "inArgs": [
      2,
      3
    ],
    "outArgs": [
      4
    ],
    "execArgs": [
      0,
      1
    ],
    "aliases": [
      {
        "js": "nearerThan",
        "type": "method",
        "thisArg": 2,
        "conditions": {
          "A": true,
          "B": false
        },
        "outArgs": []
      }
    ],
    "conditions": {
      "next": "next",
      "A": "A",
      "B": "B"
    }
  },
  "for_entities_in_range": {
    "js": "entitiesInRange",
    "type": "function",
    "inArgs": [
      0,
      1,
      2,
      3
    ],
    "outArgs": [
      4
    ],
    "execArgs": [
      5
    ],
    "loop": true,
    "conditions": {
      "next": true,
      "Done": false
    }
  },
  "for_research": {
    "js": "availableResearch",
    "type": "function",
    "outArgs": [
      0
    ],
    "execArgs": [
      1
    ],
    "loop": true,
    "conditions": {
      "next": true,
      "Done": false
    }
  },
  "get_research": {
    "js": "getResearch",
    "type": "function",
    "outArgs": [
      0
    ]
  },
  "set_research": {
    "js": "setResearch",
    "type": "function",
    "inArgs": [
      0
    ]
  },
  "clear_research": {
    "js": "clearResearch",
    "type": "function",
    "inArgs": [
      0
    ]
  },
  "check_number": {
    "js": "checkNumber",
    "type": "operator",
    "inArgs": [
      2,
      3
    ],
    "execArgs": [
      0,
      1
    ],
    "conditions": {
      "next": "=",
      "If Larger": ">",
      "If Smaller": "<"
    }
  },
  "set_reg": {
    "js": "setReg",
    "type": "operator",
    "inArgs": [
      0
    ],
    "outArgs": [
      1
    ]
  },
  "set_comp_reg": {
    "js": "setCompReg",
    "type": "function",
    "inArgs": [
      0,
      1,
      2
    ],
    "optional": 2
  },
  "get_comp_reg": {
    "js": "getCompReg",
    "type": "function",
    "inArgs": [
      0,
      2
    ],
    "outArgs": [
      1
    ],
    "optional": 1
  },
  "set_number": {
    "js": "setNumber",
    "type": "function",
    "inArgs": [
      0,
      1
    ],
    "outArgs": [
      2
    ]
  },
  "combine_coordinate": {
    "js": "combineCoordinate",
    "type": "function",
    "inArgs": [
      0,
      1
    ],
    "outArgs": [
      2
    ]
  },
  "separate_coordinate": {
    "js": "separateCoordinate",
    "type": "function",
    "inArgs": [
      0
    ],
    "outArgs": [
      1,
      2
    ]
  },
  "combine_register": {
    "js": "combineRegister",
    "type": "function",
    "inArgs": [
      0,
      1,
      3,
      4
    ],
    "outArgs": [
      2
    ],
    "optional": 0
  },
  "separate_register": {
    "js": "separateRegister",
    "type": "function",
    "inArgs": [
      0
    ],
    "outArgs": [
      1,
      2,
      3,
      4,
      5
    ]
  },
  "add": {
    "type": "function",
    "inArgs": [
      0,
      1
    ],
    "outArgs": [
      2
    ]
  },
  "sub": {
    "type": "function",
    "inArgs": [
      0,
      1
    ],
    "outArgs": [
      2
    ]
  },
  "mul": {
    "type": "function",
    "inArgs": [
      0,
      1
    ],
    "outArgs": [
      2
    ]
  },
  "div": {
    "type": "function",
    "inArgs": [
      0,
      1
    ],
    "outArgs": [
      2
    ]
  },
  "modulo": {
    "type": "function",
    "inArgs": [
      0,
      1
    ],
    "outArgs": [
      2
    ]
  },
  "getfreespace": {
    "type": "method",
    "inArgs": [
      0,
      2
    ],
    "outArgs": [
      1
    ],
    "thisArg": 2
  },
  "checkfreespace": {
    "js": "haveFreeSpace",
    "type": "function",
    "inArgs": [
      1
    ],
    "execArgs": [
      0
    ],
    "conditions": {
      "Can't Fit": false,
      "next": true
    }
  },
  "lock_slots": {
    "js": "lockSlots",
    "type": "function",
    "inArgs": [
      0,
      1
    ]
  },
  "unlock_slots": {
    "js": "unlockSlots",
    "type": "function",
    "inArgs": [
      0
    ]
  },
  "get_health": {
    "js": "getHealth",
    "type": "function",
    "inArgs": [
      0
    ],
    "outArgs": [
      1,
      2,
      3
    ]
  },
  "get_entity_at": {
    "js": "getEntityAt",
    "type": "function",
    "inArgs": [
      0
    ],
    "outArgs": [
      1
    ]
  },
  "get_grid_effeciency": {
    "js": "getGridEffeciency",
    "type": "function",
    "outArgs": [
      0
    ]
  },
  "get_battery": {
    "js": "getBattery",
    "type": "function",
    "outArgs": [
      0
    ]
  },
  "get_self": {
    "js": "getSelf",
    "type": "function",
    "outArgs": [
      0
    ]
  },
  "read_signal": {
    "js": "readSignal",
    "type": "function",
    "inArgs": [
      0
    ],
    "outArgs": [
      1
    ]
  },
  "read_radio": {
    "js": "readRadio",
    "type": "function",
    "inArgs": [
      0
    ],
    "outArgs": [
      1
    ]
  },
  "for_signal": {
    "js": "deprecatedSignals",
    "type": "function",
    "inArgs": [
      0
    ],
    "outArgs": [
      1
    ],
    "execArgs": [
      2
    ],
    "loop": true,
    "conditions": {
      "next": true,
      "Done": false
    }
  },
  "for_signal_match": {
    "js": "matchingSignals",
    "type": "function",
    "inArgs": [
      0
    ],
    "outArgs": [
      1,
      2
    ],
    "execArgs": [
      3
    ],
    "loop": true,
    "conditions": {
      "next": true,
      "Done": false
    }
  },
  "check_altitude": {
    "js": "altitude",
    "type": "property",
    "inArgs": [
      0
    ],
    "execArgs": [
      1,
      2
    ],
    "conditions": {
      "next": false,
      "Valley": "Valley",
      "Plateau": "Plateau"
    },
    "thisArg": 0
  },
  "check_blightness": {
    "js": "inBlight",
    "type": "property",
    "inArgs": [
      0
    ],
    "execArgs": [
      1
    ],
    "conditions": {
      "Blight": true,
      "next": false
    },
    "thisArg": 0
  },
  "check_health": {
    "js": "fullHealth",
    "type": "method",
    "inArgs": [
      1
    ],
    "execArgs": [
      0
    ],
    "conditions": {
      "Full": true,
      "next": false
    },
    "thisArg": 1
  },
  "check_battery": {
    "js": "fullBattery",
    "type": "method",
    "inArgs": [
      1
    ],
    "execArgs": [
      0
    ],
    "conditions": {
      "Full": true,
      "next": false
    },
    "thisArg": 1
  },
  "check_grid_effeciency": {
    "js": "fullGridEfficiency",
    "type": "method",
    "inArgs": [
      1
    ],
    "execArgs": [
      0
    ],
    "conditions": {
      "Full": true,
      "next": false
    },
    "thisArg": 1
  },
  "count_item": {
    "js": "count",
    "type": "method",
    "inArgs": [
      0,
      2
    ],
    "outArgs": [
      1
    ],
    "aliases": [
      {
        "js": "countReserved",
        "c": 2
      }
    ],
    "thisArg": 2
  },
  "count_slots": {
    "js": "countAllSlots",
    "type": "method",
    "inArgs": [
      1
    ],
    "outArgs": [
      0
    ],
    "aliases": [
      {
        "js": "countStorageSlots",
        "c": 2
      },
      {
        "js": "countGasSlots",
        "c": 3
      },
      {
        "js": "countVirusSlots",
        "c": 4
      },
      {
        "js": "countAnomolySlots",
        "c": 5
      }
    ],
    "thisArg": 1
  },
  "get_max_stack": {
    "js": "getMaxStack",
    "type": "function",
    "inArgs": [
      0
    ],
    "outArgs": [
      1
    ]
  },
  "have_item": {
    "js": "hasItem",
    "type": "method",
    "inArgs": [
      0,
      2
    ],
    "execArgs": [
      1
    ],
    "thisArg": 2,
    "autoself": true,
    "conditions": {
      "Have Item": true,
      "next": false
    }
  },
  "equip_component": {
    "js": "equip",
    "type": "function",
    "inArgs": [
      1,
      2
    ],
    "execArgs": [
      0
    ],
    "optional": 1,
    "conditions": {
      "No Component": false,
      "next": true
    }
  },
  "unequip_component": {
    "js": "unequip",
    "type": "function",
    "inArgs": [
      1,
      2
    ],
    "execArgs": [
      0
    ],
    "optional": 1,
    "conditions": {
      "No Component": false,
      "next": true
    }
  },
  "get_closest_entity": {
    "js": "getClosestEntity",
    "type": "function",
    "inArgs": [
      0,
      1,
      2
    ],
    "outArgs": [
      3
    ]
  },
  "match": {
    "type": "method",
    "inArgs": [
      0,
      1,
      2,
      3
    ],
    "execArgs": [
      4
    ],
    "conditions": {
      "Failed": false,
      "next": true
    },
    "thisArg": 0
  },
  "switch": {
    "type": "operator",
    "inArgs": [
      0,
      1,
      3,
      5,
      7,
      9
    ],
    "execArgs": [
      2,
      4,
      6,
      8,
      10
    ],
    "conditions": {
      "1": "1",
      "2": "2",
      "3": "3",
      "4": "4",
      "5": "5",
      "next": "Default"
    }
  },
  "dodrop": {
    "js": "drop",
    "type": "function",
    "inArgs": [
      0,
      1
    ],
    "optional": 1,
    "aliases": [
      {
        "js": "dropSpecificAmount",
        "c": 1
      }
    ]
  },
  "dopickup": {
    "js": "pickup",
    "type": "function",
    "inArgs": [
      0,
      1
    ],
    "optional": 1
  },
  "request_item": {
    "js": "requestItem",
    "type": "function",
    "inArgs": [
      0
    ]
  },
  "order_to_shared_storage": {
    "js": "orderToSharedStorage",
    "type": "function"
  },
  "request_wait": {
    "js": "requestWait",
    "type": "function",
    "inArgs": [
      0
    ]
  },
  "get_resource_num": {
    "js": "getResourceNum",
    "type": "function",
    "inArgs": [
      0
    ],
    "outArgs": [
      1
    ]
  },
  "get_inventory_item": {
    "js": "firstInventoryItem",
    "type": "function",
    "outArgs": [
      0
    ],
    "execArgs": [
      1
    ],
    "conditions": {
      "next": true,
      "No Items": false
    }
  },
  "get_inventory_item_index": {
    "js": "getInventoryItem",
    "type": "function",
    "inArgs": [
      0
    ],
    "outArgs": [
      1
    ],
    "execArgs": [
      2
    ],
    "conditions": {
      "next": true,
      "No Item": false
    }
  },
  "for_inventory_item": {
    "js": "inventoryItems",
    "type": "function",
    "outArgs": [
      0,
      2,
      3,
      4,
      5
    ],
    "execArgs": [
      1
    ],
    "loop": true,
    "conditions": {
      "next": true,
      "Done": false
    }
  },
  "for_recipe_ingredients": {
    "js": "recipieIngredients",
    "type": "function",
    "inArgs": [
      0
    ],
    "outArgs": [
      1
    ],
    "execArgs": [
      2
    ],
    "loop": true,
    "conditions": {
      "next": true,
      "Done": false
    }
  },
  "get_distance": {
    "js": "getDistance",
    "type": "method",
    "inArgs": [
      0,
      2
    ],
    "outArgs": [
      1
    ],
    "thisArg": 2
  },
  "order_transfer": {
    "js": "orderTransfer",
    "type": "function",
    "inArgs": [
      0,
      1
    ]
  },
  "is_same_grid": {
    "js": "sameGrid",
    "type": "method",
    "inArgs": [
      0,
      1
    ],
    "execArgs": [
      2
    ],
    "conditions": {
      "next": true,
      "Different": false
    },
    "thisArg": 0
  },
  "is_moving": {
    "js": "isMoving",
    "type": "property",
    "inArgs": [
      3
    ],
    "execArgs": [
      0,
      1,
      2
    ],
    "thisArg": 3,
    "conditions": {
      "next": "Moving",
      "Not Moving": "Not Moving",
      "Path Blocked": "Path Blocked",
      "No Result": "No Result"
    }
  },
  "is_fixed": {
    "js": "isFixed",
    "type": "function",
    "inArgs": [
      0
    ],
    "execArgs": [
      1
    ],
    "conditions": {
      "next": true,
      "Is Fixed": false
    }
  },
  "is_equipped": {
    "js": "isEquipped",
    "type": "function",
    "inArgs": [
      0
    ],
    "outArgs": [
      2
    ],
    "execArgs": [
      1
    ],
    "conditions": {
      "next": true,
      "Component Equipped": false
    }
  },
  "shutdown": {
    "type": "function"
  },
  "turnon": {
    "type": "function"
  },
  "connect": {
    "type": "function"
  },
  "disconnect": {
    "type": "function"
  },
  "enable_transport_route": {
    "js": "enableTransportRoute",
    "type": "function"
  },
  "disable_transport_route": {
    "js": "disableTransportRoute",
    "type": "function"
  },
  "sort_storage": {
    "js": "sortStorage",
    "type": "function"
  },
  "unpackage_all": {
    "js": "unpackageAll",
    "type": "function",
    "inArgs": [
      0
    ],
    "thisArg": 0
  },
  "package_all": {
    "js": "packageAll",
    "type": "function",
    "inArgs": [
      0
    ],
    "thisArg": 0
  },
  "solve": {
    "type": "method",
    "inArgs": [
      0
    ],
    "outArgs": [
      1
    ],
    "execArgs": [
      2
    ],
    "conditions": {
      "Failed": true,
      "next": false
    },
    "thisArg": 0
  },
  "stop": {
    "type": "function"
  },
  "get_location": {
    "js": "getLocation",
    "type": "function",
    "inArgs": [
      0
    ],
    "outArgs": [
      1
    ]
  },
  "move_east": {
    "js": "moveEast",
    "type": "function",
    "inArgs": [
      0
    ]
  },
  "move_west": {
    "js": "moveWest",
    "type": "function",
    "inArgs": [
      0
    ]
  },
  "move_north": {
    "js": "moveNorth",
    "type": "function",
    "inArgs": [
      0
    ]
  },
  "move_south": {
    "js": "moveSouth",
    "type": "function",
    "inArgs": [
      0
    ]
  },
  "domove_async": {
    "js": "domoveAsync",
    "type": "function",
    "inArgs": [
      0
    ]
  },
  "domove": {
    "type": "function",
    "inArgs": [
      0
    ]
  },
  "domove_range": {
    "js": "domoveRange",
    "type": "function",
    "inArgs": [
      0
    ]
  },
  "moveaway_range": {
    "js": "moveawayRange",
    "type": "function",
    "inArgs": [
      0
    ]
  },
  "scout": {
    "type": "function"
  },
  "scan": {
    "js": "radar",
    "type": "function",
    "inArgs": [
      0,
      1,
      2
    ],
    "outArgs": [
      3
    ],
    "execArgs": [
      4
    ],
    "conditions": {
      "next": true,
      "No Result": false
    }
  },
  "mine": {
    "type": "function",
    "inArgs": [
      0
    ],
    "execArgs": [
      1,
      2
    ],
    "conditions": {
      "next": "ok",
      "Cannot Mine": "unable",
      "Full": "full"
    }
  },
  "get_stability": {
    "js": "getStability",
    "type": "function",
    "outArgs": [
      0
    ]
  },
  "percent_value": {
    "js": "percentValue",
    "type": "function",
    "inArgs": [
      0,
      1
    ],
    "outArgs": [
      2
    ]
  },
  "remap_value": {
    "js": "remapValue",
    "type": "function",
    "inArgs": [
      0,
      1,
      2,
      3,
      4
    ],
    "outArgs": [
      5
    ]
  },
  "is_daynight": {
    "js": "daytime",
    "type": "function",
    "execArgs": [
      0,
      1
    ],
    "aliases": [
      {
        "js": "nighttime",
        "conditions": {
          "Day": false,
          "Night": true
        }
      }
    ],
    "conditions": {
      "Day": true,
      "Night": false
    }
  },
  "faction_item_amount": {
    "js": "factionItemAmount",
    "type": "function",
    "inArgs": [
      0
    ],
    "outArgs": [
      1
    ],
    "execArgs": [
      2
    ],
    "conditions": {
      "next": true,
      "None": false
    }
  },
  "readkey": {
    "type": "function",
    "inArgs": [
      0
    ],
    "outArgs": [
      1
    ]
  },
  "can_produce": {
    "js": "canProduce",
    "type": "function",
    "inArgs": [
      1
    ],
    "execArgs": [
      0
    ],
    "conditions": {
      "Can Produce": true,
      "next": false
    }
  },
  "get_ingredients": {
    "js": "getIngredients",
    "type": "function",
    "inArgs": [
      0
    ],
    "outArgs": [
      1,
      2,
      3
    ]
  },
  "notify": {
    "type": "function",
    "inArgs": [
      0
    ],
    "aliases": [
      {
        "txt": true,
        "inArgs": []
      },
      {
        "txt": true
      }
    ]
  },
  "get_resource_item": {
    "js": "resourceType",
    "type": "property",
    "inArgs": [
      0
    ],
    "outArgs": [
      1
    ],
    "execArgs": [
      2
    ],
    "conditions": {
      "next": true,
      "Not Resource": false
    },
    "thisArg": 0
  },
  "gettrust": {
    "js": "trust",
    "type": "property",
    "inArgs": [
      3
    ],
    "execArgs": [
      0,
      1,
      2
    ],
    "conditions": {
      "next": false,
      "Ally": "ally",
      "Neutral": "neutral",
      "Enemy": "enemy"
    },
    "thisArg": 3
  },
  "gethome": {
    "type": "function",
    "outArgs": [
      0
    ]
  },
  "ping": {
    "type": "function",
    "inArgs": [
      0
    ]
  },
  "build": {
    "type": "function",
    "inArgs": [
      0,
      1
    ],
    "execArgs": [
      2
    ],
    "bp": true,
    "optional": 1,
    "conditions": {
      "next": true,
      "Construction Failed": false
    }
  },
  "produce": {
    "type": "function",
    "bp": true
  },
  "set_signpost": {
    "js": "setSignpost",
    "type": "function",
    "txt": true
  },
  "launch": {
    "type": "function"
  },
  "land": {
    "type": "function"
  },
  "gather_information": {
    "js": "gatherInformation",
    "type": "function",
    "inArgs": [
      0
    ]
  },
  "make_carrier": {
    "js": "makeCarrier",
    "type": "function",
    "inArgs": [
      0
    ],
    "execArgs": [
      1
    ],
    "conditions": {
      "next": true,
      "If Working": false
    }
  },
  "make_miner": {
    "js": "makeMiner",
    "type": "function",
    "inArgs": [
      0
    ],
    "execArgs": [
      1
    ],
    "conditions": {
      "next": true,
      "If Working": false
    }
  },
  "serve_construction": {
    "js": "serveConstruction",
    "type": "function",
    "execArgs": [
      0
    ],
    "conditions": {
      "next": true,
      "If Working": false
    }
  },
  "make_producer": {
    "js": "makeProducer",
    "type": "function",
    "inArgs": [
      0,
      1,
      2,
      3
    ],
    "execArgs": [
      4
    ],
    "conditions": {
      "next": true,
      "If Working": false
    }
  },
  "make_turret_bots": {
    "js": "makeTurretBots",
    "type": "function",
    "inArgs": [
      0
    ],
    "execArgs": [
      1
    ],
    "conditions": {
      "next": true,
      "If Working": false
    }
  }
};
