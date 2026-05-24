LootJS.modifiers((event) => {

    const CURRENCY = {
        SPUR: "numismatics:spur",
        BEVEL: "numismatics:bevel",
        SPROCKET: "numismatics:sprocket",
        COG: "numismatics:cog",
        CROWN: "numismatics:crown"
    };

    event.addTableModifier(/.*aviary_barrels/) 
        .pool((pool) => {
            pool.rolls([1, 3]);
            
            // --- 货币 (低面额) ---
            pool.addEntry(LootEntry.of(CURRENCY.SPUR).withWeight(20).setCount([1, 5])); 
            pool.addEntry(LootEntry.of(CURRENCY.BEVEL).withWeight(10).setCount([1, 3]));

            // --- 农夫乐事 (Farmer's Delight) 食物 ---
            pool.addEntry(LootEntry.of("farmersdelight:fried_rice").withWeight(15)); 
            pool.addEntry(LootEntry.of("farmersdelight:bacon_and_eggs").withWeight(15)); 
            pool.addEntry(LootEntry.of("farmersdelight:pasta_with_meatballs").withWeight(10)); 
            
            // --- 下界乐事 (Nether's Delight) 食物  ---
            pool.addEntry(LootEntry.of("mynethersdelight:hoglin_loin").withWeight(10)); 
            pool.addEntry(LootEntry.of("mynethersdelight:magma_cake_block").withWeight(5)); 
            pool.addEntry(LootEntry.of("ends_delight:grilled_shulker_block").withWeight(5)); 
        });

    event.addTableModifier(/.*aviary_normal/)
        .pool((pool) => {
            pool.rolls([2, 4]);

            // --- 货币 (中面额) ---
            pool.addEntry(LootEntry.of(CURRENCY.BEVEL).withWeight(30).setCount([2, 6]));
            pool.addEntry(LootEntry.of(CURRENCY.SPROCKET).withWeight(15).setCount([1, 3]));
            pool.addEntry(LootEntry.of(CURRENCY.COG).withWeight(5).setCount(1)); 

            // --- 机械动力 (Create) 基础资源 ---
            pool.addEntry(LootEntry.of("create:andesite_alloy").withWeight(25).setCount([4, 12])); 
            pool.addEntry(LootEntry.of("create:shaft").withWeight(20).setCount([4, 8])); 
            pool.addEntry(LootEntry.of("create:cogwheel").withWeight(15).setCount([2, 6])); 
            pool.addEntry(LootEntry.of("create:large_cogwheel").withWeight(10).setCount([1, 4])); 
            pool.addEntry(LootEntry.of("create:rose_quartz").withWeight(10).setCount([2, 6])); 
            
            // --- Create: Crafts & Additions ---
            pool.addEntry(LootEntry.of("createaddition:zinc_sheet").withWeight(10).setCount([2, 5])); 
            pool.addEntry(LootEntry.of("createaddition:capacitor").withWeight(5).setCount([1, 2])); 

            // --- 乐事系列功能方块 ---
            pool.addEntry(LootEntry.of("farmersdelight:skillet").withWeight(5)); 
            pool.addEntry(LootEntry.of("farmersdelight:cooking_pot").withWeight(5)); 
        });

    event.addTableModifier(/.*aviary_treasure/)
        .pool((pool) => {
            pool.rolls([1, 2]); 

            // --- 货币 (高面额) ---
            pool.addEntry(LootEntry.of(CURRENCY.SPROCKET).withWeight(40).setCount([4, 10]));
            pool.addEntry(LootEntry.of(CURRENCY.COG).withWeight(25).setCount([2, 5])); 
            pool.addEntry(LootEntry.of(CURRENCY.CROWN).withWeight(5).setCount(1)); 

            // --- 机械动力 (Create) 高级资源 ---
            pool.addEntry(LootEntry.of("create:precision_mechanism").withWeight(15)); 
            pool.addEntry(LootEntry.of("create:electron_tube").withWeight(20).setCount([1, 3])); 
            pool.addEntry(LootEntry.of("create:blaze_burner").withWeight(10)); 
            pool.addEntry(LootEntry.of("create:brass_ingot").withWeight(30).setCount([5, 16])); 

            // --- Create: Crafts & Additions 高级资源 ---
            pool.addEntry(LootEntry.of("createaddition:electric_motor").withWeight(5)); 
            pool.addEntry(LootEntry.of("createaddition:alternator").withWeight(5)); 
            pool.addEntry(LootEntry.of("createaddition:diamond_grit_sandpaper").withWeight(10)); 

            // --- 下界乐事 ---
            pool.addEntry(LootEntry.of("mynethersdelight:golden_trophy").withWeight(2)); 
        });
});