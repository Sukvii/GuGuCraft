// Stage locks of the Sculk Acoustics chapter (F5). The stages themselves are declared in stages.js
// - Machine / Lychee recipes: locked by machine owner (the acting player for Lychee) through GuGuMachineStageEvents
// - Crafting and smithing recipes: AStages recipe locks; for recipe types that cannot be locked (Enchanting Apparatus, imbuement, ...) the products are locked instead

// Recipes locked by machine owner (recipe types supported by GuGuAddons)
const SCULK_ACOUSTICS_LOCKS = {
    resonarium: {
        'create:mixing': ['guguaddons:mixing/resonarium_ingot'],
        'create:pressing': ['guguaddons:pressing/resonarium_plate']
    },
    gleam: {
        'create:filling': ['guguaddons:filling/porous_sculk_gleam']
    },
    abyss_catalysis: {
        'create:mechanical_crafting': ['guguaddons:mechanical_crafting/abyss_catalytic_chamber'],
        'guguaddons:abyss_catalysis': ['guguaddons:abyss_catalysis/soul_crystal']
    },
    otherside_fluid: {
        'create:mechanical_crafting': ['guguaddons:mechanical_crafting/resonant_drill'],
        'create:mixing': ['guguaddons:mixing/gleam_lubricant'],
        'guguaddons:abyss_catalysis': ['guguaddons:abyss_catalysis/echo_spirit']
    },
    resonant_casing: {
        'create:compacting': ['guguaddons:compacting/resonant_shell']
    },
    echo_mechanism: {
        'create:sequenced_assembly': ['guguaddons:sequenced_assembly/echo_mechanism']
    },
    abyss_extraction: {
        'guguaddons:abyss_catalysis': ['guguaddons:abyss_catalysis/liquid_source']
    },
    fire_essence: {
        'create:mixing': ['guguaddons:mixing/sculk_salt']
    },
    amethyst_golem: {
        'lychee:block_interacting': ['guguaddons:lychee/block_interacting/ritual/amethyst_golem_charm']
    },
    resonant_machines: {
        'create:sequenced_assembly': ['guguaddons:sequenced_assembly/resonant_casing'],
        'create:item_application': [
            'basin', 'crushing_wheel', 'deployer', 'depot', 'encased_fan',
            'mechanical_mixer', 'mechanical_press', 'mechanical_saw', 'spout'
        ].map(machine => `guguaddons:item_application/resonant_${machine}`)
    },
    source_converter_mk2: {
        'create:sequenced_assembly': ['guguaddons:sequenced_assembly/source_converter_upgrade']
    },
    sculk_spreader_mk2: {
        'create:sequenced_assembly': ['guguaddons:sequenced_assembly/sculk_spreader_upgrade']
    },
    warden_resonance: {
        'create:mechanical_crafting': ['guguaddons:mechanical_crafting/warden_resonance_chamber']
    },
    fermentation: {
        'lychee:block_interacting': ['guguaddons:lychee/block_interacting/fermentation_vat']
    },
    digestion: {
        'lychee:block_interacting': ['guguaddons:lychee/block_interacting/digestion_vat']
    }
}

GuGuMachineStageEvents.register(event => {
    Object.keys(SCULK_ACOUSTICS_LOCKS).forEach(stage => {
        const byType = SCULK_ACOUSTICS_LOCKS[stage]
        Object.keys(byType).forEach(type => {
            event.addRecipes(type, byType[type], stage)
        })
    })
})

// M1 Scrying: crafting recipe of the Scrying Slate
AStages.addRestrictionForRecipe('astages/recipe/ritual_scrying', 'scrying', 'minecraft:crafting', 'guguaddons:crafting/ritual_scrying')

// M3 Seeing: smithing recipe of the Warden Helmet
AStages.addRestrictionForRecipe('astages/recipe/warden_helmet', 'warden_sight', 'minecraft:smithing', 'guguaddons:smithing/warden_helmet')


// M10: crafting recipe of the Resonance Chamber Kinetic Input
AStages.addRestrictionForRecipe('astages/recipe/warden_resonance_kinetic_input', 'warden_resonance', 'minecraft:crafting', 'guguaddons:crafting/warden_resonance_kinetic_input')

// M7: crafting recipe of the Mechanical Shrieker
AStages.addRestrictionForRecipe('astages/recipe/mechanical_shrieker', 'abyss_catalysis', 'minecraft:crafting', 'guguaddons:crafting/mechanical_shrieker')


