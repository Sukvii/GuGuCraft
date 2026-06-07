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
})
