export const behavior_dts = "\ntype Value = number & {\n  /**\n   * Switch based on type of value\n   */\n  type: \"No Match\" | \"Item\" | \"Entity\" | \"Component\" | \"Tech\" | \"Value\" | \"Coord\";\n  /**\n   * Divert program depending on unit type\n   */\n  unitType: \"No Unit\" | \"Building\" | \"Bot\" | \"Construction\";\n  /**\n   * Divert program depending on location of a unit\n   */\n  altitude?: \"Valley\" | \"Plateau\";\n  /**\n   * Divert program depending on location of a unit\n   */\n  inBlight: boolean;\n  /**\n   * Checks the movement state of an entity\n   */\n  isMoving: \"Moving\" | \"Not Moving\" | \"Path Blocked\" | \"No Result\";\n  /**\n   * Gets the resource type from an resource node\n   */\n  resourceType?: Value;\n  /**\n   * Gets the trust level of the unit towards you\n   */\n  trust?: \"ally\" | \"neutral\" | \"enemy\";\n\n  /**\n   * Compares if an item of entity is of a specific type\n   */\n  isA(type: Value): boolean;\n  /**\n   * Branches based on which unit is closer, optional branches for closer unit\n   */\n  nearerThan(unit_b: Value): boolean;\n  /**\n   * Returns how many of the input item can fit in the inventory\n   * @param item Item to check can fit\n   * @returns Number of a specific item that can fit on a unit\n   */\n  getfreespace(item: Value | Item): Value;\n  /**\n   * Check a units health\n   */\n  fullHealth(): boolean;\n  /**\n   * Checks the Battery level of a unit\n   */\n  fullBattery(): boolean;\n  /**\n   * Checks the Efficiency of the power grid the unit is on\n   */\n  fullGridEfficiency(): boolean;\n  /**\n   * Counts the number of the passed item in its inventory\n   * @param item Item to count\n   * @returns Number of this item in inventory or empty if none exist\n   */\n  count(item: Value | Item): Value;\n  /**\n   * Counts the number of the passed item in its inventory\n   * @param item Item to count\n   * @returns Number of this item in inventory or empty if none exist\n   */\n  countReserved(item: Value | Item): Value;\n  /**\n   * Returns the number of slots in this unit of the given type\n   * @returns Number of slots of this type\n   */\n  countAllSlots(): Value;\n  /**\n   * Returns the number of slots in this unit of the given type\n   * @returns Number of slots of this type\n   */\n  countStorageSlots(): Value;\n  /**\n   * Returns the number of slots in this unit of the given type\n   * @returns Number of slots of this type\n   */\n  countGasSlots(): Value;\n  /**\n   * Returns the number of slots in this unit of the given type\n   * @returns Number of slots of this type\n   */\n  countVirusSlots(): Value;\n  /**\n   * Returns the number of slots in this unit of the given type\n   * @returns Number of slots of this type\n   */\n  countAnomolySlots(): Value;\n  /**\n   * Checks if you have at least a specified amount of an item\n   * @param item Item to count\n   */\n  hasItem(item: Value | ItemNum): boolean;\n  /**\n   * Filters the passed entity\n   * @param filter1? Filter to check\n   * @param filter2? Second Filter\n   * @param filter3? Third Filter\n   */\n  match(filter1?: Value | RadarFilter, filter2?: Value | RadarFilter, filter3?: Value | RadarFilter): boolean;\n  /**\n   * Returns distance to a unit\n   * @param target Target unit\n   * @returns Unit and its distance in the numerical part of the value\n   */\n  getDistance(target: Value): Value;\n  /**\n   * Checks if two entities are in the same power grid\n   * @param entity Second Entity\n   */\n  sameGrid(entity: Value): boolean;\n  /**\n   * Attempt to solve explorable with inventory items\n   * @returns Missing repair item, scanner component or Unpowered\n   */\n  solve(): Value | undefined;\n}\n\n/**\n * Instruction has been removed, behavior needs to be updated\n */\ndeclare function nop(): void;\n/**\n * Stops execution of the behavior\n */\ndeclare function exit(): never;\n/**\n * Run as many instructions as possible. Use wait instructions to throttle execution.\n */\ndeclare function unlock(): void;\n/**\n * Run one instruction at a time\n */\ndeclare function lock(): void;\n/**\n * Labels can be jumped to from anywhere in a behavior\n * @param label Label identifier\n */\ndeclare function label(label: Value | AnyValue): void;\n/**\n * Jumps execution to label with the same label id\n * @param label Label identifier\n */\ndeclare function jump(label: Value | AnyValue): void;\n/**\n * Pauses execution of the behavior until 1 or more ticks later\n * @param time Number of ticks to wait\n */\ndeclare function wait(time: Value | number): void;\n/**\n * Gets the type from an item or entity\n */\ndeclare function getType(item_entity: Value): Value;\n/**\n * Gets the first item where the locked slot exists but there is no item in it\n * @returns The first locked item id with no item\n */\ndeclare function getFirstLocked0(): Value;\n/**\n * Performs code for all entities in visibility range of the unit\n * @param range Range (up to units visibility range)\n * @param filter1? Filter to check\n * @param filter2? Second Filter\n * @param filter3? Third Filter\n * @returns Current Entity\n */\ndeclare function entitiesInRange(range: Value | number, filter1?: Value | RadarFilter, filter2?: Value | RadarFilter, filter3?: Value | RadarFilter): IterableIterator<Value>;\n/**\n * Performs code for all researchable tech\n * @returns Researchable Tech\n */\ndeclare function availableResearch(): IterableIterator<Value>;\n/**\n * Returns the first active research tech\n * @returns First active research\n */\ndeclare function getResearch(): Value;\n/**\n * Returns the first active research tech\n * @param tech First active research\n */\ndeclare function setResearch(tech: Value): void;\n/**\n * Clears a research from queue, or entire queue if no tech passed\n * @param tech Tech to remove from research queue\n */\ndeclare function clearResearch(tech: Value): void;\n/**\n * Writes a value into a component register\n * @param component_index Component and register number to set\n * @param group_index? Component group index if multiple are equipped\n */\ndeclare function setCompReg(value: Value | AnyValue, component_index: Value | CompNum, group_index?: Value | number): void;\n/**\n * Reads a value from a component register\n * @param component_index Component and register number to set\n * @param group_index? Component group index if multiple are equipped\n */\ndeclare function getCompReg(component_index: Value | CompNum, group_index?: Value | number): Value;\n/**\n * Checks whether a particular component is currently working\n * @param component_index Component to get\n * @param group_index? Component group index if multiple are equipped\n * @returns Returns the component ID currently working\n */\ndeclare function isWorking(component_index: Value | CompNum, group_index?: Value | number): Value | undefined;\n/**\n * Sets the numerical/coordinate part of a value\n */\ndeclare function setNumber(value: Value, num_coord: Value | CoordNum): Value;\n/**\n * Returns a coordinate made from x and y values\n */\ndeclare function combineCoordinate(x: Value | AnyValue, y: Value | AnyValue): Value;\n/**\n * Split a coordinate into x and y values\n * @returns [x, y]\n */\ndeclare function separateCoordinate(coordinate: Value | CoordNum): [Value, Value];\n/**\n * Combine to make a register from separate parameters\n */\ndeclare function combineRegister(num?: Value, entity?: Value, x?: Value, y?: Value): Value;\n/**\n * Split a register into separate parameters\n * @returns [Num, Entity, ID, x, y]\n */\ndeclare function separateRegister(register: Value): [Value, Value, Value, Value, Value];\n/**\n * Adds a number or coordinate to another number or coordinate\n */\ndeclare function add(to: Value | CoordNum, num: Value | CoordNum): Value;\n/**\n * Subtracts a number or coordinate from another number or coordinate\n */\ndeclare function sub(from: Value | CoordNum, num: Value | CoordNum): Value;\n/**\n * Multiplies a number or coordinate from another number or coordinate\n */\ndeclare function mul(to: Value | CoordNum, num: Value | CoordNum): Value;\n/**\n * Divides a number or coordinate from another number or coordinate\n */\ndeclare function div(from: Value | CoordNum, num: Value | CoordNum): Value;\n/**\n * Get the remainder of a division\n */\ndeclare function modulo(num: Value | CoordNum, by: Value | CoordNum): Value;\n/**\n * Checks if free space is available for an item and amount\n * @param item Item and amount to check can fit\n */\ndeclare function haveFreeSpace(item: Value | ItemNum): boolean;\n/**\n * Fix all storage slots or a specific item slot index\n * @param item Item type to try fixing to the slots\n * @param slot_index Individual slot to fix\n */\ndeclare function lockSlots(item: Value | ItemNum, slot_index: Value | number): void;\n/**\n * Unfix all inventory slots or a specific item slot index\n * @param slot_index Individual slot to unfix\n */\ndeclare function unlockSlots(slot_index: Value | number): void;\n/**\n * Gets a units health as a percentage, current and max\n * @param entity Entity to check\n * @returns [Percentage of health remaining, Value of health remaining, Value of maximum health]\n */\ndeclare function getHealth(entity: Value): [Value, Value, Value];\n/**\n * Gets the best matching entity at a coordinate\n * @param coordinate Coordinate to get Entity from\n */\ndeclare function getEntityAt(coordinate: Value | CoordNum): Value;\n/**\n * Gets the value of the Grid Efficiency as a percent\n */\ndeclare function getGridEffeciency(): Value;\n/**\n * Gets the value of the Battery level as a percent\n */\ndeclare function getBattery(): Value;\n/**\n * Gets the value of the Unit executing the behavior\n */\ndeclare function getSelf(): Value;\n/**\n * Reads the Signal register of another unit\n * @param unit The owned unit to check for\n * @returns Value of units Signal register\n */\ndeclare function readSignal(unit: Value): Value;\n/**\n * Reads the Radio signal on a specified band\n * @param band The band to check for\n * @returns Value of the radio signal\n */\ndeclare function readRadio(band: Value): Value;\n/**\n * *DEPRECATED* Use Loop Signal (Match) instead\n * @param signal Signal\n * @returns Entity with signal\n */\ndeclare function deprecatedSignals(signal: Value): IterableIterator<Value>;\n/**\n * Loops through all units with a signal of similar type\n * @param signal Signal\n * @returns [Entity with signal, Found signal]\n */\ndeclare function matchingSignals(signal: Value): IterableIterator<[Value, Value]>;\n/**\n * Returns the amount an item can stack to\n * @param item Item to count\n * @returns Max Stack\n */\ndeclare function getMaxStack(item: Value | ItemNum): Value;\n/**\n * Equips a component if it exists\n * @param component Component to equip\n * @param slot_index? Individual slot to equip component from\n */\ndeclare function equip(component: Value | Comp, slot_index?: Value | number): boolean;\n/**\n * Unequips a component if it exists\n * @param component Component to unequip\n * @param slot_index? Individual slot to try to unequip component from\n */\ndeclare function unequip(component: Value | Comp, slot_index?: Value | number): boolean;\n/**\n * Gets the closest visible entity matching a filter\n * @param filter1? Filter to check\n * @param filter2? Second Filter\n * @param filter3? Third Filter\n * @returns Entity\n */\ndeclare function getClosestEntity(filter1?: Value | RadarFilter, filter2?: Value | RadarFilter, filter3?: Value | RadarFilter): Value;\n/**\n * Drop off items at a unit or destination\n\nIf a number is set it will drop off an amount to fill the target unit up to that amount\nIf unset it will try to drop off everything.\n * @param destination Unit or destination to bring items to\n * @param item_amount? Item and amount to drop off\n */\ndeclare function drop(destination: Value, item_amount?: Value | ItemNum): void;\n/**\n * Drop off items at a unit or destination\n\nIf a number is set it will drop off an amount to fill the target unit up to that amount\nIf unset it will try to drop off everything.\n * @param destination Unit or destination to bring items to\n * @param item_amount? Item and amount to drop off\n */\ndeclare function dropSpecificAmount(destination: Value, item_amount?: Value | ItemNum): void;\n/**\n * Picks up a specific number of items from an entity\n\nWill try to pick up the specified amount, if no amount\nis specified it will try to pick up everything.\n * @param source Unit to take items from\n * @param item_amount? Item and amount to pick up\n */\ndeclare function pickup(source: Value, item_amount?: Value | ItemNum): void;\n/**\n * Requests an item if it doesn't exist in the inventory\n * @param item Item and amount to order\n */\ndeclare function requestItem(item: Value | ItemNum): void;\n/**\n * Request Inventory to be sent to nearest shared storage with corresponding locked slots\n */\ndeclare function orderToSharedStorage(): void;\n/**\n * Requests an item and waits until it exists in inventory\n * @param item Item and amount to order\n */\ndeclare function requestWait(item: Value | ItemNum): void;\n/**\n * Gets the amount of resource\n * @param resource Resource Node to check\n */\ndeclare function getResourceNum(resource: Value): Value;\n/**\n * Reads the first item in your inventory\n */\ndeclare function firstInventoryItem(): Value | undefined;\n/**\n * Reads the item contained in the specified slot index\n * @param index Slot index\n */\ndeclare function getInventoryItem(index: Value | number): Value | undefined;\n/**\n * Loops through Inventory\n * @returns [Item Inventory, Items reserved for outgoing order or recipe, Items available, Space reserved for an incoming order, Remaining space]\n */\ndeclare function inventoryItems(): IterableIterator<[Value, Value, Value, Value, Value]>;\n/**\n * Loops through Ingredients\n * @returns Recipe Ingredient\n */\ndeclare function recipieIngredients(recipe: Value | Item): IterableIterator<Value>;\n/**\n * Transfers an Item to another Unit\n * @param target Target unit\n * @param item Item and amount to transfer\n */\ndeclare function orderTransfer(target: Value, item: Value | ItemNum): void;\n/**\n * Check if a specific item slot index is fixed\n * @param slot_index Individual slot to check\n */\ndeclare function isFixed(slot_index: Value | number): boolean;\n/**\n * Check if a specific component has been equipped\n * @param component Component to check\n * @returns Returns how many instances of a component equipped on this Unit\n */\ndeclare function isEquipped(component: Value | Comp): Value | undefined;\n/**\n * Shuts down the power of the Unit\n */\ndeclare function shutdown(): void;\n/**\n * Turns on the power of the Unit\n */\ndeclare function turnon(): void;\n/**\n * Connects Units from Logistics Network\n */\ndeclare function connect(): void;\n/**\n * Disconnects Units from Logistics Network\n */\ndeclare function disconnect(): void;\n/**\n * Enable Unit to deliver on transport route\n */\ndeclare function enableTransportRoute(): void;\n/**\n * Disable Unit to deliver on transport route\n */\ndeclare function disableTransportRoute(): void;\n/**\n * Sorts Storage Containers on Unit\n */\ndeclare function sortStorage(): void;\n/**\n * Tries to unpack all packaged items\n */\ndeclare function unpackageAll(): void;\n/**\n * Tries to pack all packable units into items\n */\ndeclare function packageAll(): void;\n/**\n * Stop movement and abort what is currently controlling the entities movement\n */\ndeclare function stop(): void;\n/**\n * Gets location of a a seen entity\n * @param entity Entity to get coordinates of\n * @returns Coordinate of entity\n */\ndeclare function getLocation(entity: Value): Value;\n/**\n * Moves towards a tile East of the current location at the specified distance\n * @param number Number of tiles to move East\n */\ndeclare function moveEast(number: Value | number): void;\n/**\n * Moves towards a tile West of the current location at the specified distance\n * @param number Number of tiles to move West\n */\ndeclare function moveWest(number: Value | number): void;\n/**\n * Moves towards a tile North of the current location at the specified distance\n * @param number Number of tiles to move North\n */\ndeclare function moveNorth(number: Value | number): void;\n/**\n * Moves towards a tile South of the current location at the specified distance\n * @param number Number of tiles to move South\n */\ndeclare function moveSouth(number: Value | number): void;\n/**\n * Move to another unit while continuing the program\n * @param target Unit to move to\n */\ndeclare function domoveAsync(target: Value): void;\n/**\n * Moves to another unit or within a range of another unit\n * @param target Unit to move to, the number specifies the range in which to be in\n */\ndeclare function domove(target: Value): void;\n/**\n * *DEPRECATED* Use Move Unit\n * @param target Unit to move to, the number specifies the range in which to be in\n */\ndeclare function domoveRange(target: Value): void;\n/**\n * Moves out of range of another unit\n * @param target Unit to move away from\n */\ndeclare function moveawayRange(target: Value): void;\n/**\n * Moves in a scouting pattern around the factions home location\n */\ndeclare function scout(): void;\n/**\n * Scan for the closest unit that matches the filters\n * @param filter_1? First filter\n * @param filter_2? Second filter\n * @param filter_3? Third filter\n */\ndeclare function radar(filter_1?: Value | RadarFilter, filter_2?: Value | RadarFilter, filter_3?: Value | RadarFilter): Value | undefined;\n/**\n * Mines a single resource\n * @param resource Resource to Mine\n */\ndeclare function mine(resource: Value | ResourceNum): \"ok\" | \"unable\" | \"full\";\n/**\n * Gets the current world stability\n * @returns Stability\n */\ndeclare function getStability(): Value;\n/**\n * Gives you the percent that value is of Max Value\n * @param value Value to check\n * @param max_value Max Value to get percentage of\n * @returns Percent\n */\ndeclare function percentValue(value: Value, max_value: Value): Value;\n/**\n * Remaps a value between two ranges\n * @param value Value to Remap\n * @param input_low Low value for input\n * @param input_high High value for input\n * @param target_low Low value for target\n * @param target_high High value for target\n * @returns Remapped value\n */\ndeclare function remapValue(value: Value, input_low: Value, input_high: Value, target_low: Value, target_high: Value): Value;\n/**\n * Divert program depending time of day\n */\ndeclare function daytime(): boolean;\n/**\n * Divert program depending time of day\n */\ndeclare function nighttime(): boolean;\n/**\n * Counts the number of the passed item in your logistics network\n * @param item Item to count\n * @returns Number of this item in your faction\n */\ndeclare function factionItemAmount(item: Value | Item): Value | undefined;\n/**\n * Attempts to reads the internal key of the unit\n * @param frame Structure to read the key for\n * @returns Number key of structure\n */\ndeclare function readkey(frame: Value): Value;\n/**\n * Returns if a unit can produce an item\n * @param item Production Item\n * @param component? Optional Component to check (if Component not equipped)\n */\ndeclare function canProduce(item: Value | Item, component?: Value): boolean;\n/**\n * Returns the ingredients required to produce an item\n * @returns [First Ingredient, Second Ingredient, Third Ingredient]\n */\ndeclare function getIngredients(product: Value | Item): [Value, Value, Value];\n/**\n * Triggers a faction notification\n * @param notify_value Notification Value\n */\ndeclare function notify(notify_value: Value): void;\n/**\n * Triggers a faction notification\n */\ndeclare function notify(text: string): void;\n/**\n * Triggers a faction notification\n * @param notify_value Notification Value\n */\ndeclare function notify(text: string, notify_value: Value): void;\n/**\n * Gets the factions home unit\n * @returns Factions home unit\n */\ndeclare function gethome(): Value;\n/**\n * Plays the Ping effect and notifies other players\n * @param target Target unit\n */\ndeclare function ping(target: Value): void;\n/**\n * Places a construction site for a specific structure\n * @param coordinate Target location, or at currently location if not specified\n * @param rotation? Building Rotation (0 to 3) (default 0)\n */\ndeclare function build(coordinate: Value | CoordNum, rotation?: Value | number): boolean;\n/**\n * Sets a production component to produce a blueprint\n */\ndeclare function produce(): void;\n/**\n * Set the signpost to specific text\n */\ndeclare function setSignpost(text: string): void;\n/**\n * Launches a satellite if equipped on an AMAC\n */\ndeclare function launch(): void;\n/**\n * Tells a satellite that has been launched to land\n */\ndeclare function land(): void;\n/**\n * Collect information for running the auto base controller\n * @param range Range of operation\n */\ndeclare function gatherInformation(range: Value | number): void;\n/**\n * Construct carrier bots for delivering orders or to use for other tasks\n * @param carriers Type and count of carriers to make\n */\ndeclare function makeCarrier(carriers: Value | FrameNum): boolean;\n/**\n * Construct and equip miner components on available carrier bots\n * @param resource_count Resource type and number of miners to maintain\n */\ndeclare function makeMiner(resource_count: Value | ItemNum): boolean;\n/**\n * Produce materials needed in construction sites\n */\ndeclare function serveConstruction(): boolean;\n/**\n * Build and maintain dedicated production buildings\n * @param item_count Item type and number of producers to maintain\n * @param component Production component\n * @param building Building type to use as producer\n * @param location Location offset from self\n */\ndeclare function makeProducer(item_count: Value | ItemNum, component: Value | Comp, building: Value | Frame, location: Value | Coord): boolean;\n/**\n * Construct and equip turret components on available carrier bots\n * @param number Number of turret bots to maintain\n */\ndeclare function makeTurretBots(number: Value | number): boolean;\n\ndeclare const self: Value;\ndeclare var goto: Value;\ndeclare var store: Value;\ndeclare var visual: Value;\ndeclare var signal: Value;\n\ntype AnyValue = Coord | ItemNum | FrameNum | RadarFilter;\ntype Coord = [number, number];\ntype CoordNum = Coord | number;\n\ntype RadarFilter =\n  | Resource\n  | \"v_own_faction\"\n  | \"v_ally_faction\"\n  | \"v_enemy_faction\"\n  | \"v_world_faction\"\n  | \"v_bot\"\n  | \"v_building\"\n  | \"v_is_foundation\"\n  | \"v_construction\"\n  | \"v_droppeditem\"\n  | \"v_resource\"\n  | \"v_mineable\"\n  | \"v_anomaly\"\n  | \"v_valley\"\n  | \"v_plateau\"\n  | \"v_not_blight\"\n  | \"v_blight\"\n  | \"v_alien_faction\"\n  | \"v_human_faction\"\n  | \"v_robot_faction\"\n  | \"v_bug_faction\"\n  | \"v_solved\"\n  | \"v_unsolved\"\n  | \"v_can_loot\"\n  | \"v_in_powergrid\"\n  | \"v_mothership\"\n  | \"v_damaged\"\n  | \"v_infected\"\n  | \"v_broken\"\n  | \"v_unpowered\"\n  | \"v_emergency\"\n  | \"v_powereddown\"\n  | \"v_pathblocked\"\n  | \"v_idle\";\n\ntype Item =\n  | Comp\n  | \"metalore\"\n  | \"crystal\"\n  | \"laterite\"\n  | \"aluminiumrod\"\n  | \"aluminiumsheet\"\n  | \"silica\"\n  | \"fused_electrodes\"\n  | \"reinforced_plate\"\n  | \"optic_cable\"\n  | \"circuit_board\"\n  | \"infected_circuit_board\"\n  | \"obsidian\"\n  | \"metalbar\"\n  | \"metalplate\"\n  | \"foundationplate\"\n  | \"ldframe\"\n  | \"energized_plate\"\n  | \"hdframe\"\n  | \"beacon_frame\"\n  | \"refined_crystal\"\n  | \"crystal_powder\"\n  | \"obsidian_brick\"\n  | \"alien_artifact\"\n  | \"alien_artifact_research\"\n  | \"silicon\"\n  | \"wire\"\n  | \"cable\"\n  | \"icchip\"\n  | \"micropro\"\n  | \"cpu\"\n  | \"steelblock\"\n  | \"concreteslab\"\n  | \"ceramictiles\"\n  | \"polymer\"\n  | \"robot_datacube\"\n  | \"alien_datacube\"\n  | \"human_datacube\"\n  | \"blight_datacube\"\n  | \"virus_research_data\"\n  | \"empty_databank\"\n  | \"datacube_matrix\"\n  | \"robot_research\"\n  | \"human_research\"\n  | \"alien_research\"\n  | \"blight_research\"\n  | \"virus_research\"\n  | \"adv_data\"\n  | \"human_databank\"\n  | \"alien_databank\"\n  | \"drone_transfer_package\"\n  | \"drone_transfer_package2\"\n  | \"drone_miner_package\"\n  | \"drone_adv_miner_package\"\n  | \"drone_defense_package1\"\n  | \"flyer_package_m\"\n  | \"satellite_package\"\n  | \"blight_crystal\"\n  | \"blight_extraction\"\n  | \"blightbar\"\n  | \"blight_plasma\"\n  | \"microscope\"\n  | \"transformer\"\n  | \"smallreactor\"\n  | \"engine\"\n  | \"datakey\"\n  | \"alien_core\"\n  | \"bot_ai_core\"\n  | \"elain_ai_core\"\n  | \"broken_ai_core\"\n  | \"bug_carapace\"\n  | \"anomaly_particle\"\n  | \"anomaly_cluster\"\n  | \"resimulator_core\"\n  | \"power_petal\"\n  | \"phase_leaf\"\n  | \"virus_source_code\"\n  | \"rainbow_research\";\n\ntype ItemNum = Item | number | { id: Item; num: number };\ntype Comp =\n  | \"c_refinery\"\n  | \"c_robotics_factory\"\n  | \"c_small_relay\"\n  | \"c_large_power_relay\"\n  | \"c_solar_panel\"\n  | \"c_capacitor\"\n  | \"c_higrade_capacitor\"\n  | \"c_small_battery\"\n  | \"c_shared_storage\"\n  | \"c_internal_storage\"\n  | \"c_autobase\"\n  | \"c_portablecrane\"\n  | \"c_internal_crane1\"\n  | \"c_internal_crane2\"\n  | \"c_radio_storage\"\n  | \"c_modulehealth_s\"\n  | \"c_modulehealth_m\"\n  | \"c_modulehealth_l\"\n  | \"c_modulevisibility_s\"\n  | \"c_modulevisibility_m\"\n  | \"c_modulevisibility_l\"\n  | \"c_moduleefficiency_s\"\n  | \"c_moduleefficiency_m\"\n  | \"c_moduleefficiency_l\"\n  | \"c_modulespeed_s\"\n  | \"c_modulespeed_m\"\n  | \"c_modulespeed_l\"\n  | \"c_particle_leaves\"\n  | \"c_glitch\"\n  | \"c_damageself\"\n  | \"c_small_storage\"\n  | \"c_destroyself\"\n  | \"c_phase_plant\"\n  | \"c_damage_plant\"\n  | \"c_damage_plant_internal\"\n  | \"c_large_storage\"\n  | \"c_fusion_generator\"\n  | \"c_battery\"\n  | \"c_large_battery\"\n  | \"c_large_power_transmitter\"\n  | \"c_medium_storage\"\n  | \"c_blight_container_i\"\n  | \"c_blight_container_s\"\n  | \"c_blight_container_m\"\n  | \"c_virus_decomposer\"\n  | \"c_alien_attack\"\n  | \"c_alien_extractor\"\n  | \"c_alien_factory\"\n  | \"c_human_refinery\"\n  | \"c_human_factory_robots\"\n  | \"c_human_science_analyzer_robots\"\n  | \"c_human_commandcenter\"\n  | \"c_human_barracks\"\n  | \"c_human_spaceport\"\n  | \"c_human_science\"\n  | \"c_alien_research\";\ntype CompNum = Comp | number | { id: Comp; num: number };\n\ntype Resource =\n  | \"metalore\"\n  | \"crystal\"\n  | \"laterite\"\n  | \"silica\"\n  | \"obsidian\"\n  | \"alien_artifact\"\n  | \"alien_artifact_research\"\n  | \"blight_crystal\"\n  | \"blight_extraction\"\n  | \"bug_carapace\";\ntype ResourceNum = Resource | number | { id: Resource; num: number };\ntype Frame =\n  | \"f_building1x1a\"\n  | \"f_building1x1b\"\n  | \"f_building1x1c\"\n  | \"f_building1x1d\"\n  | \"f_building1x1f\"\n  | \"f_building1x1g\"\n  | \"f_building2x1a\"\n  | \"f_building2x1e\"\n  | \"f_building2x1f\"\n  | \"f_building2x1g\"\n  | \"f_building2x2b\"\n  | \"f_building2x2f\"\n  | \"f_bot_1s_as\"\n  | \"f_bot_1s_adw\"\n  | \"f_bot_2m_as\"\n  | \"f_bot_1s_a\"\n  | \"f_bot_1s_b\"\n  | \"f_bot_2s\"\n  | \"f_construction\"\n  | \"f_foundation\"\n  | \"f_human_foundation\"\n  | \"f_human_foundation_basic\"\n  | \"f_feature\"\n  | \"f_blocking_feature\"\n  | \"f_floating_feature\"\n  | \"f_dropped_resource\"\n  | \"f_building1x1e\"\n  | \"f_building2x1b\"\n  | \"f_building2x1c\"\n  | \"f_building2x1d\"\n  | \"f_building2x2a\"\n  | \"f_building2x2c\"\n  | \"f_building2x2d\"\n  | \"f_building2x2e\"\n  | \"f_building_pf\"\n  | \"f_transport_bot\"\n  | \"f_bot_1m1s\"\n  | \"f_bot_1m_b\"\n  | \"f_bot_1m_c\"\n  | \"f_bot_1l_a\"\n  | \"f_flyer_bot\"\n  | \"f_drone_transfer_a\"\n  | \"f_drone_transfer_a2\"\n  | \"f_drone_miner_a\"\n  | \"f_drone_adv_miner\"\n  | \"f_drone_defense_a\"\n  | \"f_flyer_m\"\n  | \"f_satellite\"\n  | \"f_building3x2a\"\n  | \"f_building3x2b\"\n  | \"f_building_fg\"\n  | \"f_human_flyer\"\n  | \"f_human_tank\"\n  | \"f_human_miner\"\n  | \"f_alienbot\"\n  | \"f_human_explorable_5x5_a\"\n  | \"f_carrier_bot\";\ntype FrameNum = Frame | number | { id: Frame; num: number };\n\ndeclare function coord(x: number, y: number): Value;\ndeclare function value(id: Comp, num?: number): Value;\ndeclare function value(id: Item, num?: number): Value;\ndeclare function value(id: Resource, num?: number): Value;\ndeclare function value(id: Frame, num?: number): Value;\n"