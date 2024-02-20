
interface BaseValue {
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
declare function label(label: Value): void;
/**
 * Jumps execution to label with the same label id
 * @param label Label identifier
 */
declare function jump(label: Value): void;
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
declare function setCompReg(value: Value, component_index: Value | CompNum, group_index?: Value | number): void;
/**
 * Reads a value from a component register
 * @param component_index Component and register number to set
 * @param group_index? Component group index if multiple are equipped
 */
declare function getCompReg(component_index: Value | CompNum, group_index?: Value | number): Value;
/**
 * Checks whether a particular component is currently working
 * @param component_index Component to get
 * @param group_index? Component group index if multiple are equipped
 * @returns Returns the component ID currently working
 */
declare function isWorking(component_index: Value | CompNum, group_index?: Value | number): Value | undefined;
/**
 * Sets the numerical/coordinate part of a value
 */
declare function setNumber(value: Value, num_coord: Value | CoordNum): Value;
/**
 * Returns a coordinate made from x and y values
 */
declare function combineCoordinate(x: Value, y: Value): Value;
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
 * @param component? Optional Component to check (if Component not equipped)
 */
declare function canProduce(item: Value | Item, component?: Value): boolean;
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

interface String extends BaseValue {
  // Required by typescript since String already has a method named match
  match(filter1?: Value | RadarFilter, filter2?: Value | RadarFilter, filter3?: Value | RadarFilter): boolean;
}
interface Number extends BaseValue {}

type Value = Coord | ItemNum | FrameNum | RadarFilter;
interface Coord extends BaseValue, Array<number> {}
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

interface ItemNumPair extends BaseValue {
  id: Item,
  num: number
}

type ItemNum = Item | number | ItemNumPair;
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

interface CompNumPair extends BaseValue {
  id: Comp,
  num: number
}
type CompNum = Comp | number | CompNumPair;

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

interface ResourceNumPair extends BaseValue {
  id: Resource;
  num: number;
}
type ResourceNum = Resource | number | ResourceNumPair;
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

interface FrameNumPair extends BaseValue {
  id: Frame;
  num: number;
}
type FrameNum = Frame | number | FrameNumPair;

declare function coord(x: number, y: number): Coord;
declare function value(id: Comp, num: number): CompNumPair;
declare function value(id: Item, num: number): ItemNumPair;
declare function value(id: Resource, num: number): ResourceNumPair;
declare function value(id: Frame, num: number): FrameNumPair;
