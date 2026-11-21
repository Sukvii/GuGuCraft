LootJS.modifiers(event => {
    const COIN = {
        SPUR: "numismatics:spur",       // value 1
        BEVEL: "numismatics:bevel",     // value 8
        SPROCKET: "numismatics:sprocket", // value 16
        COG: "numismatics:cog",         // value 64
        CROWN: "numismatics:crown"      // value 512
    };

    event.addTableModifier([
        /.*bandit_towers_barrels/,
        /.*bandit_towers_normal/,
        /.*bandit_towers_rooms/
    ]).pool(pool => {
        // Set a roll range so the loot "fills" the chest slots instead of piling up into a few stacks
        pool.rolls([4, 8]); 
        
        // --- Currency (low denominations) ---
        pool.addEntry(LootEntry.of(COIN.SPUR).setCount([2, 6]).withWeight(40));
        pool.addEntry(LootEntry.of(COIN.BEVEL).setCount([1, 2]).withWeight(10));

        // --- Create (basic) ---
        pool.addEntry(LootEntry.of("create:andesite_alloy").setCount([2, 4]).withWeight(20));
        pool.addEntry(LootEntry.of("create:zinc_ingot").setCount([1, 3]).withWeight(15));
        pool.addEntry(LootEntry.of("create:shaft").setCount([2, 5]).withWeight(15));
        pool.addEntry(LootEntry.of("create:cogwheel").setCount([1, 3]).withWeight(10));
        pool.addEntry(LootEntry.of("createaddition:zinc_sheet").setCount([1, 2]).withWeight(10));

        // --- Farmer's Delight & Nether's Delight (basic ingredients) ---
        pool.addEntry(LootEntry.of("farmersdelight:onion").setCount([3, 6]).withWeight(15));
        pool.addEntry(LootEntry.of("farmersdelight:tomato").setCount([3, 6]).withWeight(15));
        pool.addEntry(LootEntry.of("farmersdelight:rice_panicle").setCount([3, 6]).withWeight(15));
    });

    event.addTableModifier([
        /.*bandit_towers_supply/,
        /.*bandit_towers_gardens/
    ]).pool(pool => {
        pool.rolls([5, 10]); // more rolls

        // --- Currency (mid denominations) ---
        pool.addEntry(LootEntry.of(COIN.SPROCKET).setCount([1, 3]).withWeight(30));
        pool.addEntry(LootEntry.of(COIN.BEVEL).setCount([4, 12]).withWeight(20));

        // --- Create & C&A (advanced) ---
        pool.addEntry(LootEntry.of("create:brass_ingot").setCount([2, 5]).withWeight(25));
        pool.addEntry(LootEntry.of("create:polished_rose_quartz").setCount([2, 6]).withWeight(20));
        pool.addEntry(LootEntry.of("create:electron_tube").setCount([1, 2]).withWeight(15)); // Electron Tube
        pool.addEntry(LootEntry.of("create:belt_connector").setCount([2, 4]).withWeight(15));
        pool.addEntry(LootEntry.of("createaddition:capacitor").setCount([1, 2]).withWeight(10)); // Capacitor
        pool.addEntry(LootEntry.of("createaddition:copper_wire").setCount([4, 16]).withWeight(20));

        // --- Farmer's Delight & Nether's Delight (finished food / valuable ingredients) ---
        pool.addEntry(LootEntry.of("farmersdelight:hamburger").setCount([1, 2]).withWeight(15));
        pool.addEntry(LootEntry.of("farmersdelight:pasta_with_meatballs").setCount([1, 2]).withWeight(15));
        pool.addEntry(LootEntry.of("farmersdelight:bacon_sandwich").setCount([1, 2]).withWeight(15));
        pool.addEntry(LootEntry.of("mynethersdelight:hoglin_loin").setCount([1, 3]).withWeight(10));
        pool.addEntry(LootEntry.of("mynethersdelight:strider_slice").setCount([1, 3]).withWeight(10));
    });

    event.addTableModifier([
        /.*bandit_towers_treasure/
    ]).pool(pool => {
        pool.rolls([6, 12]); // more treasure items to fill the chest

        // --- Currency (high denominations) ---
        pool.addEntry(LootEntry.of(COIN.COG).setCount([1, 3]).withWeight(30)); // value 64
        pool.addEntry(LootEntry.of(COIN.CROWN).setCount([1, 1]).withWeight(5));  // value 512 (rare)

        // --- Create & C&A (high tech) ---
        pool.addEntry(LootEntry.of("create:precision_mechanism").setCount([1, 2]).withWeight(20)); // Precision Mechanism
        pool.addEntry(LootEntry.of("create:sturdy_sheet").setCount([2, 4]).withWeight(20));
        pool.addEntry(LootEntry.of("createaddition:electric_motor").withWeight(5)); // Electric Motor (rare)
        pool.addEntry(LootEntry.of("createaddition:alternator").withWeight(5)); // Alternator (rare)
        pool.addEntry(LootEntry.of("create:brass_sheet").setCount([4, 8]).withWeight(25));
        
        // --- Farmer's Delight (feasts / kitchenware) ---
        // Feast items do not stack, which makes them great for filling slots
        pool.addEntry(LootEntry.of("farmersdelight:roast_chicken_block").withWeight(10)); 
        pool.addEntry(LootEntry.of("farmersdelight:shepherds_pie_block").withWeight(10));
        pool.addEntry(LootEntry.of("farmersdelight:netherite_knife").withWeight(2)); // very rare kitchenware
        pool.addEntry(LootEntry.of("farmersdelight:skillet").withWeight(10));

        pool.addEntry(LootEntry.of("sophisticatedbackpacks:stack_upgrade_tier_4").withWeight(1));
        
    });
});