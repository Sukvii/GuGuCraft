// Arcane Industry M4-M5: activating the Sculk Catalyst, Alakarkinos sifting of Warden Carapace. Numbers are examples, pending testing
ServerEvents.recipes(event => {
    // ---------------------------------------------------------------- M4 Imbuement (pedestal items are not consumed)
    event.recipes.ars_nouveau.imbuement('minecraft:sculk_catalyst', 'kubejs:activated_sculk_catalyst', 2000, [
        'minecraft:echo_shard',
        'ars_nouveau:source_gem'
    ]).id('guguaddons:ars_nouveau/imbuement/activated_sculk_catalyst')

    // ---------------------------------------------------------------- M5 Warden Carapace -> fragments -> fragment block -> Alakarkinos sifting
    event.recipes.create.crushing([
        '4x kubejs:carapace_fragments'
    ], 'deeperdarker:warden_carapace').id('guguaddons:crushing/carapace_fragments')

    event.recipes.create.compacting('kubejs:carapace_fragment_block', '4x kubejs:carapace_fragments')
        .id('guguaddons:compacting/carapace_fragment_block')

    // The Alakarkinos turns nearby fragment blocks into air and sends the loot (chest context) to a container next to its home:
    // 40% Tempered Carapace + 1-2 fragments returned (data/kubejs/loot_table/alakarkinos/carapace_fragment_block.json)
    event.custom({
        type: 'ars_nouveau:alakarkinos_conversion',
        input: 'kubejs:carapace_fragment_block',
        table: 'kubejs:alakarkinos/carapace_fragment_block',
        weight: 1
    }).id('guguaddons:ars_nouveau/alakarkinos/carapace_fragment_block')
})
