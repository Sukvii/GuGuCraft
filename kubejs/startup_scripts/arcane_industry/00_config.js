// priority: 1000
// Shared config of the Arcane Industry chapter (F4); server scripts only read it. Changes need a game / server restart
global.ARCANE_INDUSTRY = {
    // Tier 1 glyphs opened by this chapter, grouped by the spell side quest stage that unlocks them (Ars Nouveau 5.13.3 glyph item IDs)
    // compat/ars_nouveau.js restores the original glyph recipes from this, and stages/arcane_industry.js adds item locks from it
    GLYPH_STAGES: {
        spell_basics: ['glyph_projectile', 'glyph_touch', 'glyph_self', 'glyph_light', 'glyph_amplify'],
        spell_control: ['glyph_snare', 'glyph_gust', 'glyph_pull', 'glyph_freeze', 'glyph_bubble'],
        spell_mobility: ['glyph_leap', 'glyph_launch', 'glyph_wind_burst', 'glyph_bounce', 'glyph_underfoot'],
        spell_utility: ['glyph_craft', 'glyph_prestidigitation', 'wololo', 'glyph_toss'],
        spell_combat: ['glyph_harm', 'glyph_ignite', 'glyph_evaporate', 'glyph_dispel', 'glyph_summon_wolves', 'glyph_summon_steed'],
        spell_harvest: ['glyph_break', 'glyph_fell', 'glyph_harvest', 'glyph_pickup', 'glyph_cut', 'glyph_sensitive'],
        spell_building: ['glyph_place_block', 'glyph_phantom_block', 'glyph_rotate', 'glyph_interact', 'glyph_pantomime'],
        spell_mechanism: ['glyph_rune', 'glyph_redstone_signal', 'glyph_delay', 'reset', 'glyph_randomize']
    },
    // Glyphs whose recipes are rewritten instead of restored (none at the moment). The Wilden Wing needed by "Leap" and "Summon Wolves" comes from imbuing Phantom Membrane, so their original recipes stay
    REWRITTEN_GLYPHS: [],
    // M6 Sculk Spreader (MBD2 single-block machine): with an Activated Sculk Catalyst directly below, each batch turns Deepslate around the catalyst on its layer into Sculk
    SCULK_SPREADER: {
        MACHINE_ID: 'guguaddons:sculk_spreader',
        RECIPE_TYPE: 'mbd2:sculk_spreading',
        SPREAD_RECIPE_ID: 'kubejs:sculk_spreader/spreading',
        ITEM_INPUT_TRAIT: 'item_input',
        ITEM_OUTPUT_TRAIT: 'item_output',
        SOURCE_TRAIT: 'source_input',
        SOURCE_CAPACITY: 10000,
        CORE_BLOCK: 'kubejs:activated_sculk_catalyst',
        // (2R+1)^2 - 1 blocks on the catalyst layer, centered on the catalyst
        RADIUS: 3,
        SOURCE_PER_BATCH: 1000,
        XP_PER_BATCH: 4,
        TICKS_PER_BATCH: 100,
        CONVERT_PER_BATCH: 4,
        // For each newly converted Sculk block with air above, a Sensor / Shrieker may grow by chance (Shriekers cannot summon Wardens)
        SENSOR_CHANCE: 0.1,
        SHRIEKER_CHANCE: 0.05,
        // A rejected start is checked at most once per second (timed per recipe, see tech/sculk_spreader.js)
        CHECK_RETRY_TICKS: 20,
        NEXT_CHECK_KEY: 'sculk_spreader_next_check',
        // Dedicated M12 Sculk Seal recipe: Dormant Sculk Seal -> Sculk Seal
        // Conditions: Sculk on the catalyst layer >= AWAKEN_SCULK_REQUIRED, sky light 0 at the machine, machine Y < AWAKEN_MAX_Y
        // Block light is not checked: the Activated Sculk Catalyst itself emits light 6 (decided 2026-11-12)
        AWAKEN_RECIPE_ID: 'kubejs:sculk_spreader/awakening',
        AWAKEN_SCULK_REQUIRED: 48,
        AWAKEN_MAX_Y: 0,
        AWAKEN_SOURCE: 5000,
        AWAKEN_TICKS: 600
    },
    // Summoning circle rituals (shared by the Lychee recipes in server_scripts/recipes/arcane_industry/charms.js and the Ponder scenes in client_scripts/arcane_industry/ponder_rituals.js)
    // Layout: center + Arcane Pedestals at the side midpoints (kept) + corner blocks; the 8 blocks around the spot below the center are Sourcestone
    // - id: the recipe ID is guguaddons:lychee/block_interacting/ritual/<id> (stage locks in stages/arcane_industry.js)
    // - hands: [main hand] or [main hand, off hand], 1 of each consumed
    // - keepCorners: the corners are not consumed (none at the moment); cornerEntity: the corners are Containment Jars holding that creature; ancientCity: must be inside an Ancient City
    // - 2026-11-12: the four Warden jars of the Warden Seal are now consumed
    RITUALS: [
        { id: 'whirlisprig_charm', center: 'minecraft:flowering_azalea', corner: 'ars_nouveau:sourceberry_bush', result: 'ars_nouveau:whirlisprig_charm' },
        { id: 'starbuncle_charm', center: 'minecraft:gold_block', corner: 'ars_nouveau:source_gem_block', result: 'ars_nouveau:starbuncle_charm' },
        { id: 'drygmy_charm', center: 'minecraft:mossy_cobblestone', corner: 'ars_nouveau:mob_jar', result: 'ars_nouveau:drygmy_charm' },
        { id: 'alakarkinos_charm', center: 'minecraft:decorated_pot', corner: 'kubejs:carapace_fragment_block', result: 'ars_nouveau:alakarkinos_charm' },
        { id: 'bookwyrm_charm', center: 'minecraft:chiseled_bookshelf', corner: 'minecraft:lectern', result: 'ars_nouveau:bookwyrm_charm' },
        { id: 'wixie_charm', center: 'minecraft:brewing_stand', corner: 'minecraft:cauldron', result: 'ars_nouveau:wixie_charm' },
        // Sculk Acoustics (F5) side quest "Amethyst Golem" below M2 (stage locks in stages/sculk_acoustics.js)
        { id: 'amethyst_golem_charm', center: 'minecraft:amethyst_block', corner: 'minecraft:amethyst_cluster', result: 'ars_nouveau:amethyst_golem_charm' },
        {
            id: 'warden_seal', center: 'minecraft:sculk_shrieker', corner: 'ars_nouveau:mob_jar', result: 'kubejs:warden_seal',
            hands: ['kubejs:blank_seal', 'deeperdarker:reinforced_echo_shard'],
            cornerEntity: 'minecraft:warden', ancientCity: true
        }
    ],
    RITUAL_DEFAULT_HANDS: ['ars_nouveau:conjuration_essence'],
    // Other restored Ars Nouveau crafting recipes, recipe ID -> stage (Runic Chalk is an ingredient of the "Rune" glyph)
    RESTORED_CRAFTING: {
        'ars_nouveau:blank_parchment': 'spell_basics',
        'ars_nouveau:magebloom_fiber': 'spell_basics',
        'ars_nouveau:ritual_containment': 'containment',
        'ars_nouveau:runic_chalk': 'spell_mechanism'
    }
}
