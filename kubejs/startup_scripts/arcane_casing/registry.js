// Keeps the registration state across client script reloads; Create's model wrappers are registered once before the first bake.
global.ARCANE_CASING_CLIENT = {
    connectedTexturesRegistered: false
}

StartupEvents.registry('block', event => {
    event.create('kubejs:arcane_casing')
        .displayName('Arcane Casing')
        .texture('kubejs:block/arcane_casing')
        .hardness(1.5)
        .resistance(6.0)
        .woodSoundType()
        .requiresTool(true)
        .tagBlock('minecraft:mineable/axe')
        .tagBlock('minecraft:mineable/pickaxe')
        .tagBlock('create:wrench_pickup')
        .tagBoth('create:casing')
})
