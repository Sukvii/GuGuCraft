// Arcane Industry M7-M10: Theurgy alchemy (mercury -> salt and sulfur -> reformation -> incubation). Numbers are examples, pending testing
// compat/theurgy.js removes every Theurgy recipe; the machines and recipes this chapter needs are added back here
// Stage locks are in stages/arcane_industry.js; Theurgy recipe types are outside what GuGuAddons supports, so item locks on the machines and products gate them
ServerEvents.recipes(event => {
    const LS = amount => Fluid.of('kubejs:liquid_source', amount)
    const FRAME = 'kubejs:alchemical_frame'
    const HALLOWED_GOLD = 'kubejs:hallowed_gold_ingot'

    // ---------------------------------------------------------------- Right-click conversion (Lychee)
    const effects = block => [
        {
            type: 'execute',
            command: `execute align xyz positioned ~0.5 ~0.5 ~0.5 run particle minecraft:block{block_state:"${block}"} ~ ~ ~ 0.35 0.35 0.35 0.05 80 force @a`,
            hide: true
        },
        {
            type: 'execute',
            command: 'execute align xyz positioned ~0.5 ~0.5 ~0.5 run particle minecraft:end_rod ~ ~ ~ 0.16 0.16 0.16 0.1 20 force @a',
            hide: true
        },
        {
            type: 'execute',
            command: 'execute align xyz positioned ~0.5 ~0.5 ~0.5 run playsound ars_nouveau:ea_finish block @a ~ ~ ~ 1',
            hide: true
        }
    ]

    const interact = (name, key, blockIn, post, contextual) => {
        const recipe = {
            type: 'lychee:block_interacting',
            item_in: { item: key, count: 1 },
            block_in: blockIn,
            post: post.concat(effects(blockIn))
        }
        if (contextual) recipe.contextual = contextual
        event.custom(recipe).id(`guguaddons:lychee/block_interacting/${name}`)
    }

    const convertInPlace = (name, key, blockIn, blockOut, contextual) =>
        interact(name, key, blockIn, [{ type: 'place', block: blockOut }], contextual)

    // Two-block-tall machines: Lychee's place does not trigger setPlacedBy, so the upper half is placed separately and the block above must be air
    const convertTwoHigh = (name, key, blockIn, blockOut) =>
        interact(name, key, blockIn, [
            { type: 'place', block: blockOut },
            { type: 'place', block: `${blockOut}[half=upper]`, offsetY: 1 }
        ], {
            type: 'location',
            offsetY: 1,
            predicate: { block: { blocks: ['minecraft:air', 'minecraft:cave_air'] } }
        })

    // Machines attached to a block face (emitters): remove the original block and drop the finished machine for the player to place
    const convertToItem = (name, key, blockIn, itemOut) =>
        interact(name, key, blockIn, [{ type: 'place', block: 'minecraft:air' }, { type: 'drop_item', id: itemOut }])

    // Only works on an empty work basin, so items and fluids in it are not swallowed (same as the Basic Research liquefaction cauldron)
    const emptyBasin = {
        type: 'execute',
        command: [
            'execute align xyz',
            'unless data block ~ ~ ~ InputItems.Items[0]',
            'unless data block ~ ~ ~ OutputItems.Items[0]',
            'unless data block ~ ~ ~ Overflow[0]',
            'unless data block ~ ~ ~ FluidOverflow[0]',
            'unless data block ~ ~ ~ InputTanks[0].TankContent.id',
            'unless data block ~ ~ ~ InputTanks[0].TankContent.FluidName',
            'unless data block ~ ~ ~ InputTanks[0].TankContent.amount',
            'unless data block ~ ~ ~ InputTanks[0].TankContent.Amount',
            'unless data block ~ ~ ~ InputTanks[1].TankContent.id',
            'unless data block ~ ~ ~ InputTanks[1].TankContent.FluidName',
            'unless data block ~ ~ ~ InputTanks[1].TankContent.amount',
            'unless data block ~ ~ ~ InputTanks[1].TankContent.Amount',
            'unless data block ~ ~ ~ OutputTanks[0].TankContent.id',
            'unless data block ~ ~ ~ OutputTanks[0].TankContent.FluidName',
            'unless data block ~ ~ ~ OutputTanks[0].TankContent.amount',
            'unless data block ~ ~ ~ OutputTanks[0].TankContent.Amount',
            'unless data block ~ ~ ~ OutputTanks[1].TankContent.id',
            'unless data block ~ ~ ~ OutputTanks[1].TankContent.FluidName',
            'unless data block ~ ~ ~ OutputTanks[1].TankContent.amount',
            'unless data block ~ ~ ~ OutputTanks[1].TankContent.Amount'
        ].join(' ')
    }

    // ---------------------------------------------------------------- Alchemical Frame (M7 mercury)
    const frameT = 'kubejs:incomplete_alchemical_frame'
    event.recipes.create.sequenced_assembly([FRAME], 'create:brass_casing', [
        event.recipes.create.deploying(frameT, [frameT, HALLOWED_GOLD]),
        event.recipes.create.filling(frameT, [frameT, LS(500)]),
        event.recipes.create.pressing(frameT, frameT)
    ]).transitionalItem(frameT).loops(1).id('guguaddons:sequenced_assembly/alchemical_frame')

    // ---------------------------------------------------------------- Obtaining the machines
    // M7 Mercury: Mercury Distiller (two blocks tall), Mercury Catalyst
    convertTwoHigh('distiller', 'minecraft:amethyst_block', FRAME, 'theurgy:distiller')
    convertInPlace('mercury_catalyst', 'theurgy:mercury_shard', FRAME, 'theurgy:mercury_catalyst')
    // M8 Salt and Sulfur: Caloric Flux Emitter
    convertToItem('caloric_flux_emitter', 'theurgy:pyromantic_brazier', FRAME, 'theurgy:caloric_flux_emitter')

    // M9 Reformation: Sulfuric Flux Emitter (mechanical crafting) and the three pedestals (polished blackstone)
    event.recipes.create.mechanical_crafting('theurgy:sulfuric_flux_emitter', [
        '  S  ',
        ' MFM ',
        'AHHHA'
    ], {
        S: 'kubejs:sculk_sulfur',
        M: 'theurgy:mercury_shard',
        F: FRAME,
        A: 'kubejs:arcane_sheet',
        H: HALLOWED_GOLD
    }).id('guguaddons:mechanical_crafting/sulfuric_flux_emitter')

    convertInPlace('reformation_source_pedestal', 'theurgy:alchemical_sulfur_deepslate', 'minecraft:polished_blackstone', 'theurgy:reformation_source_pedestal')
    convertInPlace('reformation_target_pedestal', 'kubejs:sculk_sulfur', 'minecraft:polished_blackstone', 'theurgy:reformation_target_pedestal')
    convertInPlace('reformation_result_pedestal', HALLOWED_GOLD, 'minecraft:polished_blackstone', 'theurgy:reformation_result_pedestal')

    // M10 Incubation: Incubator (mechanical crafting, two blocks tall; the upper half is added automatically when placed) and the three vessels (empty work basins)
    event.recipes.create.mechanical_crafting('theurgy:incubator', [
        'HLSMH',
        'A F A',
        'A F A',
        'RRRRR'
    ], {
        H: HALLOWED_GOLD,
        L: 'kubejs:sculk_salt',
        S: 'kubejs:sculk_sulfur',
        M: 'theurgy:mercury_shard',
        A: 'kubejs:arcane_sheet',
        F: FRAME,
        R: 'ars_nouveau:sourcestone'
    }).id('guguaddons:mechanical_crafting/incubator')

    convertInPlace('incubator_mercury_vessel', 'theurgy:mercury_shard', 'create:basin', 'theurgy:incubator_mercury_vessel', emptyBasin)
    convertInPlace('incubator_salt_vessel', 'kubejs:sculk_salt', 'create:basin', 'theurgy:incubator_salt_vessel', emptyBasin)
    convertInPlace('incubator_sulfur_vessel', 'kubejs:sculk_sulfur', 'create:basin', 'theurgy:incubator_sulfur_vessel', emptyBasin)

    // ---------------------------------------------------------------- Theurgy recipes
    const theurgyItem = (id, count) => ({ type: 'theurgy:item', id: id, count: count || 1 })

    // M7 Distillation: Amethyst Shard -> Mercury Shard
    event.custom({
        type: 'theurgy:distillation',
        category: 'misc',
        ingredient: { ingredient: { item: 'minecraft:amethyst_shard' }, count: 1 },
        result: theurgyItem('theurgy:mercury_shard'),
        time: 100
    }).id('guguaddons:theurgy/distillation/mercury_shard_from_amethyst_shard')

    // M7 Catalysis: Mercury Shard -> mercury flux (original Theurgy recipe: 800 per shard, 20 per tick)
    event.custom({
        type: 'theurgy:catalysation',
        category: 'misc',
        ingredient: { item: 'theurgy:mercury_shard' },
        mercuryFluxPerTick: 20,
        totalMercuryFlux: 800
    }).id('guguaddons:theurgy/catalysation/mercury_flux_from_mercury_shard')

    // M8 Calcination: Sculk -> Sculk Salt
    event.custom({
        type: 'theurgy:calcination',
        category: 'misc',
        ingredient: { ingredient: { item: 'minecraft:sculk' }, count: 1 },
        result: theurgyItem('kubejs:sculk_salt'),
        time: 100
    }).id('guguaddons:theurgy/calcination/sculk_salt')

    // M8 Liquefaction (solvent: Liquid Source): Deepslate -> Alchemical Sulfur (Deepslate) (the original Theurgy recipe uses 10 mB of sal ammoniac); Sculk Catalyst -> Sculk Sulfur
    event.custom({
        type: 'theurgy:liquefaction',
        category: 'misc',
        ingredient: { item: 'minecraft:deepslate' },
        result: theurgyItem('theurgy:alchemical_sulfur_deepslate'),
        solvent: { amount: 10, ingredient: { fluid: 'kubejs:liquid_source' } },
        time: 100
    }).id('guguaddons:theurgy/liquefaction/alchemical_sulfur_deepslate')

    event.custom({
        type: 'theurgy:liquefaction',
        category: 'misc',
        ingredient: { item: 'minecraft:sculk_catalyst' },
        result: theurgyItem('kubejs:sculk_sulfur'),
        solvent: { amount: 250, ingredient: { fluid: 'kubejs:liquid_source' } },
        time: 200
    }).id('guguaddons:theurgy/liquefaction/sculk_sulfur')

    // M9 Reformation: Alchemical Sulfur (Deepslate) x8 on the source pedestals, Sculk Sulfur on the target pedestal (a sample, not consumed)
    // The Sulfuric Flux Emitter stores at most 1000 mercury flux, so no recipe may need more
    event.custom({
        type: 'theurgy:reformation',
        category: 'misc',
        sources: [{ ingredient: { item: 'theurgy:alchemical_sulfur_deepslate' }, count: 8 }],
        target: { item: 'kubejs:sculk_sulfur' },
        result: theurgyItem('kubejs:sculk_sulfur'),
        mercuryFlux: 200,
        time: 100
    }).id('guguaddons:theurgy/reformation/sculk_sulfur')

    // M12 Alchemy Seal: reformed in three steps, salt -> sulfur -> mercury; the target pedestal is always an Alchemical Frame (a sample, not consumed), each step within the emitter cap of 1000
    // Items on the source pedestals must be in the theurgy:alchemical_sulfurs_and_niters tag, see tags/arcane_industry.js
    const sealStage = (name, sources, result) => event.custom({
        type: 'theurgy:reformation',
        category: 'misc',
        sources: sources.map(s => ({ ingredient: { item: s[0] }, count: s[1] })),
        target: { item: FRAME },
        result: theurgyItem(result),
        mercuryFlux: 1000,
        time: 400
    }).id(`guguaddons:theurgy/reformation/${name}`)

    sealStage('salted_blank_seal', [['kubejs:blank_seal', 1], ['kubejs:sculk_salt', 16]], 'kubejs:salted_blank_seal')
    sealStage('sulfurized_blank_seal', [['kubejs:salted_blank_seal', 1], ['kubejs:sculk_sulfur', 16]], 'kubejs:sulfurized_blank_seal')
    sealStage('alchemy_seal', [['kubejs:sulfurized_blank_seal', 1], ['theurgy:mercury_shard', 16], ['minecraft:echo_shard', 4]], 'kubejs:alchemy_seal')

    // M10 Incubation: Mercury Shard + Sculk Salt + Sculk Sulfur -> Echo Shard
    event.custom({
        type: 'theurgy:incubation',
        category: 'misc',
        mercury: { item: 'theurgy:mercury_shard' },
        salt: { item: 'kubejs:sculk_salt' },
        sulfur: { item: 'kubejs:sculk_sulfur' },
        result: theurgyItem('minecraft:echo_shard'),
        time: 200
    }).id('guguaddons:theurgy/incubation/echo_shard')
})