// Item locks (2026-11-18): products of stage-locked recipes are locked as well, since players may get items beyond their stage from others
// (locked items are moved out of the inventory, with the GuGuAddons Bag of the Unknown as the safety net). Recipes that cannot be locked (Enchanting Apparatus, Theurgy recipe types) rely on these alone
// Not locked: things with natural generation or exploration sources (Porous Sculk Gleam, Soul Crystal, Resonarium), things with other sources (Sculk Salt), transitional items and waste;
// the Abyss Catalytic Chamber and Mechanical Shrieker, already available online (GuGuAddons ships their recipes), only have their recipes locked
const SCULK_ACOUSTICS_ITEM_LOCKS = {
    scrying: ['ars_nouveau:ritual_scrying'],
    warden_sight: ['kubejs:seeing_echo_shard', 'deeperdarker:warden_helmet'],
    resonarium: ['kubejs:resonarium_ingot', 'deeperdarker:resonarium_plate'],
    fermentation: ['theurgy:fermentation_vat', 'kubejs:sculk_niter'],
    otherside_fluid: [
        'kubejs:resonant_drill',
        'kubejs:otherside_slurry_bucket', 'kubejs:echo_spirit_bucket', 'kubejs:gleam_lubricant_bucket'
    ],
    digestion: ['theurgy:digestion_vat', 'kubejs:sculk_niter_powder'],
    warden_resonance: [
        'guguaddons:warden_resonance_chamber', 'guguaddons:warden_resonance_kinetic_input', 'kubejs:resonance_nucleus'
    ],
    resonant_casing: ['kubejs:resonant_shell'],
    resonance_core: ['kubejs:resonance_core'],
    echo_mechanism: ['kubejs:echo_mechanism'],
    // Side quests
    amethyst_golem: ['ars_nouveau:amethyst_golem_charm'],
    source_converter_mk2: ['kubejs:source_converter_upgrade'],
    sculk_spreader_mk2: ['kubejs:sculk_spreader_upgrade'],
    resonant_machines: ['kubejs:resonant_casing'].concat([
        'basin', 'crushing_wheel', 'deployer', 'depot', 'encased_fan',
        'mechanical_mixer', 'mechanical_press', 'mechanical_saw', 'spout'
    ].map(machine => `createmoremachines:netherite_${machine}`)),
    resonarium_gear: ['axe', 'boots', 'chestplate', 'helmet', 'hoe', 'leggings', 'pickaxe', 'shovel', 'sword']
        .map(part => `deeperdarker:resonarium_${part}`),
    soul_elytra: ['deeperdarker:soul_elytra'],
    warden_gear: ['axe', 'boots', 'chestplate', 'hoe', 'leggings', 'pickaxe', 'shovel', 'sword']
        .map(part => `deeperdarker:warden_${part}`)
}
Object.keys(SCULK_ACOUSTICS_ITEM_LOCKS).forEach(stage => {
    SCULK_ACOUSTICS_ITEM_LOCKS[stage].forEach(id => {
        AStages.addRestrictionForItem(`astages/item/${id.replace(':', '/')}`, stage, id)
    })
})

// Side quests: original recipes with AStages recipe locks
// Resonarium gear (below M4): 9 smithing recipes (Resonarium Upgrade Smithing Template + diamond gear + Resonarium Plate)
;['axe', 'boots', 'chestplate', 'helmet', 'hoe', 'leggings', 'pickaxe', 'shovel', 'sword'].forEach(part => {
    AStages.addRestrictionForRecipe(`astages/recipe/resonarium_${part}`, 'resonarium_gear', 'minecraft:smithing', `deeperdarker:resonarium_${part}_smithing`)
})
// Remaining Warden gear (below M10): 8 smithing recipes besides the helmet (the helmet is under M3 above)
;['axe', 'boots', 'chestplate', 'hoe', 'leggings', 'pickaxe', 'shovel', 'sword'].forEach(part => {
    AStages.addRestrictionForRecipe(`astages/recipe/warden_${part}`, 'warden_gear', 'minecraft:smithing', `deeperdarker:warden_${part}_smithing`)
})
// Soul Elytra (below M7)
AStages.addRestrictionForRecipe('astages/recipe/soul_elytra', 'soul_elytra', 'minecraft:crafting', 'deeperdarker:soul_elytra')
