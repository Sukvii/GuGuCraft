ServerEvents.recipes(event => {
    event.custom({
        type: 'theurgy:accumulation',
        category: 'misc',
        result: {
            amount: 100,
            id: 'kubejs:liquid_source'
        },
        evaporant: {
            amount: 200,
            ingredient: {
                fluid: 'kubejs:mythril_solvent'
            }
        },
        solute: {
            item: 'ars_nouveau:sourceberry_bush'
        },
        time: 200
    }).id('kubejs:theurgy/accumulation/liquid_source_from_sourceberry')
})
