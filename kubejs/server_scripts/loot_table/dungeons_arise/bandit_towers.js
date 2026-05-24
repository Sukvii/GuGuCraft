LootJS.modifiers(event => {
    const COIN = {
        SPUR: "numismatics:spur",       // 价值 1
        BEVEL: "numismatics:bevel",     // 价值 8
        SPROCKET: "numismatics:sprocket", // 价值 16
        COG: "numismatics:cog",         // 价值 64
        CROWN: "numismatics:crown"      // 价值 512
    };

    event.addTableModifier([
        /.*bandit_towers_barrels/,
        /.*bandit_towers_normal/,
        /.*bandit_towers_rooms/
    ]).pool(pool => {
        // 设置抽取次数范围，以此来"填满"箱子的格子，而不是给一堆叠在一起的物品
        pool.rolls([4, 8]); 
        
        // --- 货币 (低面额) ---
        pool.addEntry(LootEntry.of(COIN.SPUR).setCount([2, 6]).withWeight(40));
        pool.addEntry(LootEntry.of(COIN.BEVEL).setCount([1, 2]).withWeight(10));

        // --- 机械动力 (基础) ---
        pool.addEntry(LootEntry.of("create:andesite_alloy").setCount([2, 4]).withWeight(20));
        pool.addEntry(LootEntry.of("create:zinc_ingot").setCount([1, 3]).withWeight(15));
        pool.addEntry(LootEntry.of("create:shaft").setCount([2, 5]).withWeight(15));
        pool.addEntry(LootEntry.of("create:cogwheel").setCount([1, 3]).withWeight(10));
        pool.addEntry(LootEntry.of("createaddition:zinc_sheet").setCount([1, 2]).withWeight(10));

        // --- 农夫乐事 & 下界乐事 (基础食材) ---
        pool.addEntry(LootEntry.of("farmersdelight:onion").setCount([3, 6]).withWeight(15));
        pool.addEntry(LootEntry.of("farmersdelight:tomato").setCount([3, 6]).withWeight(15));
        pool.addEntry(LootEntry.of("farmersdelight:rice_panicle").setCount([3, 6]).withWeight(15));
    });

    event.addTableModifier([
        /.*bandit_towers_supply/,
        /.*bandit_towers_gardens/
    ]).pool(pool => {
        pool.rolls([5, 10]); // 增加抽取次数

        // --- 货币 (中面额) ---
        pool.addEntry(LootEntry.of(COIN.SPROCKET).setCount([1, 3]).withWeight(30));
        pool.addEntry(LootEntry.of(COIN.BEVEL).setCount([4, 12]).withWeight(20));

        // --- 机械动力 & C&A (进阶) ---
        pool.addEntry(LootEntry.of("create:brass_ingot").setCount([2, 5]).withWeight(25));
        pool.addEntry(LootEntry.of("create:polished_rose_quartz").setCount([2, 6]).withWeight(20));
        pool.addEntry(LootEntry.of("create:electron_tube").setCount([1, 2]).withWeight(15)); // 电子管
        pool.addEntry(LootEntry.of("create:belt_connector").setCount([2, 4]).withWeight(15));
        pool.addEntry(LootEntry.of("createaddition:capacitor").setCount([1, 2]).withWeight(10)); // 电容
        pool.addEntry(LootEntry.of("createaddition:copper_wire").setCount([4, 16]).withWeight(20));

        // --- 农夫乐事 & 下界乐事 (成品食物/高价值食材) ---
        pool.addEntry(LootEntry.of("farmersdelight:hamburger").setCount([1, 2]).withWeight(15));
        pool.addEntry(LootEntry.of("farmersdelight:pasta_with_meatballs").setCount([1, 2]).withWeight(15));
        pool.addEntry(LootEntry.of("farmersdelight:bacon_sandwich").setCount([1, 2]).withWeight(15));
        pool.addEntry(LootEntry.of("mynethersdelight:hoglin_loin").setCount([1, 3]).withWeight(10));
        pool.addEntry(LootEntry.of("mynethersdelight:strider_slice").setCount([1, 3]).withWeight(10));
    });

    event.addTableModifier([
        /.*bandit_towers_treasure/
    ]).pool(pool => {
        pool.rolls([6, 12]); // 更多的宝藏物品铺满箱子

        // --- 货币 (高面额) ---
        pool.addEntry(LootEntry.of(COIN.COG).setCount([1, 3]).withWeight(30)); // 价值 64
        pool.addEntry(LootEntry.of(COIN.CROWN).setCount([1, 1]).withWeight(5));  // 价值 512 (稀有)

        // --- 机械动力 & C&A (高科技) ---
        pool.addEntry(LootEntry.of("create:precision_mechanism").setCount([1, 2]).withWeight(20)); // 精密构件
        pool.addEntry(LootEntry.of("create:sturdy_sheet").setCount([2, 4]).withWeight(20));
        pool.addEntry(LootEntry.of("createaddition:electric_motor").withWeight(5)); // 电机 (稀有)
        pool.addEntry(LootEntry.of("createaddition:alternator").withWeight(5)); // 发电机 (稀有)
        pool.addEntry(LootEntry.of("create:brass_sheet").setCount([4, 8]).withWeight(25));
        
        // --- 农夫乐事 (盛宴/厨具) ---
        // 盛宴类物品不能堆叠，非常适合拿来填充格子
        pool.addEntry(LootEntry.of("farmersdelight:roast_chicken_block").withWeight(10)); 
        pool.addEntry(LootEntry.of("farmersdelight:shepherds_pie_block").withWeight(10));
        pool.addEntry(LootEntry.of("farmersdelight:netherite_knife").withWeight(2)); // 极稀有厨具
        pool.addEntry(LootEntry.of("farmersdelight:skillet").withWeight(10));

        pool.addEntry(LootEntry.of("sophisticatedbackpacks:stack_upgrade_tier_4").withWeight(1));
        
    });
});