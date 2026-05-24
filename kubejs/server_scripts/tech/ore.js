ServerEvents.recipes(event => {

    event.remove({ mod: 'createoreexcavation', type: 'createoreexcavation:vein' })
    event.remove({ mod: 'createoreexcavation', type: 'createoreexcavation:drilling' })
    event.remove({ mod: 'createoreexcavation', type: 'createoreexcavation:extracting' })

    event.recipes.createoreexcavation.vein('{"text": "秘银矿脉"}', 'kubejs:mythril_ore')
        .placement(128, 32, 987654321)
        .biomeWhitelist('minecraft:is_overworld')
        .id('kubejs:vein_mythril_ore')

    event.recipes.createoreexcavation.drilling(coeutil.processingOutput('kubejs:raw_mythril', 0.5), 'kubejs:vein_mythril_ore', 120)
        .fluid(Fluid.of('kubejs:liquid_mana', 100))
        .id('kubejs:drilling_mythril_ore')

    event.recipes.createoreexcavation.vein('{"text": "秘银溶剂脉"}', 'kubejs:mythril_solvent_bucket')
        .placement(64, 16, 123456789)
        .biomeWhitelist('minecraft:is_overworld')
        .id('kubejs:vein_mythril_solvent')

    event.recipes.createoreexcavation.extracting(Fluid.of('kubejs:mythril_solvent', 200), 'kubejs:vein_mythril_solvent', 60)
        .id('kubejs:drilling_mythril_solvent')


})
