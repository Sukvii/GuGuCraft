ServerEvents.recipes(event => {

    event.recipes.create.crushing([
        'kubejs:crushed_mythril_ore',
        CreateItem.of('kubejs:crushed_mythril_ore', 0.5),
        CreateItem.of('create:experience_nugget', 0.5)
    ], 'kubejs:raw_mythril').id('kubejs:crushing/crushed_mythril_ore')

    event.recipes.create.crushing('kubejs:crushed_raw_netherite', 'minecraft:netherite_ingot').processingTime(1000).id('guguaddons:crushing/crushed_raw_netherite')

    event.recipes.create.mixing('kubejs:mythril_mixture', [
        'kubejs:crushed_mythril_ore',
        'kubejs:crushed_raw_netherite',
        'kubejs:crushed_raw_netherite'
    ]).heated().id('kubejs:mixing/mythril_mixture')

    event.recipes.createDragonsPlus.ending([
        { item: 'kubejs:mythril_nugget', count: 6 }
    ], 'kubejs:mythril_mixture').id('kubejs:ending/mythril_nugget')

    event.recipes.create.mixing(Fluid.of('kubejs:mythril_solvent',25), [Fluid.of('createdieselgenerators:ethanol',800), 'kubejs:mythril_mixture'], 200).superheated().id('guguaddons:mixing/mythril_solvent')

    event.recipes.create.compacting('kubejs:mythril_ingot', '9x kubejs:mythril_nugget').id('kubejs:compacting/mythril_ingot').id('guguaddons:compating/mythril_ingot')

    event.recipes.create.mixing('kubejs:arcane_ingot', [Fluid.of('kubejs:liquid_source',250), Fluid.of('kubejs:mythril_solvent',100), 'kubejs:mythril_ingot'], 100).id('guguaddons:mixing/arcane_ingot')

})