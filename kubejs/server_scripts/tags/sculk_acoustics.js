// Tags of the Sculk Acoustics chapter (F5)
// The drill and fluid drill of Create Ore Excavation 1.6.8 only accept the item tag createoreexcavation:drills (CreateOreExcavation.DRILL_TAG);
// the extraction recipe of the Otherside Slurry vein additionally restricts itself to the Resonant Drill with .drill(...) (M8)
ServerEvents.tags('item', event => {
    event.add('createoreexcavation:drills', 'kubejs:resonant_drill')

    // M1 Otherside scrying (recipes/sculk_acoustics/scrying.js): input items
    event.add('kubejs:scry_augments/light_sources', 'minecraft:glowstone_dust')
    event.add('kubejs:scry_augments/infested_sculk', 'minecraft:sculk')

    // M6 Sculk Niter: same family as Sculk Salt and Sculk Sulfur, so it fits on Theurgy's reformation pedestals (theurgy:alchemical_sulfurs_and_niters)
    event.add('theurgy:alchemical_niters', 'kubejs:sculk_niter')
})

ServerEvents.tags('block', event => {
    // M1 Otherside scrying: scry targets. Block tags cannot tell whether a glow vine bears fruit, so fruitless ones are highlighted too
    event.add('kubejs:scry_targets/light_sources', [
        'deeperdarker:sculk_gleam',
        'deeperdarker:porous_sculk_gleam',
        'deeperdarker:glowing_vines',
        'deeperdarker:glowing_vines_plant'
    ])
    event.add('kubejs:scry_targets/infested_sculk', 'deeperdarker:infested_sculk')
})

// Drygmies + Containment Jars would bypass biome farms, so Otherside mobs join Ars Nouveau's built-in Drygmy blacklist (S3: one source per material)
// Exceptions: Sculk Leeches (M2 Soul Dust) and Sludges (M4 Resonarium) are designated sources; their loot tables restrict drops to the Otherside by dimension / biome conditions instead
// (data/deeperdarker/loot_table/entities). Pot-like mobs (anger_pot etc.) are projectile entities and are not listed
ServerEvents.tags('entity_type', event => {
    event.add('ars_nouveau:drygmy_blacklist', [
        'deeperdarker:angler_fish',
        'deeperdarker:sculk_centipede',
        'deeperdarker:sculk_snapper',
        'deeperdarker:shattered',
        'deeperdarker:shriek_worm',
        'deeperdarker:stalker'
    ])
})

// Biome whitelist of the M8 Otherside Slurry vein (Create Ore Excavation's biomeWhitelist is a biome tag; Deeper and Darker has no ready-made Otherside biome tag)
ServerEvents.tags('worldgen/biome', event => {
    event.add('kubejs:otherside_slurry_veins', 'deeperdarker:overcast_columns')
})
