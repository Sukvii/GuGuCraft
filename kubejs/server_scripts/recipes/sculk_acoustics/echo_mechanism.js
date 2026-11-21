// Sculk Acoustics M11-M13: Resonant Shell, Resonance Core, Echo Mechanism (numbers are examples, pending testing; stage locks in stages/sculk_acoustics.js)
ServerEvents.recipes(event => {
    // M11 Resonant Shell: Resonarium Plate + Arcane Sheet + Gleam Gel x2 -[heated compacting]
    event.recipes.create.compacting('kubejs:resonant_shell', [
        'deeperdarker:resonarium_plate', 'kubejs:arcane_sheet', 'deeperdarker:gleam_gel', 'deeperdarker:gleam_gel'
    ]).heated().id('guguaddons:compacting/resonant_shell')

    // M12 Resonance Core: Enchanting Apparatus, Resonance Nucleus in the center; Soul Crystal + Sculk Niter Powder x3 + Tempered Carapace on the pedestals (consumed), 1000 Source
    event.custom({
        type: 'ars_nouveau:enchanting_apparatus',
        keepNbtOfReagent: false,
        pedestalItems: [
            'deeperdarker:soul_crystal',
            'kubejs:sculk_niter_powder', 'kubejs:sculk_niter_powder', 'kubejs:sculk_niter_powder',
            'kubejs:tempered_carapace'
        ].map(id => ({ item: id })),
        reagent: { item: 'kubejs:resonance_nucleus' },
        result: { count: 1, id: 'kubejs:resonance_core' },
        sourceCost: 1000
    }).id('guguaddons:ars_nouveau/enchanting_apparatus/resonance_core')

    // M13 Echo Mechanism: Resonant Shell -[sequenced assembly x1]-> deploy Resonance Core -> deploy Echo Shard -> fill 250 mB Echo Spirit -> deploy Sculk Niter Powder -> press
    const t = 'kubejs:incomplete_echo_mechanism'
    event.recipes.create.sequenced_assembly(['kubejs:echo_mechanism'], 'kubejs:resonant_shell', [
        event.recipes.create.deploying(t, [t, 'kubejs:resonance_core']),
        event.recipes.create.deploying(t, [t, 'minecraft:echo_shard']),
        event.recipes.create.filling(t, [t, Fluid.of('kubejs:echo_spirit', 250)]),
        event.recipes.create.deploying(t, [t, 'kubejs:sculk_niter_powder']),
        event.recipes.create.pressing(t, t)
    ]).transitionalItem(t).loops(1).id('guguaddons:sequenced_assembly/echo_mechanism')
})
