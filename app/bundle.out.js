var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
  get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
}) : x)(function(x) {
  if (typeof require !== "undefined")
    return require.apply(this, arguments);
  throw Error('Dynamic require of "' + x + '" is not supported');
});

// behavior_dts.ts
var behavior_dts = `
declare class Value {
  num: number;
  /**
   * Switch based on type of value
   */
  type: "No Match" | "Item" | "Entity" | "Component" | "Tech" | "Value" | "Coord";
  /**
   * Divert program depending on unit type
   */
  unitType: "No Unit" | "Building" | "Bot" | "Construction";
  /**
   * Divert program depending on location of a unit
   */
  altitude?: "Valley" | "Plateau";
  /**
   * Divert program depending on location of a unit
   */
  inBlight: boolean;
  /**
   * Checks the movement state of an entity
   */
  isMoving: "Moving" | "Not Moving" | "Path Blocked" | "No Result";
  /**
   * Gets the resource type from an resource node
   */
  resourceType?: Value;
  /**
   * Gets the trust level of the unit towards you
   */
  trust?: "ally" | "neutral" | "enemy";

  /**
   * Compares if an item of entity is of a specific type
   */
  isA(type: Value): boolean;
  /**
   * Branches based on which unit is closer, optional branches for closer unit
   */
  nearerThan(unit_b: Value): boolean;
  /**
   * Returns how many of the input item can fit in the inventory
   * @param item Item to check can fit
   * @returns Number of a specific item that can fit on a unit
   */
  getfreespace(item: Value | Item): Value;
  /**
   * Check a units health
   */
  fullHealth(): boolean;
  /**
   * Checks the Battery level of a unit
   */
  fullBattery(): boolean;
  /**
   * Checks the Efficiency of the power grid the unit is on
   */
  fullGridEfficiency(): boolean;
  /**
   * Counts the number of the passed item in its inventory
   * @param item Item to count
   * @returns Number of this item in inventory or empty if none exist
   */
  count(item: Value | Item): Value;
  /**
   * Counts the number of the passed item in its inventory
   * @param item Item to count
   * @returns Number of this item in inventory or empty if none exist
   */
  countReserved(item: Value | Item): Value;
  /**
   * Returns the number of slots in this unit of the given type
   * @returns Number of slots of this type
   */
  countAllSlots(): Value;
  /**
   * Returns the number of slots in this unit of the given type
   * @returns Number of slots of this type
   */
  countStorageSlots(): Value;
  /**
   * Returns the number of slots in this unit of the given type
   * @returns Number of slots of this type
   */
  countGasSlots(): Value;
  /**
   * Returns the number of slots in this unit of the given type
   * @returns Number of slots of this type
   */
  countVirusSlots(): Value;
  /**
   * Returns the number of slots in this unit of the given type
   * @returns Number of slots of this type
   */
  countAnomolySlots(): Value;
  /**
   * Checks if you have at least a specified amount of an item
   * @param item Item to count
   */
  hasItem(item: Value | ItemNum): boolean;
  /**
   * Filters the passed entity
   * @param filter1? Filter to check
   * @param filter2? Second Filter
   * @param filter3? Third Filter
   */
  match(filter1?: Value | RadarFilter, filter2?: Value | RadarFilter, filter3?: Value | RadarFilter): boolean;
  /**
   * Returns distance to a unit
   * @param target Target unit
   * @returns Unit and its distance in the numerical part of the value
   */
  getDistance(target: Value): Value;
  /**
   * Checks if two entities are in the same power grid
   * @param entity Second Entity
   */
  sameGrid(entity: Value): boolean;
  /**
   * Attempt to solve explorable with inventory items
   * @returns Missing repair item, scanner component or Unpowered
   */
  solve(): Value | undefined;
}

/**
 * Instruction has been removed, behavior needs to be updated
 */
declare function nop(): void;
/**
 * Stops execution of the behavior
 */
declare function exit(): never;
/**
 * Run as many instructions as possible. Use wait instructions to throttle execution.
 */
declare function unlock(): void;
/**
 * Run one instruction at a time
 */
declare function lock(): void;
/**
 * Labels can be jumped to from anywhere in a behavior
 * @param label Label identifier
 */
declare function label(label: Value | AnyValue): void;
/**
 * Jumps execution to label with the same label id
 * @param label Label identifier
 */
declare function jump(label: Value | AnyValue): void;
/**
 * Pauses execution of the behavior until 1 or more ticks later
 * @param time Number of ticks to wait
 */
declare function wait(time: Value | number): void;
/**
 * Gets the type from an item or entity
 */
declare function getType(item_entity: Value): Value;
/**
 * Gets the first item where the locked slot exists but there is no item in it
 * @returns The first locked item id with no item
 */
declare function getFirstLocked0(): Value;
/**
 * Performs code for all entities in visibility range of the unit
 * @param range Range (up to units visibility range)
 * @param filter1? Filter to check
 * @param filter2? Second Filter
 * @param filter3? Third Filter
 * @returns Current Entity
 */
declare function entitiesInRange(range: Value | number, filter1?: Value | RadarFilter, filter2?: Value | RadarFilter, filter3?: Value | RadarFilter): IterableIterator<Value>;
/**
 * Performs code for all researchable tech
 * @returns Researchable Tech
 */
declare function availableResearch(): IterableIterator<Value>;
/**
 * Returns the first active research tech
 * @returns First active research
 */
declare function getResearch(): Value;
/**
 * Returns the first active research tech
 * @param tech First active research
 */
declare function setResearch(tech: Value): void;
/**
 * Clears a research from queue, or entire queue if no tech passed
 * @param tech Tech to remove from research queue
 */
declare function clearResearch(tech: Value): void;
/**
 * Writes a value into a component register
 * @param component_index Component and register number to set
 * @param group_index? Component group index if multiple are equipped
 */
declare function setCompReg(value: Value | AnyValue, component_index: Value | CompNum, group_index?: Value | number): void;
/**
 * Reads a value from a component register
 * @param component_index Component and register number to set
 * @param group_index? Component group index if multiple are equipped
 */
declare function getCompReg(component_index: Value | CompNum, group_index?: Value | number): Value;
/**
 * Sets the numerical/coordinate part of a value
 */
declare function setNumber(value: Value, num_coord: Value | CoordNum): Value;
/**
 * Returns a coordinate made from x and y values
 */
declare function combineCoordinate(x: Value | AnyValue, y: Value | AnyValue): Value;
/**
 * Split a coordinate into x and y values
 * @returns [x, y]
 */
declare function separateCoordinate(coordinate: Value | CoordNum): [Value, Value];
/**
 * Combine to make a register from separate parameters
 */
declare function combineRegister(num?: Value, entity?: Value, x?: Value, y?: Value): Value;
/**
 * Split a register into separate parameters
 * @returns [Num, Entity, ID, x, y]
 */
declare function separateRegister(register: Value): [Value, Value, Value, Value, Value];
/**
 * Adds a number or coordinate to another number or coordinate
 */
declare function add(to: Value | CoordNum, num: Value | CoordNum): Value;
/**
 * Subtracts a number or coordinate from another number or coordinate
 */
declare function sub(from: Value | CoordNum, num: Value | CoordNum): Value;
/**
 * Multiplies a number or coordinate from another number or coordinate
 */
declare function mul(to: Value | CoordNum, num: Value | CoordNum): Value;
/**
 * Divides a number or coordinate from another number or coordinate
 */
declare function div(from: Value | CoordNum, num: Value | CoordNum): Value;
/**
 * Get the remainder of a division
 */
declare function modulo(num: Value | CoordNum, by: Value | CoordNum): Value;
/**
 * Checks if free space is available for an item and amount
 * @param item Item and amount to check can fit
 */
declare function haveFreeSpace(item: Value | ItemNum): boolean;
/**
 * Fix all storage slots or a specific item slot index
 * @param item Item type to try fixing to the slots
 * @param slot_index Individual slot to fix
 */
declare function lockSlots(item: Value | ItemNum, slot_index: Value | number): void;
/**
 * Unfix all inventory slots or a specific item slot index
 * @param slot_index Individual slot to unfix
 */
declare function unlockSlots(slot_index: Value | number): void;
/**
 * Gets a units health as a percentage, current and max
 * @param entity Entity to check
 * @returns [Percentage of health remaining, Value of health remaining, Value of maximum health]
 */
declare function getHealth(entity: Value): [Value, Value, Value];
/**
 * Gets the best matching entity at a coordinate
 * @param coordinate Coordinate to get Entity from
 */
declare function getEntityAt(coordinate: Value | CoordNum): Value;
/**
 * Gets the value of the Grid Efficiency as a percent
 */
declare function getGridEffeciency(): Value;
/**
 * Gets the value of the Battery level as a percent
 */
declare function getBattery(): Value;
/**
 * Gets the value of the Unit executing the behavior
 */
declare function getSelf(): Value;
/**
 * Reads the Signal register of another unit
 * @param unit The owned unit to check for
 * @returns Value of units Signal register
 */
declare function readSignal(unit: Value): Value;
/**
 * Reads the Radio signal on a specified band
 * @param band The band to check for
 * @returns Value of the radio signal
 */
declare function readRadio(band: Value): Value;
/**
 * *DEPRECATED* Use Loop Signal (Match) instead
 * @param signal Signal
 * @returns Entity with signal
 */
declare function deprecatedSignals(signal: Value): IterableIterator<Value>;
/**
 * Loops through all units with a signal of similar type
 * @param signal Signal
 * @returns [Entity with signal, Found signal]
 */
declare function matchingSignals(signal: Value): IterableIterator<[Value, Value]>;
/**
 * Returns the amount an item can stack to
 * @param item Item to count
 * @returns Max Stack
 */
declare function getMaxStack(item: Value | ItemNum): Value;
/**
 * Equips a component if it exists
 * @param component Component to equip
 * @param slot_index? Individual slot to equip component from
 */
declare function equip(component: Value | Comp, slot_index?: Value | number): boolean;
/**
 * Unequips a component if it exists
 * @param component Component to unequip
 * @param slot_index? Individual slot to try to unequip component from
 */
declare function unequip(component: Value | Comp, slot_index?: Value | number): boolean;
/**
 * Gets the closest visible entity matching a filter
 * @param filter1? Filter to check
 * @param filter2? Second Filter
 * @param filter3? Third Filter
 * @returns Entity
 */
declare function getClosestEntity(filter1?: Value | RadarFilter, filter2?: Value | RadarFilter, filter3?: Value | RadarFilter): Value;
/**
 * Drop off items at a unit or destination

If a number is set it will drop off an amount to fill the target unit up to that amount
If unset it will try to drop off everything.
 * @param destination Unit or destination to bring items to
 * @param item_amount? Item and amount to drop off
 */
declare function drop(destination: Value, item_amount?: Value | ItemNum): void;
/**
 * Drop off items at a unit or destination

If a number is set it will drop off an amount to fill the target unit up to that amount
If unset it will try to drop off everything.
 * @param destination Unit or destination to bring items to
 * @param item_amount? Item and amount to drop off
 */
declare function dropSpecificAmount(destination: Value, item_amount?: Value | ItemNum): void;
/**
 * Picks up a specific number of items from an entity

Will try to pick up the specified amount, if no amount
is specified it will try to pick up everything.
 * @param source Unit to take items from
 * @param item_amount? Item and amount to pick up
 */
declare function pickup(source: Value, item_amount?: Value | ItemNum): void;
/**
 * Requests an item if it doesn't exist in the inventory
 * @param item Item and amount to order
 */
declare function requestItem(item: Value | ItemNum): void;
/**
 * Request Inventory to be sent to nearest shared storage with corresponding locked slots
 */
declare function orderToSharedStorage(): void;
/**
 * Requests an item and waits until it exists in inventory
 * @param item Item and amount to order
 */
declare function requestWait(item: Value | ItemNum): void;
/**
 * Gets the amount of resource
 * @param resource Resource Node to check
 */
declare function getResourceNum(resource: Value): Value;
/**
 * Reads the first item in your inventory
 */
declare function firstInventoryItem(): Value | undefined;
/**
 * Reads the item contained in the specified slot index
 * @param index Slot index
 */
declare function getInventoryItem(index: Value | number): Value | undefined;
/**
 * Loops through Inventory
 * @returns [Item Inventory, Items reserved for outgoing order or recipe, Items available, Space reserved for an incoming order, Remaining space]
 */
declare function inventoryItems(): IterableIterator<[Value, Value, Value, Value, Value]>;
/**
 * Loops through Ingredients
 * @returns Recipe Ingredient
 */
declare function recipieIngredients(recipe: Value | Item): IterableIterator<Value>;
/**
 * Transfers an Item to another Unit
 * @param target Target unit
 * @param item Item and amount to transfer
 */
declare function orderTransfer(target: Value, item: Value | ItemNum): void;
/**
 * Check if a specific item slot index is fixed
 * @param slot_index Individual slot to check
 */
declare function isFixed(slot_index: Value | number): boolean;
/**
 * Check if a specific component has been equipped
 * @param component Component to check
 * @returns Returns how many instances of a component equipped on this Unit
 */
declare function isEquipped(component: Value | Comp): Value | undefined;
/**
 * Shuts down the power of the Unit
 */
declare function shutdown(): void;
/**
 * Turns on the power of the Unit
 */
declare function turnon(): void;
/**
 * Connects Units from Logistics Network
 */
declare function connect(): void;
/**
 * Disconnects Units from Logistics Network
 */
declare function disconnect(): void;
/**
 * Enable Unit to deliver on transport route
 */
declare function enableTransportRoute(): void;
/**
 * Disable Unit to deliver on transport route
 */
declare function disableTransportRoute(): void;
/**
 * Sorts Storage Containers on Unit
 */
declare function sortStorage(): void;
/**
 * Tries to unpack all packaged items
 */
declare function unpackageAll(): void;
/**
 * Tries to pack all packable units into items
 */
declare function packageAll(): void;
/**
 * Stop movement and abort what is currently controlling the entities movement
 */
declare function stop(): void;
/**
 * Gets location of a a seen entity
 * @param entity Entity to get coordinates of
 * @returns Coordinate of entity
 */
declare function getLocation(entity: Value): Value;
/**
 * Moves towards a tile East of the current location at the specified distance
 * @param number Number of tiles to move East
 */
declare function moveEast(number: Value | number): void;
/**
 * Moves towards a tile West of the current location at the specified distance
 * @param number Number of tiles to move West
 */
declare function moveWest(number: Value | number): void;
/**
 * Moves towards a tile North of the current location at the specified distance
 * @param number Number of tiles to move North
 */
declare function moveNorth(number: Value | number): void;
/**
 * Moves towards a tile South of the current location at the specified distance
 * @param number Number of tiles to move South
 */
declare function moveSouth(number: Value | number): void;
/**
 * Move to another unit while continuing the program
 * @param target Unit to move to
 */
declare function domoveAsync(target: Value): void;
/**
 * Moves to another unit or within a range of another unit
 * @param target Unit to move to, the number specifies the range in which to be in
 */
declare function domove(target: Value): void;
/**
 * *DEPRECATED* Use Move Unit
 * @param target Unit to move to, the number specifies the range in which to be in
 */
declare function domoveRange(target: Value): void;
/**
 * Moves out of range of another unit
 * @param target Unit to move away from
 */
declare function moveawayRange(target: Value): void;
/**
 * Moves in a scouting pattern around the factions home location
 */
declare function scout(): void;
/**
 * Scan for the closest unit that matches the filters
 * @param filter_1? First filter
 * @param filter_2? Second filter
 * @param filter_3? Third filter
 */
declare function radar(filter_1?: Value | RadarFilter, filter_2?: Value | RadarFilter, filter_3?: Value | RadarFilter): Value | undefined;
/**
 * Mines a single resource
 * @param resource Resource to Mine
 */
declare function mine(resource: Value | ResourceNum): "ok" | "unable" | "full";
/**
 * Gets the current world stability
 * @returns Stability
 */
declare function getStability(): Value;
/**
 * Gives you the percent that value is of Max Value
 * @param value Value to check
 * @param max_value Max Value to get percentage of
 * @returns Percent
 */
declare function percentValue(value: Value, max_value: Value): Value;
/**
 * Remaps a value between two ranges
 * @param value Value to Remap
 * @param input_low Low value for input
 * @param input_high High value for input
 * @param target_low Low value for target
 * @param target_high High value for target
 * @returns Remapped value
 */
declare function remapValue(value: Value, input_low: Value, input_high: Value, target_low: Value, target_high: Value): Value;
/**
 * Divert program depending time of day
 */
declare function daytime(): boolean;
/**
 * Divert program depending time of day
 */
declare function nighttime(): boolean;
/**
 * Counts the number of the passed item in your logistics network
 * @param item Item to count
 * @returns Number of this item in your faction
 */
declare function factionItemAmount(item: Value | Item): Value | undefined;
/**
 * Attempts to reads the internal key of the unit
 * @param frame Structure to read the key for
 * @returns Number key of structure
 */
declare function readkey(frame: Value): Value;
/**
 * Returns if a unit can produce an item
 * @param item Production Item
 */
declare function canProduce(item: Value | Item): boolean;
/**
 * Returns the ingredients required to produce an item
 * @returns [First Ingredient, Second Ingredient, Third Ingredient]
 */
declare function getIngredients(product: Value | Item): [Value, Value, Value];
/**
 * Triggers a faction notification
 * @param notify_value Notification Value
 */
declare function notify(notify_value: Value): void;
/**
 * Triggers a faction notification
 */
declare function notify(text: string): void;
/**
 * Triggers a faction notification
 * @param notify_value Notification Value
 */
declare function notify(text: string, notify_value: Value): void;
/**
 * Gets the factions home unit
 * @returns Factions home unit
 */
declare function gethome(): Value;
/**
 * Plays the Ping effect and notifies other players
 * @param target Target unit
 */
declare function ping(target: Value): void;
/**
 * Places a construction site for a specific structure
 * @param coordinate Target location, or at currently location if not specified
 * @param rotation? Building Rotation (0 to 3) (default 0)
 */
declare function build(coordinate: Value | CoordNum, rotation?: Value | number): boolean;
/**
 * Sets a production component to produce a blueprint
 */
declare function produce(): void;
/**
 * Set the signpost to specific text
 */
declare function setSignpost(text: string): void;
/**
 * Launches a satellite if equipped on an AMAC
 */
declare function launch(): void;
/**
 * Tells a satellite that has been launched to land
 */
declare function land(): void;
/**
 * Collect information for running the auto base controller
 * @param range Range of operation
 */
declare function gatherInformation(range: Value | number): void;
/**
 * Construct carrier bots for delivering orders or to use for other tasks
 * @param carriers Type and count of carriers to make
 */
declare function makeCarrier(carriers: Value | FrameNum): boolean;
/**
 * Construct and equip miner components on available carrier bots
 * @param resource_count Resource type and number of miners to maintain
 */
declare function makeMiner(resource_count: Value | ItemNum): boolean;
/**
 * Produce materials needed in construction sites
 */
declare function serveConstruction(): boolean;
/**
 * Build and maintain dedicated production buildings
 * @param item_count Item type and number of producers to maintain
 * @param component Production component
 * @param building Building type to use as producer
 * @param location Location offset from self
 */
declare function makeProducer(item_count: Value | ItemNum, component: Value | Comp, building: Value | Frame, location: Value | Coord): boolean;
/**
 * Construct and equip turret components on available carrier bots
 * @param number Number of turret bots to maintain
 */
declare function makeTurretBots(number: Value | number): boolean;

declare const self: Value;
declare var goto: Value;
declare var store: Value;
declare var visual: Value;
declare var signal: Value;

type AnyValue = Coord | ItemNum | FrameNum | RadarFilter;
type Coord = [number, number];
type CoordNum = Coord | number;

type RadarFilter =
  | Resource
  | "v_own_faction"
  | "v_ally_faction"
  | "v_enemy_faction"
  | "v_world_faction"
  | "v_bot"
  | "v_building"
  | "v_is_foundation"
  | "v_construction"
  | "v_droppeditem"
  | "v_resource"
  | "v_mineable"
  | "v_anomaly"
  | "v_valley"
  | "v_plateau"
  | "v_not_blight"
  | "v_blight"
  | "v_alien_faction"
  | "v_human_faction"
  | "v_robot_faction"
  | "v_bug_faction"
  | "v_solved"
  | "v_unsolved"
  | "v_can_loot"
  | "v_in_powergrid"
  | "v_mothership"
  | "v_damaged"
  | "v_infected"
  | "v_broken"
  | "v_unpowered"
  | "v_emergency"
  | "v_powereddown"
  | "v_pathblocked"
  | "v_idle";

type Item =
  | Comp
  | "metalore"
  | "crystal"
  | "laterite"
  | "aluminiumrod"
  | "aluminiumsheet"
  | "silica"
  | "fused_electrodes"
  | "reinforced_plate"
  | "optic_cable"
  | "circuit_board"
  | "infected_circuit_board"
  | "obsidian"
  | "metalbar"
  | "metalplate"
  | "foundationplate"
  | "ldframe"
  | "energized_plate"
  | "hdframe"
  | "beacon_frame"
  | "refined_crystal"
  | "crystal_powder"
  | "obsidian_brick"
  | "alien_artifact"
  | "alien_artifact_research"
  | "silicon"
  | "wire"
  | "cable"
  | "icchip"
  | "micropro"
  | "cpu"
  | "steelblock"
  | "concreteslab"
  | "ceramictiles"
  | "polymer"
  | "robot_datacube"
  | "alien_datacube"
  | "human_datacube"
  | "blight_datacube"
  | "virus_research_data"
  | "empty_databank"
  | "datacube_matrix"
  | "robot_research"
  | "human_research"
  | "alien_research"
  | "blight_research"
  | "virus_research"
  | "adv_data"
  | "human_databank"
  | "alien_databank"
  | "drone_transfer_package"
  | "drone_transfer_package2"
  | "drone_miner_package"
  | "drone_adv_miner_package"
  | "drone_defense_package1"
  | "flyer_package_m"
  | "satellite_package"
  | "blight_crystal"
  | "blight_extraction"
  | "blightbar"
  | "blight_plasma"
  | "microscope"
  | "transformer"
  | "smallreactor"
  | "engine"
  | "datakey"
  | "alien_core"
  | "bot_ai_core"
  | "elain_ai_core"
  | "broken_ai_core"
  | "bug_carapace"
  | "anomaly_particle"
  | "anomaly_cluster"
  | "resimulator_core"
  | "power_petal"
  | "phase_leaf"
  | "virus_source_code"
  | "rainbow_research";

type ItemNum = Item | number | { id: Item; num: number };
type Comp =
  | "c_refinery"
  | "c_robotics_factory"
  | "c_small_relay"
  | "c_large_power_relay"
  | "c_solar_panel"
  | "c_capacitor"
  | "c_higrade_capacitor"
  | "c_small_battery"
  | "c_shared_storage"
  | "c_internal_storage"
  | "c_autobase"
  | "c_portablecrane"
  | "c_internal_crane1"
  | "c_internal_crane2"
  | "c_radio_storage"
  | "c_modulehealth_s"
  | "c_modulehealth_m"
  | "c_modulehealth_l"
  | "c_modulevisibility_s"
  | "c_modulevisibility_m"
  | "c_modulevisibility_l"
  | "c_moduleefficiency_s"
  | "c_moduleefficiency_m"
  | "c_moduleefficiency_l"
  | "c_modulespeed_s"
  | "c_modulespeed_m"
  | "c_modulespeed_l"
  | "c_particle_leaves"
  | "c_glitch"
  | "c_damageself"
  | "c_small_storage"
  | "c_destroyself"
  | "c_phase_plant"
  | "c_damage_plant"
  | "c_damage_plant_internal"
  | "c_large_storage"
  | "c_fusion_generator"
  | "c_battery"
  | "c_large_battery"
  | "c_large_power_transmitter"
  | "c_medium_storage"
  | "c_blight_container_i"
  | "c_blight_container_s"
  | "c_blight_container_m"
  | "c_virus_decomposer"
  | "c_alien_attack"
  | "c_alien_extractor"
  | "c_alien_factory"
  | "c_human_refinery"
  | "c_human_factory_robots"
  | "c_human_science_analyzer_robots"
  | "c_human_commandcenter"
  | "c_human_barracks"
  | "c_human_spaceport"
  | "c_human_science"
  | "c_alien_research";
type CompNum = Comp | number | { id: Comp; num: number };

type Resource =
  | "metalore"
  | "crystal"
  | "laterite"
  | "silica"
  | "obsidian"
  | "alien_artifact"
  | "alien_artifact_research"
  | "blight_crystal"
  | "blight_extraction"
  | "bug_carapace";
type ResourceNum = Resource | number | { id: Resource; num: number };
type Frame =
  | "f_building1x1a"
  | "f_building1x1b"
  | "f_building1x1c"
  | "f_building1x1d"
  | "f_building1x1f"
  | "f_building1x1g"
  | "f_building2x1a"
  | "f_building2x1e"
  | "f_building2x1f"
  | "f_building2x1g"
  | "f_building2x2b"
  | "f_building2x2f"
  | "f_bot_1s_as"
  | "f_bot_1s_adw"
  | "f_bot_2m_as"
  | "f_bot_1s_a"
  | "f_bot_1s_b"
  | "f_bot_2s"
  | "f_construction"
  | "f_foundation"
  | "f_human_foundation"
  | "f_human_foundation_basic"
  | "f_feature"
  | "f_blocking_feature"
  | "f_floating_feature"
  | "f_dropped_resource"
  | "f_building1x1e"
  | "f_building2x1b"
  | "f_building2x1c"
  | "f_building2x1d"
  | "f_building2x2a"
  | "f_building2x2c"
  | "f_building2x2d"
  | "f_building2x2e"
  | "f_building_pf"
  | "f_transport_bot"
  | "f_bot_1m1s"
  | "f_bot_1m_b"
  | "f_bot_1m_c"
  | "f_bot_1l_a"
  | "f_flyer_bot"
  | "f_drone_transfer_a"
  | "f_drone_transfer_a2"
  | "f_drone_miner_a"
  | "f_drone_adv_miner"
  | "f_drone_defense_a"
  | "f_flyer_m"
  | "f_satellite"
  | "f_building3x2a"
  | "f_building3x2b"
  | "f_building_fg"
  | "f_human_flyer"
  | "f_human_tank"
  | "f_human_miner"
  | "f_alienbot"
  | "f_human_explorable_5x5_a"
  | "f_carrier_bot";
type FrameNum = Frame | number | { id: Frame; num: number };
`;

