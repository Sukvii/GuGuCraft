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

        // The pack removes the original Ars recipes, so add back the Source Jar that goes with this machine.
        event.shaped('ars_nouveau:source_jar', [
            'AGA',
            'G G',
            'AGA'
        ], {
            A: 'kubejs:arcane_ingot',
            G: '#c:glass_blocks'
        }).id('kubejs:crafting/source_jar')

        // Internal recipe hidden from recipe viewers; 10 seconds and 100 mB Liquid Source per batch, 1,000 Source at full yield.
        // At runtime tech/source_converter scales the output by the fluid range at batch start.
        // The brazier is only checked at batch start; no recipe condition that would be checked every tick is added.
        event.recipes.mbd2.source_conversion()
            .inputFluids(Fluid.of(cfg.FLUID_ID, cfg.FLUID_PER_BATCH))
            .outputSource(cfg.MAX_SOURCE_PER_BATCH)
            .duration(cfg.TICKS_PER_BATCH)
            .id(cfg.CONVERSION_RECIPE_ID)
    })
})()
