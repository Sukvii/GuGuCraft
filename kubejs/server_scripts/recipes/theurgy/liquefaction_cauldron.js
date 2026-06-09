ServerEvents.recipes(event => {
    event.custom({
        type: 'theurgy:liquefaction',
        category: 'misc',
        ingredient: {
            item: 'minecraft:amethyst_shard'
        },
        result: {
            type: 'theurgy:item',
            id: 'ars_nouveau:source_gem',
            count: 1
        },
        solvent: {
            amount: 250,
            ingredient: {
                fluid: 'kubejs:liquid_source'
            }
        },
        time: 40
    }).id('guguaddons:theurgy/liquefaction/source_gem_from_amethyst_shard')

    event.custom({
        type: 'theurgy:liquefaction',
        category: 'misc',
        ingredient: {
            item: 'create:crushed_raw_gold'
        },
        result: {
            type: 'theurgy:item',
            id: 'theurgy:purified_gold',
            count: 1
        },
        solvent: {
            amount: 100,
            ingredient: {
                fluid: 'kubejs:liquid_source'
            }
        },
        time: 60
    }).id('guguaddons:theurgy/liquefaction/purified_gold_from_crushed_raw_gold')
})
