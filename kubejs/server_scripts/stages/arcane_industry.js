// Stage locks of the Arcane Industry chapter (F4). The stages themselves are declared in stages.js
// - Machine / Lychee recipes: locked by machine owner (the acting player for Lychee) through GuGuMachineStageEvents
// - Crafting recipes and glyphs: AStages recipe / item locks (Ars Nouveau's Scribe's Table is not a recipe type GuGuAddons supports, so glyphs can only be item-locked)
const ARCANE_LOCKS = {
    arcane_essence: {
        'create:sequenced_assembly': ['guguaddons:sequenced_assembly/unattuned_essence']
    },
    // Optional node "Arcane Machines" below the opening: Arcane Casing upgrades of Create machines (recipes/createmoremachines/arcane_machines.js), by machine owner
    arcane_machines: {
        'create:item_application': [
            'basin', 'crushing_wheel', 'deployer', 'depot', 'encased_fan',
            'mechanical_mixer', 'mechanical_press', 'mechanical_saw', 'spout'
        ].map(machine => `guguaddons:item_application/arcane_${machine}`)
    },
    // Diesel-powered bulk fermentation and distillation are not supported recipe types; centrifuging (Archwood Sap) and vacuum processing gate them instead
    source_industry: {
        'guguaddons:centrifugation': ['guguaddons:centrifugation/archwood_sap'],
        'guguaddons:vacuumizing': ['guguaddons:vacuumizing/liquid_source', 'guguaddons:vacuumizing/superheated_liquid_source'],
        'create:sequenced_assembly': ['guguaddons:sequenced_assembly/centrifuge', 'guguaddons:sequenced_assembly/vacuum_chamber']
    },
    source_relay: {
        'create:sequenced_assembly': ['guguaddons:sequenced_assembly/relay', 'guguaddons:sequenced_assembly/unaligned_relay']
    },
    whirlisprig: {
        'lychee:block_interacting': ['guguaddons:lychee/block_interacting/ritual/whirlisprig_charm']
    },
    spell_basics: {
        'lychee:block_interacting': ['guguaddons:lychee/block_interacting/scribes_table'],
        'create:mixing': ['guguaddons:mixing/magebloom_crop'],
        'create:sequenced_assembly': ['guguaddons:sequenced_assembly/unbound_spellbook']
    },
    containment: {
        'lychee:block_interacting': ['guguaddons:lychee/block_interacting/ritual_brazier'],
        'create:sequenced_assembly': ['guguaddons:sequenced_assembly/mob_jar']
    },
    drygmy: {
        'lychee:block_interacting': ['guguaddons:lychee/block_interacting/ritual/drygmy_charm']
    },
    starbuncle: {
        'lychee:block_interacting': ['guguaddons:lychee/block_interacting/ritual/starbuncle_charm']
    },
    alakarkinos: {
        'lychee:block_interacting': ['guguaddons:lychee/block_interacting/ritual/alakarkinos_charm'],
        'create:crushing': ['guguaddons:crushing/carapace_fragments'],
        'create:compacting': ['guguaddons:compacting/carapace_fragment_block']
    },
    sculk_spreader: {
        'lychee:block_interacting': ['guguaddons:lychee/block_interacting/basic_spell_turret'],
        'create:mechanical_crafting': ['guguaddons:mechanical_crafting/sculk_spreader'],
        'create:sequenced_assembly': ['guguaddons:sequenced_assembly/inscribed_draft'],
        'create:haunting': ['guguaddons:haunting/resonant_draft']
    },
    timer_turret: {
        'create:sequenced_assembly': ['guguaddons:sequenced_assembly/timer_spell_turret']
    },
    magic_storage: {
        'create:sequenced_assembly': ['guguaddons:sequenced_assembly/repository', 'guguaddons:sequenced_assembly/storage_lectern'],
        'lychee:block_interacting': ['guguaddons:lychee/block_interacting/ritual/bookwyrm_charm']
    },
    wixie: {
        'lychee:block_interacting': ['guguaddons:lychee/block_interacting/ritual/wixie_charm']
    },
    // M7-M10 Theurgy alchemy: the recipes that make the machines. Theurgy's own recipe types are not supported, so the item locks below gate them
    mercury: {
        'create:sequenced_assembly': ['guguaddons:sequenced_assembly/alchemical_frame'],
        'lychee:block_interacting': ['guguaddons:lychee/block_interacting/distiller', 'guguaddons:lychee/block_interacting/mercury_catalyst']
    },
    salt_sulfur: {
        'lychee:block_interacting': ['guguaddons:lychee/block_interacting/caloric_flux_emitter']
    },
    reformation: {
        'create:mechanical_crafting': ['guguaddons:mechanical_crafting/sulfuric_flux_emitter'],
        'lychee:block_interacting': [
            'guguaddons:lychee/block_interacting/reformation_source_pedestal',
            'guguaddons:lychee/block_interacting/reformation_target_pedestal',
            'guguaddons:lychee/block_interacting/reformation_result_pedestal'
        ]
    },
    // M11 / M12: Enchanting Apparatus and imbuement recipes cannot be locked, so their entry points (mechanical crafting, sequenced assembly, Lychee rituals) gate them
    enchanting_apparatus: {
        'create:mechanical_crafting': ['guguaddons:mechanical_crafting/enchanting_apparatus'],
        'create:sequenced_assembly': ['guguaddons:sequenced_assembly/dormant_arcane_core']
    },
    heart_of_the_deep: {
        'create:sequenced_assembly': ['guguaddons:sequenced_assembly/blank_seal', 'guguaddons:sequenced_assembly/uncharged_source_seal'],
        'create:mechanical_crafting': ['guguaddons:mechanical_crafting/dormant_sculk_seal'],
        'lychee:block_interacting': ['guguaddons:lychee/block_interacting/ritual/warden_seal']
    },
    incubation: {
        'create:mechanical_crafting': ['guguaddons:mechanical_crafting/incubator'],
        'lychee:block_interacting': [
            'guguaddons:lychee/block_interacting/incubator_mercury_vessel',
            'guguaddons:lychee/block_interacting/incubator_salt_vessel',
            'guguaddons:lychee/block_interacting/incubator_sulfur_vessel'
        ]
    }
}

