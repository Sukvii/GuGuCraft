(() => {
    const cfg = global.SOURCE_CONVERTER

    ServerEvents.recipes(event => {
        event.shaped(cfg.MACHINE_ID, [
            'AGA',
            'MTM',
            'APA'
        ], {
            A: 'kubejs:arcane_ingot',
            G: 'ars_nouveau:source_gem',
            M: 'kubejs:arcane_mechanism',
            T: 'create:fluid_tank',
            P: 'create:fluid_pipe'
        }).id('kubejs:crafting/source_converter')

        // 整合包移除了原版 Ars 配方，补上与本机器配套的魔源罐。
        event.shaped('ars_nouveau:source_jar', [
            'AGA',
            'G G',
            'AGA'
        ], {
            A: 'kubejs:arcane_ingot',
            G: '#c:glass_blocks'
        }).id('kubejs:crafting/source_jar')

        // 内部配方不在配方浏览器显示；每批 10 秒、100 mB 液态魔源，满产 1,000 Source。
        // 运行时由 tech/source_converter 按本批启动时的液量区间缩放输出。
        // 火盆仅在批次启动时检查，不添加会逐 tick 检查的配方条件。
        event.recipes.mbd2.source_conversion()
            .inputFluids(Fluid.of(cfg.FLUID_ID, cfg.FLUID_PER_BATCH))
            .outputSource(cfg.MAX_SOURCE_PER_BATCH)
            .duration(cfg.TICKS_PER_BATCH)
            .id(cfg.CONVERSION_RECIPE_ID)
    })
})()
