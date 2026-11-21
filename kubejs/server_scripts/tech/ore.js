ServerEvents.recipes(event => {

    event.remove({ mod: 'createoreexcavation', type: 'createoreexcavation:vein' })
    event.remove({ mod: 'createoreexcavation', type: 'createoreexcavation:drilling' })
    event.remove({ mod: 'createoreexcavation', type: 'createoreexcavation:extracting' })

    event.recipes.createoreexcavation.vein('{"translate": "kubejs.vein.mythril", "fallback": "Mythril Vein"}', 'kubejs:mythril_ore')
        .placement(128, 32, 987654321)
        .biomeWhitelist('minecraft:is_overworld')
        .id('kubejs:vein_mythril_ore')

    event.recipes.createoreexcavation.drilling(coeutil.processingOutput('kubejs:raw_mythril', 0.5), 'kubejs:vein_mythril_ore', 120)
        .fluid('100x #c:fuel')
        .id('kubejs:drilling_mythril_ore')

    event.recipes.createoreexcavation.vein('{"translate": "kubejs.vein.mythril_solvent", "fallback": "Mythril Solvent Vein"}', 'kubejs:mythril_solvent_bucket')
        .placement(64, 16, 123456789)
        .biomeWhitelist('minecraft:is_overworld')
        .id('kubejs:vein_mythril_solvent')

    // The drilling fluid is ethanol (F3: the ethanol byproduct of M1 distillation now feeds the drills); only the Netherite Drill works, so the netherite line stays useful
    event.recipes.createoreexcavation.extracting(Fluid.of('kubejs:mythril_solvent', 200), 'kubejs:vein_mythril_solvent', 60)
        .fluid('50x createdieselgenerators:ethanol')
        .drill('createoreexcavation:netherite_drill')
        .id('kubejs:drilling_mythril_solvent')


})