GuGuMachineStageEvents.register(event => {
    Object.keys(ARCANE_LOCKS).forEach(stage => {
        const byType = ARCANE_LOCKS[stage]
        Object.keys(byType).forEach(type => {
            event.addRecipes(type, byType[type], stage)
        })
    })
})

// Restored original crafting recipes: locked by player stage
const arcaneConfig = global.ARCANE_INDUSTRY
Object.keys(arcaneConfig.RESTORED_CRAFTING).forEach(id => {
    const name = id.split(':')[1]
    AStages.addRestrictionForRecipe(`astages/recipe/${name}`, arcaneConfig.RESTORED_CRAFTING[id], 'minecraft:crafting', id)
})

// Side node "Source Converter" above the opening: the crafting recipe is locked by player stage (recipes/source_converter.js). Source Jar recipes are not locked
AStages.addRestrictionForRecipe('astages/recipe/source_converter', 'source_converter', 'minecraft:crafting', 'kubejs:crafting/source_converter')

// Glyphs: the Scribe's Table does not filter by stage, so glyph items cannot be obtained or used until unlocked
Object.keys(arcaneConfig.GLYPH_STAGES).forEach(stage => {
    arcaneConfig.GLYPH_STAGES[stage].forEach(glyph => {
        AStages.addRestrictionForItem(`astages/item/${glyph}`, stage, `ars_nouveau:${glyph}`)
    })
})

// Wilden Wing only comes from imbuement (GuGuAddons cannot lock imbuement recipes), so an item lock holds it back until "Leap" (spell_mobility), its first use
AStages.addRestrictionForItem('astages/item/wilden_wing', 'spell_mobility', 'ars_nouveau:wilden_wing')

// The Activated Sculk Catalyst only comes from imbuement (GuGuAddons cannot lock imbuement recipes), so an item lock holds it back until sculk_imbuement
AStages.addRestrictionForItem('astages/item/activated_sculk_catalyst', 'sculk_imbuement', 'kubejs:activated_sculk_catalyst')

