// Items, blocks and fluids of the Sculk Acoustics chapter (F5). IDs match the textures and models under kubejs/assets/kubejs one to one
// (the art delivery list is section 6 of the F5 art list in the design docs, GuGuCraft-Design/03-F5-*.md)
// The Warden Resonance Chamber and its kinetic input are MBD2 machines, registered with M10

// The Resonant Casing connected textures are registered once before the first bake; the state survives client script reloads (same as the Arcane Casing)
global.RESONANT_CASING_CLIENT = {
    connectedTexturesRegistered: false
}

StartupEvents.registry('item', event => {
    event.create('seeing_echo_shard').displayName('Seeing Echo Shard')
    event.create('resonarium_ingot').displayName('Resonarium Ingot')
    event.create('sculk_niter').displayName('Sculk Niter')
    event.create('sculk_niter_powder').displayName('Sculk Niter Powder')
    event.create('resonance_nucleus').displayName('Resonance Nucleus')
    event.create('resonant_shell').displayName('Resonant Shell')
    event.create('resonance_core').displayName('Resonance Core')
    event.create('echo_mechanism').displayName('Echo Mechanism')
    event.create('sculk_dregs').displayName('Sculk Dregs')
    event.create('source_converter_upgrade').displayName('Source Converter Upgrade')
    event.create('sculk_spreader_upgrade').displayName('Sculk Spreader Upgrade')
    // Rendered with kubejs:textures/entity/drill/resonant_drill.png once mounted on the drill; the drill head tags are in server_scripts/tags/sculk_acoustics.js
    event.create('resonant_drill').displayName('Resonant Drill').maxStackSize(1)

    // Sequenced assembly transitional items: the Incomplete Resonant Casing has a hand-written model in assets/kubejs/models/item (Resonant Casing top, Arcane Casing elsewhere)
    event.create('incomplete_echo_mechanism', 'create:sequenced_assembly').displayName('Incomplete Echo Mechanism')
    event.create('incomplete_resonant_casing', 'create:sequenced_assembly').displayName('Incomplete Resonant Casing')
    // The two incomplete upgrades have no art of their own; their models in assets/kubejs/models/item reuse the finished textures
    event.create('incomplete_source_converter_upgrade', 'create:sequenced_assembly').displayName('Incomplete Source Converter Upgrade')
    event.create('incomplete_sculk_spreader_upgrade', 'create:sequenced_assembly').displayName('Incomplete Sculk Spreader Upgrade')
})

StartupEvents.registry('block', event => {
    // Connected textures: see client_scripts/sculk_acoustics/resonant_casing.js
    event.create('resonant_casing')
        .displayName('Resonant Casing')
        .texture('kubejs:block/resonant_casing')
        .hardness(1.5)
        .resistance(6.0)
        .woodSoundType()
        .requiresTool(true)
        .tagBlock('minecraft:mineable/axe')
        .tagBlock('minecraft:mineable/pickaxe')
        .tagBlock('create:wrench_pickup')
        .tagBoth('create:casing')
})

StartupEvents.registry('fluid', event => {
    event.create('otherside_slurry')
        .displayName('Otherside Slurry')
        .stillTexture('kubejs:fluid/otherside_slurry_still')
        .flowingTexture('kubejs:fluid/otherside_slurry_flow')

    event.create('echo_spirit')
        .displayName('Echo Spirit')
        .stillTexture('kubejs:fluid/echo_spirit_still')
        .flowingTexture('kubejs:fluid/echo_spirit_flow')
        .translucent()

    event.create('gleam_lubricant')
        .displayName('Gleam Lubricant')
        .stillTexture('kubejs:fluid/gleam_lubricant_still')
        .flowingTexture('kubejs:fluid/gleam_lubricant_flow')
})
