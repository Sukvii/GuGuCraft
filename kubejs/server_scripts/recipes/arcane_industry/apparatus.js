// Arcane Industry M11-M12: Enchanting Apparatus, Arcane Core, Reinforced Echo Shard; Blank Seal, Source Seal, Sculk Seal (first half), Heart of the Deep
// The Alchemy Seal is in alchemy.js, the spreader recipe of the Sculk Seal in sculk_spreader.js, the Warden Seal in charms.js. Numbers are examples, pending testing
ServerEvents.recipes(event => {
    const LS = amount => Fluid.of('kubejs:liquid_source', amount)
    const ESSENCES_NO_FIRE = [
        'ars_nouveau:water_essence',
        'ars_nouveau:earth_essence',
        'ars_nouveau:air_essence',
        'ars_nouveau:abjuration_essence',
        'ars_nouveau:conjuration_essence',
        'ars_nouveau:manipulation_essence'
    ]

    // Number = filling with Liquid Source (mB), 'press' = pressing, anything else = deploying that item
    const assembly = (name, output, input, steps, loops) => {
        const t = `kubejs:incomplete_${name}`
        const stepRecipes = steps.map(step => {
            if (step === 'press') return event.recipes.create.pressing(t, t)
            if (typeof step === 'number') return event.recipes.create.filling(t, [t, LS(step)])
            return event.recipes.create.deploying(t, [t, step])
        })
        event.recipes.create.sequenced_assembly([output], input, stepRecipes)
            .transitionalItem(t).loops(loops).id(`guguaddons:sequenced_assembly/${name}`)
    }

    // Enchanting Apparatus recipes: pedestal items are replaced by their crafting remainder after crafting (the four seals remain themselves, so they are not consumed)
    const apparatus = (name, reagent, pedestals, result, source) => {
        event.custom({
            type: 'ars_nouveau:enchanting_apparatus',
            keepNbtOfReagent: false,
            pedestalItems: pedestals.map(id => ({ item: id })),
            reagent: { item: reagent },
            result: { count: 1, id: result },
            sourceCost: source
        }).id(`guguaddons:ars_nouveau/enchanting_apparatus/${name}`)
    }

    // ================================================================ M11 Enchanting Apparatus (enchanting_apparatus)
    // Enchanting Apparatus: 3x4 mechanical crafting, Mechanical Crafter + six essences (all but Fire Essence) + Arcane Sheet + Sourcestone. The pattern is an example
    event.recipes.create.mechanical_crafting('ars_nouveau:enchanting_apparatus', [
        'WEA',
        'PCP',
        'BJM',
        'SSS'
    ], {
        W: 'ars_nouveau:water_essence',
        E: 'ars_nouveau:earth_essence',
        A: 'ars_nouveau:air_essence',
        B: 'ars_nouveau:abjuration_essence',
        J: 'ars_nouveau:conjuration_essence',
        M: 'ars_nouveau:manipulation_essence',
        P: 'kubejs:arcane_sheet',
        C: 'create:mechanical_crafter',
        S: 'ars_nouveau:sourcestone'
    }).id('guguaddons:mechanical_crafting/enchanting_apparatus')

    // Arcane Core: Brass Casing -[sequenced assembly x3]-> Dormant Arcane Core -[imbuement 20000]-> Arcane Core
    assembly('dormant_arcane_core', 'kubejs:dormant_arcane_core', 'create:brass_casing',
        ['ars_nouveau:source_gem_block', 'theurgy:mercury_shard', 1000, 'press'], 3)
    event.recipes.ars_nouveau.imbuement('kubejs:dormant_arcane_core', 'ars_nouveau:arcane_core', 20000, [
        'minecraft:echo_shard',
        'minecraft:sculk_shrieker',
        'kubejs:tempered_carapace'
    ]).id('guguaddons:ars_nouveau/imbuement/arcane_core')

    // Reinforced Echo Shard: now an Enchanting Apparatus recipe (pedestal items consumed); Deeper and Darker's crafting recipe is removed
    event.remove({ id: 'deeperdarker:reinforced_echo_shard' })
    apparatus('reinforced_echo_shard', 'minecraft:echo_shard', [
        'kubejs:tempered_carapace', 'kubejs:tempered_carapace', 'kubejs:tempered_carapace', 'kubejs:tempered_carapace',
        'minecraft:phantom_membrane', 'minecraft:phantom_membrane', 'minecraft:phantom_membrane', 'minecraft:phantom_membrane'
    ], 'deeperdarker:reinforced_echo_shard', 3000)

    // ================================================================ M12 Heart of the Deep (heart_of_the_deep)
    // Blank Seal: Arcane Sheet -[sequenced assembly x3]
    assembly('blank_seal', 'kubejs:blank_seal', 'kubejs:arcane_sheet',
        ['kubejs:hallowed_gold_ingot', 'minecraft:echo_shard', 500, 'press'], 3)

    // Source Seal: Blank Seal -[sequenced assembly x5]-> Uncharged Source Seal -[imbuement 50000, six essences on the pedestals (not consumed)]
    assembly('uncharged_source_seal', 'kubejs:uncharged_source_seal', 'kubejs:blank_seal',
        ['ars_nouveau:source_gem_block', 1000, 'kubejs:arcane_mechanism', 'press'], 5)
    event.recipes.ars_nouveau.imbuement('kubejs:uncharged_source_seal', 'kubejs:source_seal', 50000, ESSENCES_NO_FIRE)
        .id('guguaddons:ars_nouveau/imbuement/source_seal')

    // Sculk Seal (first half): mechanical crafting -> Dormant Sculk Seal, then awakened in the Sculk Spreader
    event.recipes.create.mechanical_crafting('kubejs:dormant_sculk_seal', [
        'RNTNR',
        'TABAT',
        'RNTNR'
    ], {
        R: 'minecraft:sculk_shrieker',
        N: 'minecraft:sculk_sensor',
        T: 'kubejs:tempered_carapace',
        A: 'kubejs:activated_sculk_catalyst',
        B: 'kubejs:blank_seal'
    }).id('guguaddons:mechanical_crafting/dormant_sculk_seal')

    // Heart of the Deep: Reinforced Echo Shard in the center; the four permanent seals (not consumed) + four consumables on the pedestals
    apparatus('heart_of_the_deep', 'deeperdarker:reinforced_echo_shard', [
        'kubejs:source_seal', 'kubejs:sculk_seal', 'kubejs:alchemy_seal', 'kubejs:warden_seal',
        'kubejs:activated_sculk_catalyst', 'minecraft:sculk_shrieker', 'kubejs:sculk_salt', 'kubejs:sculk_sulfur'
    ], 'deeperdarker:heart_of_the_deep', 10000)
})