// M7-M10 Theurgy alchemy: item locks on the machines and the M8 products (Theurgy's distillation, calcination, liquefaction and other recipe types cannot be locked)
// Mercury Shards are not locked: the Storage Lectern of the Magic Storage side quest needs them too, and they only come from the M7 Mercury Distiller
const ALCHEMY_ITEM_LOCKS = {
    mercury: ['theurgy:distiller', 'theurgy:mercury_catalyst'],
    salt_sulfur: ['theurgy:caloric_flux_emitter', 'kubejs:sculk_salt', 'kubejs:sculk_sulfur', 'theurgy:alchemical_sulfur_deepslate'],
    reformation: ['theurgy:sulfuric_flux_emitter', 'theurgy:reformation_source_pedestal', 'theurgy:reformation_target_pedestal', 'theurgy:reformation_result_pedestal'],
    incubation: ['theurgy:incubator', 'theurgy:incubator_mercury_vessel', 'theurgy:incubator_salt_vessel', 'theurgy:incubator_sulfur_vessel']
}
Object.keys(ALCHEMY_ITEM_LOCKS).forEach(stage => {
    ALCHEMY_ITEM_LOCKS[stage].forEach(id => {
        AStages.addRestrictionForItem(`astages/item/${id.split(':')[1]}`, stage, id)
    })
})

// Item locks (2026-11-18, user request): products of stage-locked recipes are locked as well, since players may get items beyond their stage from others
// (locked items are moved out of the inventory, with the GuGuAddons Bag of the Unknown as the safety net). Existing item locks above (glyphs, Wilden Wing, Activated Sculk Catalyst, Theurgy machines) are not repeated
// Not locked: things obtainable online before F4 (the Centrifuge with its GuGuAddons recipe, the nine Arcane machines that Arcane Sheets could already upgrade);
// Liquid Source (F1), Spell Parchment and other general items; transitional items
const ARCANE_ITEM_LOCKS = {
    arcane_essence: ['kubejs:unattuned_essence'],
    source_industry: [
        'guguaddons:vacuum_chamber',
        'kubejs:archwood_sap_bucket', 'kubejs:source_mash_bucket', 'kubejs:dilute_liquid_source_bucket'
    ],
    source_relay: [
        'ars_nouveau:relay', 'kubejs:unaligned_relay',
        'ars_nouveau:relay_collector', 'ars_nouveau:relay_deposit', 'ars_nouveau:relay_splitter'
    ],
    whirlisprig: ['ars_nouveau:whirlisprig_charm'],
    spell_basics: [
        'ars_nouveau:scribes_table', 'kubejs:unbound_spellbook', 'ars_nouveau:novice_spell_book',
        'ars_nouveau:magebloom_crop', 'ars_nouveau:magebloom_fiber', 'ars_nouveau:blank_parchment'
    ],
    containment: ['ars_nouveau:ritual_brazier', 'ars_nouveau:mob_jar', 'ars_nouveau:ritual_containment'],
    drygmy: ['ars_nouveau:drygmy_charm'],
    starbuncle: ['ars_nouveau:starbuncle_charm'],
    alakarkinos: [
        'ars_nouveau:alakarkinos_charm',
        'kubejs:carapace_fragments', 'kubejs:carapace_fragment_block', 'kubejs:tempered_carapace'
    ],
    sculk_spreader: [
        'guguaddons:sculk_spreader', 'ars_nouveau:basic_spell_turret',
        'kubejs:inscribed_draft', 'kubejs:resonant_draft'
    ],
    timer_turret: ['ars_nouveau:timer_spell_turret'],
    magic_storage: ['ars_nouveau:repository', 'ars_nouveau:storage_lectern', 'ars_nouveau:bookwyrm_charm'],
    wixie: ['ars_nouveau:wixie_charm'],
    mercury: ['kubejs:alchemical_frame'],
    enchanting_apparatus: ['ars_nouveau:enchanting_apparatus', 'kubejs:dormant_arcane_core', 'ars_nouveau:arcane_core'],
    heart_of_the_deep: [
        'kubejs:blank_seal', 'kubejs:uncharged_source_seal', 'kubejs:source_seal',
        'kubejs:dormant_sculk_seal', 'kubejs:sculk_seal',
        'kubejs:salted_blank_seal', 'kubejs:sulfurized_blank_seal', 'kubejs:alchemy_seal',
        'kubejs:warden_seal', 'deeperdarker:heart_of_the_deep'
    ]
}
Object.keys(ARCANE_ITEM_LOCKS).forEach(stage => {
    ARCANE_ITEM_LOCKS[stage].forEach(id => {
        AStages.addRestrictionForItem(`astages/item/${id.replace(':', '/')}`, stage, id)
    })
})

