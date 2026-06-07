StartupEvents.registry('fluid', event => {

    event.create('reactive_dye')
        .displayName('活性染色剂')
        .stillTexture('kubejs:fluid/mys_still')
        .flowingTexture('kubejs:fluid/mys_flow')

    event.create('liquid_source')
        .displayName('液态魔源')
        .stillTexture('kubejs:fluid/liquid_source_still')
        .flowingTexture('kubejs:fluid/liquid_source_flow')

    event.create('mythril_solvent')
        .displayName('秘银溶剂')
        .stillTexture('kubejs:fluid/mythril_solvent_still')
        .flowingTexture('kubejs:fluid/mythril_solvent_flow')

})