// asm.monarch.js
var asmSyntax = {
  // Set defaultToken to invalid to see what you do not tokenize yet
  // defaultToken: 'invalid',
  keywords: [
    "nil",
    "true",
    "false",
    "self",
    "signal",
    "visual",
    "goto",
    "store"
  ],
  // this came from an example, not sure if it really matches json escapes.
  escapes: /\\(?:[abfnrtv\\"']|x[0-9A-Fa-f]{1,4}|u[0-9A-Fa-f]{4}|U[0-9A-Fa-f]{8})/,
  // The main tokenizer for our languages
  tokenizer: {
    root: [
      // identifiers and keywords
      [/\w+:|:\w+/, "type.identifier"],
      // to show labels nicely
      [/p\d+|[A-Z]/, "variable"],
      [/\$\w+(?==)/, "attribute.name"],
      [/[a-z_]\w+/, { cases: {
        "@keywords": "keyword",
        "@default": "identifier"
      } }],
      // whitespace
      { include: "@whitespace" },
      // numbers
      [/\d+/, "number"],
      // strings
      [/"([^"\\]|\\.)*$/, "string.invalid"],
      // non-teminated string
      [/"/, { token: "string.quote", bracket: "@open", next: "@string" }]
    ],
    string: [
      [/[^\\"]+/, "string"],
      [/@escapes/, "string.escape"],
      [/\\./, "string.escape.invalid"],
      [/"/, { token: "string.quote", bracket: "@close", next: "@pop" }]
    ],
    whitespace: [
      [/[ \t\r\n]+/, "white"],
      [/;.*$/, "comment"]
    ]
  }
};

// dsconvert.js
function DesyncedStringToObject(str, info) {
  if (str.length > 10 * 1024 * 1024)
    throw new Error("Input string is over 10MB");
  var b62 = new Uint8Array(str.length), idx = 0, idxend = b62.length;
  for (var i = 0, j = str.length; i != j; i++)
    b62[i] = str.charCodeAt(i);
  const Base62_CharToByte = [255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 255, 255, 255, 255, 255, 255, 255, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 255, 255, 255, 255, 255, 255, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255];
  function Base62_IsValidChar(c) {
    return Base62_CharToByte[c] != 255;
  }
  function Base62_GetEncodedU32Size2(u) {
    for (var n = 1; ; n++)
      if (!(u = u / 31 | 0))
        return n;
  }
  function Base62_GetEncodedDataSize2(datalen) {
    return ((datalen * 6 + 2) / 4 | 0) + 1;
  }
  function Base62_ReadU32(b622, idx2, idxend2) {
    for (var u = 0; idx2 != idxend2; ) {
      var c = b622[idx2++], b = Base62_CharToByte[c];
      if (b == 255) {
        if (c <= 32)
          continue;
        return 0;
      }
      u = u * 31 + b % 31;
      if (b >= 31)
        return u;
    }
    return 0;
  }
  function Base62_ReadData(b622, idx2, idxend2) {
    if (idx2 >= idxend2)
      return;
    var idxchecksum = idxend2 - 1;
    var data = new Uint8Array((idxchecksum - idx2) * 4 / 6 | 0);
    var datalen = 0, chksum = 0;
    while (idx2 != idxchecksum) {
      var bits = 0, i2 = 0;
      while (i2 != 6 && idx2 != idxchecksum) {
        var c = b622[idx2++], b = Base62_CharToByte[c];
        if (b == 255) {
          if (c <= 32)
            continue;
          return;
        }
        bits = bits * 62 + b;
        i2++;
      }
      chksum = (chksum + bits) % 4294967296;
      switch (i2) {
        case 6:
          data[datalen++] = bits & 255;
          bits >>= 8;
        case 5:
          data[datalen++] = bits & 255;
          bits >>= 8;
        case 3:
          data[datalen++] = bits & 255;
          bits >>= 8;
        case 2:
          data[datalen++] = bits & 255;
          break;
      }
    }
    if (Base62_CharToByte[b622[idx2]] != chksum % 62)
      return;
    return datalen == data.length ? data : data.slice(0, datalen);
  }
  while (idx < idxend && !Base62_IsValidChar(b62[idx]))
    idx++;
  while (idxend > idx && !Base62_IsValidChar(b62[idxend - 1]))
    idxend--;
  if (idxend - idx < 5)
    throw new Error("Input string is too short");
  if (b62[idx] != 68 || b62[idx + 1] != 83)
    throw new Error("Input string does not begin with the prefix 'DS'");
  if (info)
    info.type = String.fromCharCode(b62[idx + 2]);
  var decompressLen = Base62_ReadU32(b62, idx += 3, idxend);
  if (decompressLen > 20 * 1024 * 1024)
    throw new Error("Input data is over 20MB");
  idx += Base62_GetEncodedU32Size2(decompressLen);
  var buf = Base62_ReadData(b62, idx, idxend);
  if (decompressLen && buf) {
    (function() {
      "use strict";
      var l = void 0, aa = globalThis;
      function r(c, d) {
        var a = c.split("."), b = aa;
        !(a[0] in b) && b.execScript && b.execScript("var " + a[0]);
        for (var e; a.length && (e = a.shift()); )
          !a.length && d !== l ? b[e] = d : b = b[e] ? b[e] : b[e] = {};
      }
      ;
      var t = "undefined" !== typeof Uint8Array && "undefined" !== typeof Uint16Array && "undefined" !== typeof Uint32Array && "undefined" !== typeof DataView;
      function v2(c) {
        var d = c.length, a = 0, b = Number.POSITIVE_INFINITY, e, f, g, h, k, m, n, p2, s, x;
        for (p2 = 0; p2 < d; ++p2)
          c[p2] > a && (a = c[p2]), c[p2] < b && (b = c[p2]);
        e = 1 << a;
        f = new (t ? Uint32Array : Array)(e);
        g = 1;
        h = 0;
        for (k = 2; g <= a; ) {
          for (p2 = 0; p2 < d; ++p2)
            if (c[p2] === g) {
              m = 0;
              n = h;
              for (s = 0; s < g; ++s)
                m = m << 1 | n & 1, n >>= 1;
              x = g << 16 | p2;
              for (s = m; s < e; s += k)
                f[s] = x;
              ++h;
            }
          ++g;
          h <<= 1;
          k <<= 1;
        }
        return [f, a, b];
      }
      ;
      function w(c, d) {
        this.g = [];
        this.h = 32768;
        this.d = this.f = this.a = this.l = 0;
        this.input = t ? new Uint8Array(c) : c;
        this.m = false;
        this.i = y;
        this.r = false;
        if (d || !(d = {}))
          d.index && (this.a = d.index), d.bufferSize && (this.h = d.bufferSize), d.bufferType && (this.i = d.bufferType), d.resize && (this.r = d.resize);
        switch (this.i) {
          case A:
            this.b = 32768;
            this.c = new (t ? Uint8Array : Array)(32768 + this.h + 258);
            break;
          case y:
            this.b = 0;
            this.c = new (t ? Uint8Array : Array)(this.h);
            this.e = this.z;
            this.n = this.v;
            this.j = this.w;
            break;
          default:
            throw Error("invalid inflate mode");
        }
      }
      var A = 0, y = 1, B = { t: A, s: y };
      w.prototype.k = function() {
        for (; !this.m; ) {
          var c = C(this, 3);
          c & 1 && (this.m = true);
          c >>>= 1;
          switch (c) {
            case 0:
              var d = this.input, a = this.a, b = this.c, e = this.b, f = d.length, g = l, h = l, k = b.length, m = l;
              this.d = this.f = 0;
              if (a + 1 >= f)
                throw Error("invalid uncompressed block header: LEN");
              g = d[a++] | d[a++] << 8;
              if (a + 1 >= f)
                throw Error("invalid uncompressed block header: NLEN");
              h = d[a++] | d[a++] << 8;
              if (g === ~h)
                throw Error("invalid uncompressed block header: length verify");
              if (a + g > d.length)
                throw Error("input buffer is broken");
              switch (this.i) {
                case A:
                  for (; e + g > b.length; ) {
                    m = k - e;
                    g -= m;
                    if (t)
                      b.set(d.subarray(a, a + m), e), e += m, a += m;
                    else
                      for (; m--; )
                        b[e++] = d[a++];
                    this.b = e;
                    b = this.e();
                    e = this.b;
                  }
                  break;
                case y:
                  for (; e + g > b.length; )
                    b = this.e({ p: 2 });
                  break;
                default:
                  throw Error("invalid inflate mode");
              }
              if (t)
                b.set(d.subarray(a, a + g), e), e += g, a += g;
              else
                for (; g--; )
                  b[e++] = d[a++];
              this.a = a;
              this.b = e;
              this.c = b;
              break;
            case 1:
              this.j(ba, ca);
              break;
            case 2:
              for (var n = C(this, 5) + 257, p2 = C(this, 5) + 1, s = C(this, 4) + 4, x = new (t ? Uint8Array : Array)(D.length), S = l, T = l, U = l, u = l, M = l, F = l, z = l, q = l, V = l, q = 0; q < s; ++q)
                x[D[q]] = C(this, 3);
              if (!t) {
                q = s;
                for (s = x.length; q < s; ++q)
                  x[D[q]] = 0;
              }
              S = v2(x);
              u = new (t ? Uint8Array : Array)(n + p2);
              q = 0;
              for (V = n + p2; q < V; )
                switch (M = E(this, S), M) {
                  case 16:
                    for (z = 3 + C(this, 2); z--; )
                      u[q++] = F;
                    break;
                  case 17:
                    for (z = 3 + C(this, 3); z--; )
                      u[q++] = 0;
                    F = 0;
                    break;
                  case 18:
                    for (z = 11 + C(this, 7); z--; )
                      u[q++] = 0;
                    F = 0;
                    break;
                  default:
                    F = u[q++] = M;
                }
              T = t ? v2(u.subarray(0, n)) : v2(u.slice(0, n));
              U = t ? v2(u.subarray(n)) : v2(u.slice(n));
              this.j(T, U);
              break;
            default:
              throw Error("unknown BTYPE: " + c);
          }
        }
        return this.n();
      };
      var G = [16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15], D = t ? new Uint16Array(G) : G, H = [3, 4, 5, 6, 7, 8, 9, 10, 11, 13, 15, 17, 19, 23, 27, 31, 35, 43, 51, 59, 67, 83, 99, 115, 131, 163, 195, 227, 258, 258, 258], I = t ? new Uint16Array(H) : H, J = [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 0, 0, 0], K = t ? new Uint8Array(J) : J, L = [1, 2, 3, 4, 5, 7, 9, 13, 17, 25, 33, 49, 65, 97, 129, 193, 257, 385, 513, 769, 1025, 1537, 2049, 3073, 4097, 6145, 8193, 12289, 16385, 24577], da = t ? new Uint16Array(L) : L, ea = [0, 0, 0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11, 11, 12, 12, 13, 13], N = t ? new Uint8Array(ea) : ea, O = new (t ? Uint8Array : Array)(288), P, fa;
      P = 0;
      for (fa = O.length; P < fa; ++P)
        O[P] = 143 >= P ? 8 : 255 >= P ? 9 : 279 >= P ? 7 : 8;
      var ba = v2(O), Q = new (t ? Uint8Array : Array)(30), R, ga;
      R = 0;
      for (ga = Q.length; R < ga; ++R)
        Q[R] = 5;
      var ca = v2(Q);
      function C(c, d) {
        for (var a = c.f, b = c.d, e = c.input, f = c.a, g = e.length, h; b < d; ) {
          if (f >= g)
            throw Error("input buffer is broken");
          a |= e[f++] << b;
          b += 8;
        }
        h = a & (1 << d) - 1;
        c.f = a >>> d;
        c.d = b - d;
        c.a = f;
        return h;
      }
      function E(c, d) {
        for (var a = c.f, b = c.d, e = c.input, f = c.a, g = e.length, h = d[0], k = d[1], m, n; b < k && !(f >= g); )
          a |= e[f++] << b, b += 8;
        m = h[a & (1 << k) - 1];
        n = m >>> 16;
        if (n > b)
          throw Error("invalid code length: " + n);
        c.f = a >> n;
        c.d = b - n;
        c.a = f;
        return m & 65535;
      }
      w.prototype.j = function(c, d) {
        var a = this.c, b = this.b;
        this.o = c;
        for (var e = a.length - 258, f, g, h, k; 256 !== (f = E(this, c)); )
          if (256 > f)
            b >= e && (this.b = b, a = this.e(), b = this.b), a[b++] = f;
          else {
            g = f - 257;
            k = I[g];
            0 < K[g] && (k += C(this, K[g]));
            f = E(this, d);
            h = da[f];
            0 < N[f] && (h += C(this, N[f]));
            b >= e && (this.b = b, a = this.e(), b = this.b);
            for (; k--; )
              a[b] = a[b++ - h];
          }
        for (; 8 <= this.d; )
          this.d -= 8, this.a--;
        this.b = b;
      };
      w.prototype.w = function(c, d) {
        var a = this.c, b = this.b;
        this.o = c;
        for (var e = a.length, f, g, h, k; 256 !== (f = E(this, c)); )
          if (256 > f)
            b >= e && (a = this.e(), e = a.length), a[b++] = f;
          else {
            g = f - 257;
            k = I[g];
            0 < K[g] && (k += C(this, K[g]));
            f = E(this, d);
            h = da[f];
            0 < N[f] && (h += C(this, N[f]));
            b + k > e && (a = this.e(), e = a.length);
            for (; k--; )
              a[b] = a[b++ - h];
          }
        for (; 8 <= this.d; )
          this.d -= 8, this.a--;
        this.b = b;
      };
      w.prototype.e = function() {
        var c = new (t ? Uint8Array : Array)(this.b - 32768), d = this.b - 32768, a, b, e = this.c;
        if (t)
          c.set(e.subarray(32768, c.length));
        else {
          a = 0;
          for (b = c.length; a < b; ++a)
            c[a] = e[a + 32768];
        }
        this.g.push(c);
        this.l += c.length;
        if (t)
          e.set(e.subarray(d, d + 32768));
        else
          for (a = 0; 32768 > a; ++a)
            e[a] = e[d + a];
        this.b = 32768;
        return e;
      };
      w.prototype.z = function(c) {
        var d, a = this.input.length / this.a + 1 | 0, b, e, f, g = this.input, h = this.c;
        c && ("number" === typeof c.p && (a = c.p), "number" === typeof c.u && (a += c.u));
        2 > a ? (b = (g.length - this.a) / this.o[2], f = 258 * (b / 2) | 0, e = f < h.length ? h.length + f : h.length << 1) : e = h.length * a;
        t ? (d = new Uint8Array(e), d.set(h)) : d = h;
        return this.c = d;
      };
      w.prototype.n = function() {
        var c = 0, d = this.c, a = this.g, b, e = new (t ? Uint8Array : Array)(this.l + (this.b - 32768)), f, g, h, k;
        if (0 === a.length)
          return t ? this.c.subarray(32768, this.b) : this.c.slice(32768, this.b);
        f = 0;
        for (g = a.length; f < g; ++f) {
          b = a[f];
          h = 0;
          for (k = b.length; h < k; ++h)
            e[c++] = b[h];
        }
        f = 32768;
        for (g = this.b; f < g; ++f)
          e[c++] = d[f];
        this.g = [];
        return this.buffer = e;
      };
      w.prototype.v = function() {
        var c, d = this.b;
        t ? this.r ? (c = new Uint8Array(d), c.set(this.c.subarray(0, d))) : c = this.c.subarray(0, d) : (this.c.length > d && (this.c.length = d), c = this.c);
        return this.buffer = c;
      };
      function W(c, d) {
        var a, b;
        this.input = c;
        this.a = 0;
        if (d || !(d = {}))
          d.index && (this.a = d.index), d.verify && (this.A = d.verify);
        a = c[this.a++];
        b = c[this.a++];
        switch (a & 15) {
          case ha:
            this.method = ha;
            break;
          default:
            throw Error("unsupported compression method");
        }
        if (0 !== ((a << 8) + b) % 31)
          throw Error("invalid fcheck flag:" + ((a << 8) + b) % 31);
        if (b & 32)
          throw Error("fdict flag is not supported");
        this.q = new w(c, { index: this.a, bufferSize: d.bufferSize, bufferType: d.bufferType, resize: d.resize });
      }
      W.prototype.k = function() {
        var c = this.input, d, a;
        d = this.q.k();
        this.a = this.q.a;
        if (this.A) {
          a = (c[this.a++] << 24 | c[this.a++] << 16 | c[this.a++] << 8 | c[this.a++]) >>> 0;
          var b = d;
          if ("string" === typeof b) {
            var e = b.split(""), f, g;
            f = 0;
            for (g = e.length; f < g; f++)
              e[f] = (e[f].charCodeAt(0) & 255) >>> 0;
            b = e;
          }
          for (var h = 1, k = 0, m = b.length, n, p2 = 0; 0 < m; ) {
            n = 1024 < m ? 1024 : m;
            m -= n;
            do
              h += b[p2++], k += h;
            while (--n);
            h %= 65521;
            k %= 65521;
          }
          if (a !== (k << 16 | h) >>> 0)
            throw Error("invalid adler-32 checksum");
        }
        return d;
      };
      var ha = 8;
      r("Zlib.Inflate", W);
      r("Zlib.Inflate.prototype.decompress", W.prototype.k);
      var X = { ADAPTIVE: B.s, BLOCK: B.t }, Y, Z, $, ia;
      if (Object.keys)
        Y = Object.keys(X);
      else
        for (Z in Y = [], $ = 0, X)
          Y[$++] = Z;
      $ = 0;
      for (ia = Y.length; $ < ia; ++$)
        Z = Y[$], r("Zlib.Inflate.BufferType." + Z, X[Z]);
    }).call(this);
    try {
      buf = new Zlib.Inflate(buf, { "bufferSize": decompressLen, "verify": true }).decompress();
    } catch {
      throw new Error("Error during decompression of input data");
    }
  }
  if (!buf)
    throw new Error("Failed to decode input string");
  const MP_FixZero = 0, MP_FixMap = 128, MP_FixArray = 144, MP_FixStr = 160, MP_Nil = 192, MP_False = 194, MP_True = 195, MP_Float32 = 202, MP_Float64 = 203, MP_Uint8 = 204, MP_Uint16 = 205, MP_Uint32 = 206, MP_Uint64 = 207, MP_Int8 = 208, MP_Int16 = 209, MP_Int32 = 210, MP_Int64 = 211, MP_Str8 = 217, MP_Str16 = 218, MP_Str32 = 219, MP_Array16 = 220, MP_Array32 = 221, MP_Map16 = 222, MP_Map32 = 223, MP_DESYNCED_INVALID = 196, MP_DESYNCED_DEADKEY = 197, MP_DESYNCED_USERDATA = 193;
  const v = new DataView(buf.buffer);
  const utf8 = new (typeof process === "object" ? __require("util").TextDecoder : TextDecoder)();
  var p = 0;
  function Parse(is_table_key) {
    function GetIntPacked() {
      var res = 0, cnt = 0;
      do {
        var b = buf[p++];
        res |= b >> 1 << 7 * cnt++;
      } while (b & 1);
      return res;
    }
    function ParseTable(sz, is_map) {
      if (is_table_key)
        throw new Error("Unable to parse table key of type 'table'");
      if (sz > 5e6)
        throw new Error("Unable to parse table with too many items");
      var size_node = 0, size_array = 0;
      if (is_map) {
        size_node = 1 << (sz >> 1);
        if (sz & 1)
          size_array = GetIntPacked();
        if (size_node > 5e6 || size_array > 5e6)
          throw new Error("Unable to parse invalid table");
        GetIntPacked();
      } else
        size_array = sz;
      var t = is_map ? {} : [];
      for (var i2 = 0, total = size_array + size_node; i2 != total; ) {
        for (var vacancy_bits = buf[p++], mask = 1, iEnd = Math.min(total, i2 + 8); i2 != iEnd; i2++, mask <<= 1) {
          if (vacancy_bits & mask)
            continue;
          var val = Parse();
          if (i2 < size_array) {
            t[i2] = val;
          } else {
            if (buf[p] == MP_DESYNCED_DEADKEY) {
              p++;
              GetIntPacked();
              continue;
            }
            t[Parse(true)] = val;
            GetIntPacked();
          }
        }
      }
      return t;
    }
    var type = buf[p++], q;
    switch (type) {
      case MP_Nil:
        return void 0;
      case MP_False:
        return false;
      case MP_True:
        return true;
      case MP_Float32:
        p += 4;
        return v.getFloat32(p - 4, true);
      case MP_Float64:
        p += 8;
        return v.getFloat64(p - 8, true);
      case MP_Uint8:
        p += 1;
        return v.getUint8(p - 1, true);
      case MP_Uint16:
        p += 2;
        return v.getUint16(p - 2, true);
      case MP_Uint32:
        p += 4;
        return v.getUint32(p - 4, true);
      case MP_Uint64:
        p += 8;
        return v.getBigUint64(p - 8, true);
      case MP_Int8:
        p += 1;
        return v.getInt8(p - 1, true);
      case MP_Int16:
        p += 2;
        return v.getInt16(p - 2, true);
      case MP_Int32:
        p += 4;
        return v.getInt32(p - 4, true);
      case MP_Int64:
        p += 8;
        return v.getBigInt64(p - 8, true);
      case MP_FixZero:
        return 0;
      case MP_Str8:
        p += 1;
        q = p;
        p += v.getUint8(p - 1, true);
        return utf8.decode(buf.subarray(q, p));
      case MP_Str16:
        p += 2;
        q = p;
        p += v.getUint16(p - 2, true);
        return utf8.decode(buf.subarray(q, p));
      case MP_Str32:
        p += 4;
        q = p;
        p += v.getUint32(p - 4, true);
        return utf8.decode(buf.subarray(q, p));
      case MP_FixStr:
        return "";
      case MP_Array16:
        p += 2;
        return ParseTable(v.getUint16(p - 2, true), false);
      case MP_Array32:
        p += 4;
        return ParseTable(v.getUint32(p - 4, true), false);
      case MP_FixArray:
        return ParseTable(0, false);
      case MP_Map16:
        p += 2;
        return ParseTable(v.getUint16(p - 2, true), true);
      case MP_Map32:
        p += 4;
        return ParseTable(v.getUint32(p - 4, true), true);
      case MP_FixMap:
        return ParseTable(0, true);
      case MP_DESYNCED_USERDATA:
        if (is_table_key)
          throw new Error("Unable to parse table key of type 'userdata'");
        throw new Error("Parsing userdata type " + GetIntPacked() + " is not supported");
      default:
        if (type < MP_FixMap)
          return type;
        else if (type < MP_FixArray)
          return ParseTable(type - MP_FixMap, true);
        else if (type < MP_FixStr)
          return ParseTable(type - MP_FixArray, false);
        else if (type < MP_Nil) {
          q = p;
          p += type - MP_FixStr;
          return utf8.decode(buf.subarray(q, p));
        } else if (type > MP_Map32)
          return type - 256;
    }
    throw new Error("cannot parse unknown type " + type);
  }
  debugger;
  return Parse();
}

// tods.ts
var env = typeof process === "object" ? nodeEnv() : browserEnv();
var base62charset = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz".split("").map((c) => c.charCodeAt(0));
var debug = {
  log(msg) {
  },
  group(label) {
  },
  groupEnd() {
  }
};
async function ObjectToDesyncedString(data, type = "C", indexOffset = 0) {
  const [decompressedSize, buf] = await DSMPEncode(data, indexOffset);
  const encodedSize = Base62_GetEncodedDataSize(buf.byteLength) + Base62_GetEncodedU32Size(decompressedSize) + 3;
  let result = new Uint8Array(encodedSize + 10);
  let offset = 0;
  result[offset++] = 68;
  result[offset++] = 83;
  result[offset++] = type.charCodeAt(0);
  offset = Base62_WriteU32(decompressedSize, result, offset, result.byteLength);
  offset = Base62_WriteData(
    new Uint8Array(buf),
    result,
    offset,
    result.byteLength
  );
  if (offset != result.byteLength) {
    result = result.subarray(0, offset);
  }
  return new env.TextDecoder().decode(result);
}
function Base62_WriteU32(u, b62, idx, idxend) {
  idx += Base62_GetEncodedU32Size(u);
  const result = idx;
  do {
    if (idx >= idxend)
      throw new Error(`Data too long for Base62 encoding`);
    let v = u % 31;
    if (idx === result) {
      v += 31;
    }
    var c = base62charset[v];
    b62[--idx] = c;
    u = Math.floor(u / 31);
  } while (u > 0);
  return result;
}
function Base62_WriteData(data, b62, idx, idxend) {
  var datalen = data.length;
  let checksum = 0;
  function addWord(word2, bytes = 4) {
    let n = [0, 2, 3, 5, 6][bytes];
    idx += n;
    checksum = (checksum + word2) % 4294967296;
    if (idx >= idxend)
      throw new Error(`Data too long for Base62 encoding`);
    for (let i2 = 0; i2 < n; i2++) {
      const c = word2 % 62;
      b62[idx - i2 - 1] = base62charset[c];
      word2 = (word2 - c) / 62;
    }
  }
  let word = 0;
  for (var i = 0; i != datalen; i++) {
    word = word + data[i] * 256 ** (i % 4);
    if (i % 4 == 3) {
      addWord(word);
      word = 0;
    }
  }
  if (datalen % 4 != 0) {
    addWord(word, datalen % 4);
  }
  if (idx >= idxend)
    throw new Error(`Data too long for Base62 encoding`);
  b62[idx++] = base62charset[checksum % 62];
  return idx;
}
async function DSMPEncode(data, indexOffset = 0) {
  const MP_FixZero = 0, MP_FixMap = 128, MP_FixArray = 144, MP_FixStr = 160, MP_Nil = 192, MP_False = 194, MP_True = 195, MP_Float32 = 202, MP_Float64 = 203, MP_Uint8 = 204, MP_Uint16 = 205, MP_Uint32 = 206, MP_Uint64 = 207, MP_Int8 = 208, MP_Int16 = 209, MP_Int32 = 210, MP_Int64 = 211, MP_Str8 = 217, MP_Str16 = 218, MP_Str32 = 219, MP_Array16 = 220, MP_Array32 = 221, MP_Map16 = 222, MP_Map32 = 223;
  let ab = new ArrayBuffer(1024);
  let buf = new Uint8Array(ab);
  let view = new DataView(ab);
  const compressor = new env.CompressionStream("deflate");
  const writer = compressor.writable.getWriter();
  const textEncoder = new env.TextEncoder();
  let offset = 0;
  let totalWritten = 0;
  const result = env.streamToBytes(compressor.readable);
  async function flush() {
    let bytesToFlush = offset;
    totalWritten += bytesToFlush;
    offset = 0;
    const toWrite = new Uint8Array(ab, 0, bytesToFlush);
    ab = new ArrayBuffer(1024);
    buf = new Uint8Array(ab);
    view = new DataView(ab);
    await writer.ready;
    await writer.write(toWrite);
    await writer.ready;
  }
  async function writeBoolean(b) {
    if (offset >= buf.byteLength) {
      await flush();
    }
    buf[offset++] = b ? MP_True : MP_False;
  }
  async function writeNumber(n) {
    if (Number.isInteger(n)) {
      if (n >= 0) {
        if (n <= 127) {
          if (offset >= buf.byteLength) {
            await flush();
          }
          buf[offset++] = n;
        } else if (n <= 255) {
          debug.log("MP_Uint8");
          if (offset + 1 >= buf.byteLength) {
            await flush();
          }
          buf[offset++] = MP_Uint8;
          buf[offset++] = n;
        } else if (n <= 65535) {
          debug.log("MP_Uint16");
          if (offset + 3 >= buf.byteLength) {
            await flush();
          }
          buf[offset++] = MP_Uint16;
          view.setUint16(offset, n, true);
          offset += 2;
        } else if (n <= 4294967295) {
          debug.log("MP_Uint32");
          if (offset + 5 >= buf.byteLength) {
            await flush();
          }
          buf[offset++] = MP_Uint32;
          view.setUint32(offset, n, true);
          offset += 4;
        } else {
          debug.log("MP_Uint64");
          if (offset + 9 >= buf.byteLength) {
            await flush();
          }
          buf[offset++] = MP_Uint64;
          view.setBigUint64(offset, BigInt(n), true);
        }
      } else {
        if (n >= -32) {
          if (offset >= buf.byteLength) {
            await flush();
          }
          buf[offset++] = n & 255;
        } else if (n >= -128) {
          debug.log("MP_Int8");
          if (offset + 1 >= buf.byteLength) {
            await flush();
          }
          buf[offset++] = MP_Int8;
          buf[offset++] = n;
        } else if (n >= -32768) {
          debug.log("MP_Int16");
          if (offset + 3 >= buf.byteLength) {
            await flush();
          }
          buf[offset++] = MP_Int16;
          view.setInt16(offset, n, true);
          offset += 2;
        } else if (n >= -2147483648) {
          debug.log("MP_Int32");
          if (offset + 5 >= buf.byteLength) {
            await flush();
          }
          buf[offset++] = MP_Int32;
          view.setInt32(offset, n, true);
          offset += 4;
        } else {
          debug.log("MP_Int64");
          if (offset + 9 >= buf.byteLength) {
            await flush();
          }
          buf[offset++] = MP_Int64;
          view.setBigInt64(offset, BigInt(n), true);
          offset += 8;
        }
      }
    } else {
      debug.log("MP_Float64");
      if (offset + 9 >= buf.byteLength) {
        await flush();
      }
      buf[offset++] = MP_Float64;
      view.setFloat64(offset, n, true);
      offset += 8;
    }
  }
  async function writePackedNumber(n, debugName = "", partial = false) {
    if (n >= 128) {
      writePackedNumber(n >> 7, debugName, true);
    }
    let c = (n & 127) << 1;
    if (partial) {
      c |= 1;
    }
    debug.log(`pack ${debugName} ${n} -> ${c}`);
    if (offset >= buf.byteLength) {
      await flush();
    }
    buf[offset++] = c;
  }
  async function writeString(s) {
    if (s.length < 32) {
      if (offset + 1 + s.length >= buf.byteLength) {
        await flush();
      }
      if (s instanceof Uint8Array) {
        debug.log("MP_FixStr");
        buf.set(s, offset + 1);
        buf[offset] = MP_FixStr + s.length;
        offset += 1 + s.length;
        return;
      }
      const strbuf = new Uint8Array(ab, offset + 1);
      const result2 = textEncoder.encodeInto(s, strbuf);
      if (result2.written < 32 && result2.read == s.length) {
        debug.log("MP_FixStr");
        buf[offset] = MP_FixStr + result2.written;
        offset += 1 + result2.written;
        return;
      }
    }
    const encoded = s instanceof Uint8Array ? s : textEncoder.encode(s);
    const sizesize = encoded.length < 127 ? 1 : encoded.length < 32767 ? 2 : encoded.length < 2147483647 ? 4 : 8;
    if (sizesize > 4) {
      throw new Error("string too long");
    }
    if (offset + 1 + sizesize >= buf.byteLength) {
      await flush();
    }
    switch (sizesize) {
      case 1:
        debug.log("MP_Str8");
        buf[offset++] = MP_Str8;
        view.setUint8(offset++, encoded.length);
        break;
      case 2:
        debug.log("MP_Str16");
        buf[offset++] = MP_Str16;
        view.setUint16(offset, encoded.length, true);
        offset += 2;
        break;
      case 4:
        debug.log("MP_Str32");
        buf[offset++] = MP_Str32;
        view.setUint32(offset, encoded.length, true);
        offset += 4;
        break;
    }
    for (let i = 0; i < encoded.length; i++) {
      if (offset >= buf.byteLength) {
        await flush();
      }
      buf[offset++] = encoded[i];
    }
  }
  async function writeNil() {
    if (offset >= buf.byteLength) {
      await flush();
    }
    buf[offset++] = MP_Nil;
  }
  async function writeArray(a) {
    let headersize = a.length < 16 ? 1 : a.length < 65536 ? 3 : a.length < 4294967296 ? 5 : 9;
    if (headersize > 5) {
      throw new Error(`array too long: ${a.length}`);
    }
    if (offset + headersize > buf.byteLength) {
      await flush();
    }
    switch (headersize) {
      case 1:
        debug.log("MP_FixArray");
        buf[offset++] = MP_FixArray + a.length;
        break;
      case 3:
        debug.log("MP_Array16");
        buf[offset++] = MP_Array16;
        view.setUint16(offset, a.length, true);
        offset += 2;
        break;
      case 5:
        debug.log("MP_Array32");
        buf[offset++] = MP_Array32;
        view.setUint32(offset, a.length, true);
        offset += 4;
        break;
    }
    let vacancy = 0n;
    for (let i = 0; i < a.length; i++) {
      if (a[i] === void 0) {
        vacancy |= 1n << BigInt(i);
      }
    }
    for (let i = 0; i < a.length; i++) {
      if (i % 8 == 0) {
        if (offset >= buf.byteLength) {
          await flush();
        }
        debug.log(`vacancy=${(vacancy & 0xFFn).toString(2)}`);
        buf[offset++] = Number(vacancy & 0xFFn);
        vacancy >>= 8n;
      }
      if (a[i] !== void 0) {
        await writeValue(a[i]);
      }
    }
  }
  async function writeObject(o) {
    const t = new LuaTable(o, textEncoder, indexOffset);
    let encodedSize = 2 * t.lsizenode;
    if (encodedSize < 0) {
      throw new Error("invalid table");
    }
    if (t.array.length > 0) {
      encodedSize += 1;
    }
    if (encodedSize < 16) {
      debug.log("MP_FixMap");
      if (offset >= buf.byteLength) {
        await flush();
      }
      buf[offset++] = MP_FixMap + encodedSize;
    } else if (encodedSize < 65536) {
      debug.log("MP_Map16");
      if (offset + 2 >= buf.byteLength) {
        await flush();
      }
      buf[offset++] = MP_Map16;
      view.setUint16(offset, encodedSize, true);
      offset += 2;
    } else {
      debug.log("MP_Map32");
      if (offset + 4 >= buf.byteLength) {
        await flush();
      }
      buf[offset++] = MP_Map32;
      view.setUint32(offset, encodedSize, true);
      offset += 4;
    }
    let vacancy = t.vacancyBits;
    if (t.array.length > 0) {
      await writePackedNumber(t.array.length, "array_size");
    }
    await writePackedNumber(t.lastfree, "lastfree");
    await t.forEach(async (value, node, addVacancy) => {
      if (addVacancy) {
        if (offset >= buf.byteLength) {
          await flush();
        }
        debug.log(`vacancy=${(vacancy & 0xffn).toString(2)}`);
        buf[offset++] = Number(vacancy & 0xffn);
        vacancy >>= 8n;
      }
      if (value == null) {
        return;
      }
      node && debug.group(`value ${offset}`);
      await writeValue(value);
      if (node) {
        debug.groupEnd();
        debug.group(`key ${offset}`);
        await writeValue(node.key);
        debug.groupEnd();
        const encodedNext = node.next < 0 ? -2 * node.next + 1 : 2 * node.next;
        await writePackedNumber(encodedNext || 0, "next");
      }
    });
  }
  async function writeValue(v) {
    try {
      if (v == null) {
        debug.group("null");
        return writeNil();
      } else if (typeof v == "boolean") {
        debug.group(`${v}`);
        return writeBoolean(v);
      } else if (typeof v == "number") {
        debug.group(`${v}`);
        return writeNumber(v);
      } else if (typeof v == "string" || v instanceof Uint8Array) {
        debug.group(`string ${v.length}`);
        return writeString(v);
      }
      if (Array.isArray(v)) {
        debug.group(`array ${v.length}`);
        return writeArray(v);
      } else if (hasNumericKeys(v)) {
        const va = [];
        for (const k in v) {
          va[+k] = v[k];
        }
        debug.group(`array ${va.length}`);
        return writeArray(va);
      } else if (typeof v == "object") {
        debug.group(`object ${Object.keys(v).length}`);
        return writeObject(v);
      }
    } finally {
      debug.groupEnd();
    }
    throw new Error("Unsupported type: " + typeof v);
  }
  await writeValue(data);
  if (offset != 0) {
    await flush();
  }
  await writer.ready;
  await writer.close();
  return Promise.all([totalWritten, result]);
}
function Base62_GetEncodedU32Size(u) {
  for (var n = 1; ; n++)
    if (!(u = u / 31 | 0))
      return n;
}
function Base62_GetEncodedDataSize(datalen) {
  return ((datalen * 6 + 2) / 4 | 0) + 1;
}
function browserEnv() {
  return {
    TextEncoder,
    TextDecoder,
    // @ts-ignore
    CompressionStream,
    streamToBytes(stream) {
      return new Response(stream).arrayBuffer();
    }
  };
}
function nodeEnv() {
  const { arrayBuffer } = __require("node:stream/consumers");
  const { TextDecoder: TextDecoder2, TextEncoder: TextEncoder2 } = __require("util");
  const { CompressionStream: CompressionStream2 } = __require("node:stream/web");
  return {
    TextEncoder: TextEncoder2,
    TextDecoder: TextDecoder2,
    CompressionStream: CompressionStream2,
    streamToBytes(stream) {
      return arrayBuffer(stream);
    }
  };
}
var TableNode = class {
  constructor() {
    this.next = 0;
  }
};
var LuaTable = class {
  /**
   * @param {{[key:number|string]:any}} o
   * @param {TextEncoder} encoder
   * @param {number} indexOffset Use 1 to treat numeric map keys as 1-based
   */
  constructor(o, encoder, indexOffset = 0) {
    this.array = [];
    this.vacancyBits = 0n;
    this.lsizenode = 0;
    this.lastfree = 0;
    this.table = [];
    const remainingKeys = this.#splitKeys(o, indexOffset);
    this.#buildTable(remainingKeys, o, encoder);
    this.#calcVacancy();
  }
  /**
   *  @param {{[key:number|string]:any}} o
   *  @param {number} indexOffset
   */
  #splitKeys(o, indexOffset) {
    const allKeys = Object.keys(o);
    const filteredKeys = [];
    for (const k of allKeys) {
      const kn = k | 0;
      if (k == kn && kn >= indexOffset) {
        this.array[kn - indexOffset] = o[k];
      } else {
        filteredKeys.push(k);
      }
    }
    return filteredKeys;
  }
  /**
   * @param {string[]} remainingKeys
   * @param {{[key:number|string]:any}} o
   * @param {TextEncoder} encoder
   */
  #buildTable(keys, o, encoder) {
    this.lsizenode = Math.ceil(Math.log2(keys.length));
    const size = sizenode(this.lsizenode);
    this.table.length = size;
    this.lastfree = size;
    for (const key of keys) {
      const value = o[key];
      const encodedKey = encoder.encode(key);
      let mp = lmod(luaS_hash(encodedKey), size);
      if (!this.table[mp]) {
        this.table[mp] = new TableNode();
      } else {
        let f = this.#getfreepos();
        let othern = lmod(luaS_hash(this.table[mp].key), size);
        if (othern != mp) {
          while (othern + this.#gnext(othern) != mp) {
            othern += this.#gnext(othern);
          }
          this.table[othern].next = f - othern;
          Object.assign(this.table[f], this.table[mp]);
          if (this.#gnext(mp) != 0) {
            this.table[f].next += mp - f;
            this.table[mp].next = 0;
          }
          this.table[mp].value = void 0;
        } else {
          if (this.#gnext(mp) != 0) {
            this.table[f].next = mp + this.#gnext(mp) - f;
          }
          this.table[mp].next = f - mp;
          mp = f;
        }
      }
      this.table[mp].key = encodedKey;
      this.table[mp].value = value;
    }
    function luaS_hash(bytes) {
      const seed = 1683865549;
      let h = seed ^ bytes.length;
      let l = bytes.length;
      for (; l > 0; l--) {
        h = (h ^ (h << 5) + (h >>> 2) + bytes[l - 1]) >>> 0;
      }
      return h;
    }
    function lmod(s, size2) {
      return s & size2 - 1;
    }
    function twoto(x) {
      return 1 << x;
    }
    function sizenode(lsizenode) {
      return twoto(lsizenode);
    }
  }
  #gnext(othern) {
    return this.table[othern].next ?? 0;
  }
  #getfreepos() {
    while (this.lastfree > 0) {
      this.lastfree--;
      if (!this.table[this.lastfree]) {
        this.table[this.lastfree] = new TableNode();
        return this.lastfree;
      }
    }
    throw new Error("out of nodes");
  }
  #calcVacancy() {
    this.vacancyBits = 0n;
    for (let i = 0n; i < this.array.length; i++) {
      if (this.array[i] == null) {
        this.vacancyBits |= 1n << i;
      }
    }
    for (let i = 0; i < this.table.length; i++) {
      if (!this.table[i]) {
        this.vacancyBits |= 1n << BigInt(i + this.array.length);
      }
    }
  }
  async forEach(f) {
    for (let i = 0; i < this.array.length; i++) {
      await f(this.array[i], void 0, i % 8 == 0);
    }
    for (let i = 0; i < this.table.length; i++) {
      const n = this.table[i];
      await f(n?.value, n, (i + this.array.length) % 8 == 0);
    }
  }
};
function hasNumericKeys(o) {
  for (const k in o) {
    if (k != (k | 0))
      return false;
  }
  return true;
}

