// Items, blocks and fluids of the Arcane Industry chapter (F4). IDs match the textures and models under kubejs/assets/kubejs one to one
// The Unaligned Relay, Dormant Arcane Core, Alchemical Frame and a few others have hand-written models in assets that override the default models KubeJS generates

// The four permanent seals: as pedestal items in the Enchanting Apparatus they are replaced by their crafting remainder; a remainder of the seal itself keeps them from being consumed
const keepSealSelf = stack => stack.copyWithCount(1)

StartupEvents.registry('item', event => {
    event.create('unattuned_essence').displayName('Unattuned Essence')
    event.create('inscribed_draft').displayName('Inscribed Draft')
    event.create('resonant_draft').displayName('Resonant Draft')
    event.create('carapace_fragments').displayName('Carapace Fragments')
    event.create('tempered_carapace').displayName('Tempered Carapace')
    event.create('sculk_salt').displayName('Sculk Salt')
    event.create('sculk_sulfur').displayName('Sculk Sulfur')
    event.create('unaligned_relay').displayName('Unaligned Relay')
    event.create('dormant_arcane_core').displayName('Dormant Arcane Core')
    event.create('unbound_spellbook').displayName('Unbound Spellbook')

    event.create('blank_seal').displayName('Blank Seal')
    event.create('uncharged_source_seal').displayName('Uncharged Source Seal')
    event.create('dormant_sculk_seal').displayName('Dormant Sculk Seal')
    // The two intermediate items of the three-step Alchemy Seal reformation (salt -> sulfur -> mercury)
    event.create('salted_blank_seal').displayName('Salted Blank Seal')
    event.create('sulfurized_blank_seal').displayName('Sulfurized Blank Seal')
    event.create('source_seal').displayName('Source Seal').glow(true).craftingRemainingItem(keepSealSelf)
    event.create('sculk_seal').displayName('Sculk Seal').glow(true).craftingRemainingItem(keepSealSelf)
    event.create('alchemy_seal').displayName('Alchemy Seal').glow(true).craftingRemainingItem(keepSealSelf)
    event.create('warden_seal').displayName('Warden Seal').glow(true).craftingRemainingItem(keepSealSelf)

    // Sequenced assembly transitional items: the ID is incomplete_<result ID>. The few that reuse the starting block model declare a parent in assets/kubejs/models/item
    event.create('incomplete_unattuned_essence', 'create:sequenced_assembly').displayName('Incomplete Unattuned Essence')
    event.create('incomplete_inscribed_draft', 'create:sequenced_assembly').displayName('Incomplete Inscribed Draft')
    event.create('incomplete_unaligned_relay', 'create:sequenced_assembly').displayName('Incomplete Unaligned Relay')
    event.create('incomplete_timer_spell_turret', 'create:sequenced_assembly').displayName('Incomplete Timer Spell Turret')
    event.create('incomplete_storage_lectern', 'create:sequenced_assembly').displayName('Incomplete Storage Lectern')
    event.create('incomplete_alchemical_frame', 'create:sequenced_assembly').displayName('Incomplete Alchemical Frame')
    event.create('incomplete_repository', 'create:sequenced_assembly').displayName('Incomplete Repository')
    event.create('incomplete_mob_jar', 'create:sequenced_assembly').displayName('Incomplete Containment Jar')
    event.create('incomplete_relay', 'create:sequenced_assembly').displayName('Incomplete Relay')
    event.create('incomplete_dormant_arcane_core', 'create:sequenced_assembly').displayName('Incomplete Dormant Arcane Core')
    event.create('incomplete_unbound_spellbook', 'create:sequenced_assembly').displayName('Incomplete Unbound Spellbook')
    event.create('incomplete_centrifuge', 'create:sequenced_assembly').displayName('Incomplete Centrifuge')
    event.create('incomplete_vacuum_chamber', 'create:sequenced_assembly').displayName('Incomplete Compressor')
    event.create('incomplete_blank_seal', 'create:sequenced_assembly').displayName('Incomplete Blank Seal')
    event.create('incomplete_uncharged_source_seal', 'create:sequenced_assembly').displayName('Incomplete Uncharged Source Seal')
})

StartupEvents.registry('block', event => {
    // Textures follow the top / side / bottom layout of the vanilla Sculk Catalyst; the top and sides play a constant bloom animation
    event.create('activated_sculk_catalyst')
        .displayName('Activated Sculk Catalyst')
        .textures({
            up: 'kubejs:block/activated_sculk_catalyst_top',
            down: 'kubejs:block/activated_sculk_catalyst_bottom',
            north: 'kubejs:block/activated_sculk_catalyst_side',
            south: 'kubejs:block/activated_sculk_catalyst_side',
            east: 'kubejs:block/activated_sculk_catalyst_side',
            west: 'kubejs:block/activated_sculk_catalyst_side',
            particle: 'kubejs:block/activated_sculk_catalyst_side'
        })
        .soundType('sculk_catalyst')
        .hardness(3.0)
        .resistance(3.0)
        .lightLevel(6 / 15)
        .tagBlock('minecraft:mineable/hoe')

    event.create('carapace_fragment_block')
        .displayName('Carapace Fragment Block')
        .texture('kubejs:block/carapace_fragment_block')
        .soundType('deepslate')
        .hardness(2.0)
        .resistance(6.0)
        .requiresTool(true)
        .tagBlock('minecraft:mineable/pickaxe')

    // The model is a four-post frame (assets/kubejs/models/block/alchemical_frame.json) and does not cull neighboring blocks
    event.create('alchemical_frame')
        .displayName('Alchemical Frame')
        .soundType('copper')
        .hardness(3.0)
        .resistance(6.0)
        .requiresTool(true)
        .notSolid()
        .renderType('cutout')
        .tagBlock('minecraft:mineable/pickaxe')
        .tagBlock('create:wrench_pickup')
})

StartupEvents.registry('fluid', event => {
    event.create('archwood_sap')
        .displayName('Archwood Sap')
        .stillTexture('kubejs:fluid/archwood_sap_still')
        .flowingTexture('kubejs:fluid/archwood_sap_flow')
        .translucent()

    event.create('source_mash')
        .displayName('Source Mash')
        .stillTexture('kubejs:fluid/source_mash_still')
        .flowingTexture('kubejs:fluid/source_mash_flow')

    event.create('dilute_liquid_source')
        .displayName('Dilute Liquid Source')
        .stillTexture('kubejs:fluid/dilute_liquid_source_still')
        .flowingTexture('kubejs:fluid/dilute_liquid_source_flow')
        .translucent()
})
