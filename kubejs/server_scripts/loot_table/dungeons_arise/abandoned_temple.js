LootJS.modifiers((event) => {

    event.addTableModifier(/.*abandoned_temple_entrance/)
        .pool(pool => {
            pool.rolls([1, 3]) 
            
            // --- Create ---
            pool.addEntry(LootEntry.of('create:zinc_nugget').withWeight(20).setCount([3, 8])); 
            pool.addEntry(LootEntry.of('create:andesite_alloy').withWeight(10).setCount([1, 4])); 
            
            // --- Farmer's Delight ---
            pool.addEntry(LootEntry.of('farmersdelight:rope').withWeight(15).setCount([2, 6])); 
            pool.addEntry(LootEntry.of('farmersdelight:cabbage_seeds').withWeight(10).setCount([1, 3])); 
            pool.addEntry(LootEntry.of('farmersdelight:tomato_seeds').withWeight(10).setCount([1, 3]));
            pool.addEntry(LootEntry.of('farmersdelight:straw').withWeight(15).setCount([4, 12])); 
        });

    event.addTableModifier(/.*abandoned_temple_top/)
        .pool(pool => {
            pool.rolls([1, 2])
            
            // --- Create ---
            pool.addEntry(LootEntry.of('create:shaft').withWeight(15).setCount([2, 5])); 
            pool.addEntry(LootEntry.of('create:cogwheel').withWeight(15).setCount([1, 3])); 
            pool.addEntry(LootEntry.of('create:large_cogwheel').withWeight(10).setCount([1, 2])); 
            pool.addEntry(LootEntry.of('create:goggles').withWeight(2)); 

            // --- Farmer's Delight ---
            pool.addEntry(LootEntry.of('farmersdelight:canvas').withWeight(15).setCount([1, 3])); 
            pool.addEntry(LootEntry.of('farmersdelight:iron_knife').withWeight(5).enchantWithLevels(10)); 
            pool.addEntry(LootEntry.of('farmersdelight:rich_soil').withWeight(10).setCount([2, 4])); 
            pool.addEntry(LootEntry.of('farmersdelight:mixed_salad').withWeight(10).setCount([1, 2])); 
        });

    event.addTableModifier(/.*abandoned_temple_map/)
        .pool(pool => {
            pool.rolls([1, 2])
            
            // --- Create ---
            pool.addEntry(LootEntry.of('create:electron_tube').withWeight(8).setCount([1, 2])); 
            pool.addEntry(LootEntry.of('create:rose_quartz').withWeight(10).setCount([2, 5])); 
            pool.addEntry(LootEntry.of('create:precision_mechanism').withWeight(2)); 
            
            // --- Farmer's Delight ---
            pool.addEntry(LootEntry.of('farmersdelight:cooking_pot').withWeight(5)); 
            pool.addEntry(LootEntry.of('farmersdelight:skillet').withWeight(5)); 
            pool.addEntry(LootEntry.of('farmersdelight:shepherds_pie').withWeight(10)); 
            pool.addEntry(LootEntry.of('farmersdelight:stuffed_pumpkin_block').withWeight(3)); 
        });

});