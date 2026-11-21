StartupEvents.registry('fluid', event => {

    event.create('reactive_dye')
        .displayName('Reactive Dye')
        .stillTexture('kubejs:fluid/mys_still')
        .flowingTexture('kubejs:fluid/mys_flow')

    event.create('liquid_source')
        .displayName('Liquid Source')
        .stillTexture('kubejs:fluid/liquid_source_still')
        .flowingTexture('kubejs:fluid/liquid_source_flow')

    event.create('mythril_solvent')
        .displayName('Mythril Solvent')
        .stillTexture('kubejs:fluid/mythril_solvent_still')
        .flowingTexture('kubejs:fluid/mythril_solvent_flow')

})