// decompile/dsinstr.ts
var instructions = {
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

// decompile/disasm.ts
var Dissasembler = class {
  constructor(obj) {
    this.output = [];
    this.extraBehaviors = [];
    this.subs = [];
    this.bps = [];
    this.nextLabel = 0;
    this.#label("main");
    if ("frame" in obj) {
      this.blueprint(obj);
    } else {
      this.disasemble(obj);
    }
    this.#doExtras();
  }
  code() {
    return this.output.join("\n");
  }
  blueprint(obj) {
    this.#emit(".blueprint", obj.frame);
    if (obj.name) {
      this.#emit(".name", obj.name);
    }
    if (obj.powered_down) {
      this.#emit(".powered_down");
    }
    if (obj.disconnected) {
      this.#emit(".disconnected");
    }
    if (obj.logistics) {
      for (const [k, v] of Object.entries(obj.logistics)) {
        this.#emit(`.logistics`, k, v);
      }
    }
    if (obj.regs) {
      for (const [k, v] of Object.entries(obj.regs)) {
        this.#emit(`.reg`, Number(k), v);
      }
    }
    obj.locks?.forEach?.(
      (v, i) => typeof v === "string" && this.#emit(`.lock`, i, { id: v })
    );
    if (obj.links) {
      for (const [k, v] of obj.links) {
        this.#emit(`.link`, k, v);
      }
    }
    if (obj.components) {
      for (const [v, k, code] of obj.components) {
        if (code) {
          this.extraBehaviors.push({ t: code, done: false });
          this.#emit(
            `.component`,
            k,
            { id: v },
            `:behavior${this.extraBehaviors.length}`
          );
        } else {
          this.#emit(`.component`, k, { id: v });
        }
      }
    }
  }
  disasemble(obj, main = "main") {
    if (obj.name) {
      this.#emit(".name", obj.name);
    }
    obj.parameters?.forEach((v, i) => {
      let name = obj.pnames?.[i];
      const reg = { id: `p${i + 1}` };
      if (name) {
        this.#emit(".pname", reg, name);
      }
      if (v) {
        this.#emit(".out", reg);
      }
    });
    const subOffset = this.subs.length;
    if (obj.subs) {
      for (const sub of obj.subs) {
        this.subs.push({ t: sub, done: false });
      }
    }
    const labels = this.#buildLabels(obj);
    for (let i = 0; `${i}` in obj; i++) {
      this.#emitInstr(obj[`${i}`], i, labels, subOffset, main);
    }
  }
  #buildLabels(obj) {
    const labels = /* @__PURE__ */ new Map();
    for (let i = 0; `${i}` in obj; i++) {
      const inst = obj[`${i}`];
      if (inst.next && !labels.has(inst.next)) {
        labels.set(inst.next, `:label${this.nextLabel++}`);
      }
      const def = instructions[inst.op];
      if (def?.execArgs) {
        for (const arg of def.execArgs) {
          const target = inst[arg] ?? i + 2;
          if (target && typeof target == "number" && !labels.has(target) && obj[`${target - 1}`]) {
            labels.set(target, `:label${this.nextLabel++}`);
            inst[arg] = labels.get(target);
          }
        }
      }
    }
    return labels;
  }
  #emitInstr(inst, ip, labels, subOffset, main) {
    const label = labels.get(ip + 1);
    if (label)
      this.#label(label.substring(1));
    if (inst.cmt) {
      this.#nl();
      this.#emit(`; ${inst.cmt}`);
    }
    const args = [];
    for (const [k, v] of Object.entries(inst)) {
      if (k == `${Number(k)}`) {
        args[Number(k)] = this.#convertOp(v);
      }
    }
    if (inst.op == "call") {
      const sub = inst.sub;
      const subLabel = sub ? `:sub${subOffset + sub}` : `:${main}`;
      args.push({ id: `$sub=${subLabel}` });
    }
    if (inst.txt) {
      args.push({ id: `$txt=${JSON.stringify(inst.txt)}` });
    } else if (inst.c != null) {
      args.push({ id: `$c=${inst.c}` });
    } else if (inst.bp) {
      if (typeof inst.bp == "string") {
        inst.bp = DesyncedStringToObject("DSB" + inst.bp);
      }
      this.bps.push({ t: inst.bp, done: false });
      args.push({ id: `$bp=:bp${this.bps.length}` });
    }
    if (inst.nx != null && inst.ny != null) {
      args.push({ id: `$nx=${inst.nx}` });
      args.push({ id: `$ny=${inst.ny}` });
    }
    this.#emit(inst.op, ...args);
    if (inst.next == false) {
      this.#emit(".ret");
    } else if (inst.next) {
      this.#emit("jump", labels.get(inst.next));
    }
  }
  #convertOp(op) {
    if (typeof op == "string") {
      if (op.match(/^[A-Z]$/)) {
        return { id: op };
      }
      return op;
    } else if (typeof op == "number") {
      if (op > 0) {
        return { id: `p${op}` };
      } else {
        switch (-op) {
          case 1:
            return { id: "goto" };
          case 2:
            return { id: "store" };
          case 3:
            return { id: "visual" };
          case 4:
            return { id: "signal" };
        }
      }
    }
    return op;
  }
  #doExtras() {
    let count = 0;
    do {
      count = 0;
      this.extraBehaviors.forEach((w, i) => {
        if (!w.done) {
          this.#nl(2);
          this.#label(`behavior${i + 1}`);
          this.#emit(".behavior");
          this.disasemble(w.t, `behavior${i + 1}`);
          w.done = true;
          count++;
        }
      });
      this.subs.forEach((w, i) => {
        if (!w.done) {
          this.#nl(2);
          this.#label(`sub${i + 1}`);
          this.#emit(".sub");
          this.disasemble(w.t);
          w.done = true;
          count++;
        }
      });
      this.bps.forEach((w, i) => {
        if (!w.done) {
          this.#nl(2);
          this.#label(`bp${i + 1}`);
          this.blueprint(w.t);
          w.done = true;
          count++;
        }
      });
    } while (count);
  }
  #nl(count = 1) {
    for (let i = 0; i < count; i++) {
      this.output.push("");
    }
  }
  #label(label) {
    this.output.push(`${label}:`);
  }
  #emit(op, ...args) {
    this.output.push(
      `  ${op}	${args.map((x) => this.#convert(x)).join(", ")}`
    );
  }
  #convert(x) {
    if (typeof x === "string") {
      if (x[0] == ":") {
        return x;
      }
      return JSON.stringify(x);
    } else if (typeof x === "number") {
      return x.toString();
    } else if (typeof x === "boolean") {
      return x ? "true" : "false";
    } else if (x == null) {
      return "nil";
    } else if (typeof x != "object") {
      throw new Error(`Unrecognized type: ${typeof x}`);
    }
    const keys = new Set(Object.keys(x));
    for (const k of keys) {
      if (x[k] == void 0) {
        keys.delete(k);
      }
    }
    if (keys.size == 1) {
      switch (Object.keys(x)[0]) {
        case "id":
          return x.id;
        case "num":
          return x.num.toString();
        case "coord":
          return `${x.coord.x} ${x.coord.y}`;
      }
    } else if (keys.size == 2 && keys.has("id") && keys.has("num")) {
      return `${x.id}@${x.num}`;
    }
    throw new Error(`Unrecognized argument: ${JSON.stringify(x)}`);
  }
};

// methods.ts
var methods = {
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
    "in": [
      0,
      2
    ],
    "out": 1
  },
  "countReserved": {
    "id": "count_item",
    "thisArg": 2,
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
    "in": [
      1
    ],
    "out": 0
  },
  "countStorageSlots": {
    "id": "count_slots",
    "thisArg": 1,
    "c": 2,
    "in": [
      1
    ],
    "out": 0
  },
  "countGasSlots": {
    "id": "count_slots",
    "thisArg": 1,
    "c": 3,
    "in": [
      1
    ],
    "out": 0
  },
  "countVirusSlots": {
    "id": "count_slots",
    "thisArg": 1,
    "c": 4,
    "in": [
      1
    ],
    "out": 0
  },
  "countAnomolySlots": {
    "id": "count_slots",
    "thisArg": 1,
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
    "in": [
      0
    ]
  },
  "packageAll": {
    "id": "package_all",
    "thisArg": 0,
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
};

// assembler.ts
var ops = {};
for (const op of Object.values(methods)) {
  ops[op.id] = op;
}
var numberLiteralPattern = String.raw`-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?`;
var numberLiteralExactPattern = new RegExp(`^${numberLiteralPattern}$`);
var itemNumPattern = new RegExp(`^(w+)@(${numberLiteralPattern})$`);
var coordPattern = new RegExp(
  `^(${numberLiteralPattern})s+(${numberLiteralPattern})$`
);
var ipJumpPattern = /^:(\d+)$/;
function parseAssembly(code) {
  const instructions2 = [];
  const lines = code.split("\n");
  let comment;
  let labels = [];
  for (let i = 0; i < lines.length; i++) {
    let line = lines[i].trim();
    const strings = /* @__PURE__ */ new Map();
    line = line.replace(
      /"(?:\\(?:["\\\/bfnrt]|u[a-fA-F0-9]{4})|[^"\\\0-\x1F\x7F]+)*"/g,
      (s) => {
        let key = `$s${strings.size}`;
        strings.set(key, JSON.parse(s));
        return key;
      }
    );
    const commentStart = line.indexOf(";");
    if (commentStart >= 0) {
      comment = line.substring(commentStart + 1).trim();
      line = line.substring(0, commentStart).trim();
    }
    if (line) {
      const [, op, rest] = line.match(/^(\S+)\s*(.*)$/) ?? [];
      if (op.endsWith(":")) {
        labels.push(op.substring(0, op.length - 1));
        continue;
      }
      const args = rest?.match(/^\s*$/) ? [] : rest?.split(/\s*,\s*/).map((s) => {
        if (s.includes("$s")) {
          strings.forEach((v, k) => {
            s = s.replace(k, v);
          });
        }
        return s;
      }) ?? [];
      const methodInfo = ops[op];
      let outArgs = methodInfo?.out ?? [];
      if (typeof outArgs == "number") {
        outArgs = [outArgs];
      }
      instructions2.push({
        op,
        args,
        outArgs,
        comment,
        labels,
        lineno: i + 1
      });
      comment = void 0;
      labels = [];
    }
  }
  if (comment || labels.length) {
    instructions2.push({
      op: ".ret",
      args: [],
      outArgs: [],
      comment,
      labels,
      lineno: -1
    });
  }
  return instructions2;
}
async function assemble(code) {
  let instructions2 = parseAssembly(code);
  const program = {
    main: instructions2,
    subs: /* @__PURE__ */ new Map(),
    others: /* @__PURE__ */ new Map(),
    bps: /* @__PURE__ */ new Map()
  };
  for (let i = 0; i < instructions2.length; i++) {
    let key;
    switch (instructions2[i].op) {
      case ".sub":
        key = "subs";
        break;
      case ".behavior":
        if (i == 0)
          continue;
        key = "others";
        break;
      case ".blueprint":
        if (i == 0)
          continue;
        key = "bps";
        break;
    }
    if (key) {
      const label = instructions2[i]?.labels?.[0] ?? instructions2[i + 1]?.labels?.[0];
      if (!label) {
        throw new Error(
          `No label for ${instructions2[i].op} at line ${instructions2[i].lineno}`
        );
      }
      instructions2 = instructions2.splice(i, instructions2.length - i);
      i = 0;
      const group = program[key];
      group.set(label, instructions2);
    }
  }
  const assembler = new Assembler(program);
  if (program.main[0]?.op == ".blueprint") {
    return assembler.assembleBlueprint();
  }
  return assembler.assembleBehavior();
}
var Assembler = class _Assembler {
  // true if parameter is modified, false if read only
  constructor(program) {
    this.program = program;
    this.subs = [];
    this.params = [];
    this.subs = findReferencedSubs(program.main, program.subs);
  }
  assembleBlueprint() {
    const frame = this.program.main[0].args[0];
    if (typeof frame != "string") {
      throw new Error(
        `Blueprint frame must be a string at line ${this.program.main[0].lineno}`
      );
    }
    const bp = {
      frame
    };
    for (let i = 1; i < this.program.main.length; i++) {
      let inst = this.program.main[i];
      switch (inst.op) {
        case ".name":
          bp.name = inst.args[0];
          break;
        case ".powered_down":
          bp.powered_down = inst.args[0] == "true";
          break;
        case ".disconnected":
          bp.disconnected = inst.args[0] == "true";
          break;
        case ".logistics":
          bp.logistics ??= {};
          bp.logistics[inst.args[0]] = inst.args[1] == "true";
          break;
        case ".reg":
          bp.regs ??= {};
          const regNo = inst.args[0];
          const value = this.convertArg(inst.args[1]);
          bp.regs[regNo] = value;
          break;
        case ".lock":
          bp.locks ??= [];
          const lockNo = Number(inst.args[0]);
          const type = inst.args[1];
          if (type !== "true" && type !== "false") {
            bp.locks[lockNo] = type;
          }
          break;
        case ".link":
          bp.links ??= [];
          bp.links.push([Number(inst.args[0]), Number(inst.args[1])]);
          break;
        case ".component":
          bp.components ??= [];
          const [num, id, code] = inst.args;
          if (typeof code === "string" && code.startsWith(":")) {
            const behavior = this.program.others.get(code.substring(1));
            if (!behavior) {
              throw new Error(
                `Behavior ${code} not found at line ${inst.lineno}`
              );
            }
            const p = new _Assembler({
              ...this.program,
              main: behavior
            }).assembleBehavior();
            bp.components.push([id, Number(num), p]);
          } else {
            bp.components.push([id, Number(num)]);
          }
      }
    }
    if (bp.locks) {
      for (let i = 0; i < bp.locks.length; i++) {
        bp.locks[i] ??= false;
      }
    }
    return bp;
  }
  assembleBehavior() {
    const main = this.assembleSub(this.program.main);
    if (this.subs.length) {
      main.subs = this.subs.map((s) => this.assembleSub(s.instructions));
    }
    return main;
  }
  assembleSub(code) {
    const savedParams = this.params;
    this.params = [];
    try {
      const result = {};
      if (code.length == 0 || code[0].op == ".ret") {
        return result;
      }
      const returnLabels = /* @__PURE__ */ new Set();
      const labelAliases = /* @__PURE__ */ new Map();
      for (let i = code.length - 1; i > 0; i--) {
        let instr = code[i];
        let prev = code[i - 1];
        let prevInfo = instructions[prev.op];
        if (instr.labels?.length ?? 0 > 0) {
          continue;
        }
        if (prev.op == ".ret" || isPseudoJump(prev) || prevInfo?.terminates) {
          code.splice(i, 1);
        }
      }
      const replaceJump = (ip, target) => {
        const instr = code[ip];
        if (ip == 0) {
          instr.op = "set_reg";
          instr.next = instr.args[0].substring(1);
          instr.args = [];
        } else {
          code[ip - 1].next = target;
          code.splice(ip, 1);
        }
      };
      for (let i = code.length - 1; i >= 0; i--) {
        let instr = code[i];
        let nextIndex = instr.args.findIndex((v) => {
          let m = v.match(/^\$next=:(\w+)$/);
          if (m) {
            instr.next = m[1];
            return true;
          }
        });
        if (nextIndex >= 0) {
          instr.args.splice(nextIndex, 1);
        }
        if (isPseudoJump(instr)) {
          if (!instr.args[0]) {
            throw new Error(`Invalid jump instruction at line ${instr.lineno}`);
          }
          if (instr.labels?.length) {
            instr.labels?.forEach(
              (l) => labelAliases.set(l, instr.args[0].substring(1))
            );
          }
          replaceJump(i, instr.args[0].substring(1));
        } else if (instr.op.startsWith(".")) {
          switch (instr.op) {
            case ".ret":
              if (instr.labels?.length) {
                instr.labels?.forEach((l) => returnLabels.add(l));
              } else {
                replaceJump(i, false);
                continue;
              }
              break;
            case ".sub":
            case ".behavior":
            case ".blueprint":
              break;
            case ".name":
              result.name = instr.args[0];
              break;
            case ".pname": {
              const [reg, name] = instr.args;
              const m = reg.match(/^p(\d)+/);
              if (!m) {
                throw new Error(
                  `Unknown parameter register ${reg} at line ${instr.lineno}`
                );
              }
              result.pnames ??= [];
              result.pnames[m[1] - 1] = name;
              break;
            }
            case ".out": {
              const [reg] = instr.args;
              const m = reg.match(/^p(\d)+/);
              if (!m) {
                throw new Error(
                  `Unknown parameter register ${reg} at line ${instr.lineno}`
                );
              }
              result.parameters ??= [];
              result.parameters[m[1] - 1] = true;
              break;
            }
            default:
              throw new Error(
                `Unknown pseudo instruction ${instr.op} at line ${instr.lineno}`
              );
          }
          code.splice(i, 1);
        }
      }
      const labelMap = /* @__PURE__ */ new Map();
      for (let i = 0; i < code.length; i++) {
        let instr = code[i];
        if (instr.labels?.length) {
          instr.labels.forEach((l) => {
            if (!labelMap.has(l)) {
              labelMap.set(l, i + 1);
            }
          });
        }
      }
      returnLabels.forEach((l) => {
        labelMap.set(l, false);
      });
      labelAliases.forEach((v, k) => {
        while (labelAliases.has(v)) {
          v = labelAliases.get(v);
        }
        if (!labelMap.has(v)) {
          throw new Error(`Unknown label ${v}`);
        }
        labelMap.set(k, labelMap.get(v));
      });
      for (let i = 0; i < code.length; i++) {
        let instr = code[i];
        result[i] = {
          op: instr.op
        };
        if (instr.next != null && instr.next != i + 2) {
          if (typeof instr.next == "string") {
            const resolved = labelMap.get(instr.next);
            if (resolved == null) {
              throw new Error(
                `Unknown label ${instr.next} at line ${instr.lineno}`
              );
            }
            if (resolved != i + 2) {
              result[i].next = resolved;
            }
          } else {
            result[i].next = instr.next;
          }
        }
        if (instr.comment) {
          result[i].cmt = instr.comment;
        }
        instr.args.filter((v) => {
          const m = v.match(/^\$(\w+)=(.+)/);
          if (m) {
            result[i][m[1]] = this.convertArg(m[2], m[1]);
            return false;
          }
          return true;
        }).map((v) => {
          if (v.startsWith(":")) {
            const resolved = labelMap.get(v.substring(1));
            if (resolved == null) {
              throw new Error(`Unknown label ${v} at line ${instr.lineno}`);
            }
            if (resolved == i + 2) {
              return "nil";
            } else if (typeof resolved == "number") {
              return `:${resolved}`;
            } else {
              return resolved.toString();
            }
          }
          return v;
        }).forEach((v, vi) => {
          let arg = this.convertArg(v, void 0, instr.outArgs.includes(vi));
          if (arg != null) {
            result[i][vi] = arg;
          }
        });
      }
      for (let i = 0; i < this.params.length; i++) {
        this.params[i] ??= false;
      }
      result.parameters = this.params;
      return result;
    } finally {
      this.params = savedParams;
    }
  }
  convertArg(a, key, write = false) {
    let m;
    if (a == "true") {
      return true;
    } else if (a == "false") {
      return false;
    } else if (a == "nil") {
      return void 0;
    } else if (key == "sub") {
      return this.subs.find((v) => v.name == a.substring(1))?.label ?? void 0;
    } else if (key == "txt") {
      return a;
    } else if (key == "bp") {
      const prog = {
        ...this.program,
        main: this.program.bps.get(a.substring(1))
      };
      if (!prog.main) {
        throw new Error(`Blueprint ${a} not found.`);
      }
      return new _Assembler(prog).assembleBlueprint();
    } else if (key?.match(/^(c|nx|ny)$/)) {
      return Number(a);
    } else if (a == "goto") {
      return -1;
    } else if (a == "store") {
      return -2;
    } else if (a == "visual") {
      return -3;
    } else if (a == "signal") {
      return -4;
    } else if (a.match(/^p\d+$/)) {
      const i = Number(a.substring(1));
      if (write) {
        this.params[i - 1] = true;
      } else {
        this.params[i - 1] ??= false;
      }
      return i;
    } else if (a.match(/^[A-Z]$/)) {
      return a;
    } else if (a.match(numberLiteralExactPattern)) {
      return { num: Number(a) };
    } else if (m = a.match(itemNumPattern)) {
      return { id: m[1], num: Number(m[2]) };
    } else if (m = a.match(coordPattern)) {
      return { coord: { x: Number(m[1]), y: Number(m[2]) } };
    } else if (m = a.match(ipJumpPattern)) {
      return Number(m[1]);
    } else {
      return { id: a };
    }
  }
};
function findReferencedSubs(code, subs) {
  const result = /* @__PURE__ */ new Map();
  code.forEach((i) => {
    if (i.op == "call") {
      const subArg = i.args.find((a) => a.startsWith("$sub="))?.substring(5);
      if (!subArg)
        return;
      const subName = subArg.substring(1);
      const sub = subs.get(subName);
      if (!sub || !subArg.startsWith(":")) {
        throw new Error(`Sub ${subArg} not found at line ${i.lineno}`);
      }
      if (!result.has(subName)) {
        result.set(subName, {
          name: subName,
          instructions: sub,
          label: result.size + 1
        });
      }
    }
  });
  return [...result.values()];
}
function isPseudoJump(inst) {
  return inst.op == "jump" && inst.args[0]?.startsWith(":");
}
export {
  DesyncedStringToObject,
  Dissasembler,
  ObjectToDesyncedString,
  asmSyntax,
  assemble,
  behavior_dts
};
/** @license zlib.js 2012 - imaya [ https://github.com/imaya/zlib.js ] The MIT License */
