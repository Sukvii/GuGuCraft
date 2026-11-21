// Shared config of the Sculk Acoustics chapter (F5): server scripts read it through global.SCULK_ACOUSTICS (client / server scripts cannot assign to global)
global.SCULK_ACOUSTICS = {
    DIMENSION: 'deeperdarker:otherside',

    // Darkness mechanic (design doc F5 "Darkness"): players in the Otherside are checked once per second; when the block light at their feet is < 10, a short Darkness effect is refreshed
    DARKNESS: {
        INTERVAL: 20,
        LIGHT_THRESHOLD: 10,
        DURATION: 60,
        // No refresh while the remaining duration is above this (checked once per second; the margin keeps the effect from lapsing between two checks)
        REFRESH_BELOW: 30,
        // Wearing this on the head grants immunity to the darkness (the Warden armor also clears Darkness every tick on its own)
        IMMUNE_HELMET: 'deeperdarker:warden_helmet'
    },

    // Side quests "Source Converter Upgrade" (below M3) / "Sculk Spreader Upgrade" (below M6): right-click a placed machine with the upgrade in hand;
    // the upgrade is consumed and level 2 is stored in the machine custom data, keeping its fluid and Source without replacing the block (right-click in sculk_acoustics/machine_upgrades.js)
    SOURCE_CONVERTER_MK2: {
        UPGRADE_ITEM: 'kubejs:source_converter_upgrade',
        LEVEL_KEY: 'source_converter_level',
        // Liquid Source and output per batch, the full-yield range and the tank capacity are all x4; the duration stays (tech/source_converter/logic.js)
        MULTIPLIER: 4
    },
    SCULK_SPREADER_MK2: {
        UPGRADE_ITEM: 'kubejs:sculk_spreader_upgrade',
        LEVEL_KEY: 'sculk_spreader_level',
        // Level 2: 11x11 area (radius 5), up to 16 blocks per batch, Source and Experience Nuggets x3 (tech/sculk_spreader.js)
        // The dedicated Sculk Seal recipe still only checks the 7x7 area (radius 3) on the catalyst layer
        RADIUS: 5,
        CONVERT_PER_BATCH: 16,
        INPUT_MULTIPLIER: 3
    },

    // M10 Warden Resonance Chamber (design doc F5 "M10 Warden Resonance Chamber"; numbers are examples, pending testing)
    // Registration: startup_scripts/sculk_acoustics/warden_chamber.js; runtime logic: server_scripts/tech/warden_chamber.js
    WARDEN_CHAMBER: {
        MACHINE_ID: 'guguaddons:warden_resonance_chamber',
        KINETIC_INPUT_ID: 'guguaddons:warden_resonance_kinetic_input',
        RECIPE_TYPE: 'mbd2:warden_resonance',
        LOW_RECIPE_ID: 'kubejs:warden_resonance/low',
        HIGH_RECIPE_ID: 'kubejs:warden_resonance/high',
        ITEM_INPUT_TRAIT: 'item_input',
        // The name must contain item_input: the bottom-layer ports forward inputs by name containment
        WOOL_INPUT_TRAIT: 'item_input_wool',
        ITEM_OUTPUT_TRAIT: 'item_output',
        SOURCE_TRAIT: 'nearby_source',
        // Structure blocks
        CASING: 'kubejs:arcane_casing',
        GLASS: 'deeperdarker:soundproof_glass',
        SENSOR: 'minecraft:sculk_sensor',
        JAR: 'ars_nouveau:mob_jar',
        JAR_ENTITY: 'minecraft:warden',
        // Per batch: Sculk Niter Powder x2 + 2000 Source (Source Jars within radius 10) + stress; 200 ticks
        POWDER: 'kubejs:sculk_niter_powder',
        POWDER_PER_BATCH: 2,
        SOURCE_PER_BATCH: 2000,
        SOURCE_RADIUS: 10,
        TICKS_PER_BATCH: 200,
        // Kinetic input: impact 64 su/RPM, about 4096 stress units at the minimum 64 RPM
        STRESS_PER_RPM: 64,
        STRESS: 4096,
        // Bands (redstone signal strength received by the controller) and base products
        LOW_SIGNAL: [1, 7],
        HIGH_SIGNAL: [8, 15],
        LOW_OUTPUT: 'deeperdarker:warden_carapace',
        HIGH_OUTPUT: 'kubejs:resonance_nucleus',
        // Agitation 0-100: yield x (1 + agitation / OUTPUT_DIVISOR); a batch that would end above THRESHOLD is voided, the machine cools down and drops to RESET
        LOW_DELTA: -5,
        HIGH_DELTA: 15,
        // 81: the highest agitation a high band batch (+15) can start at, 66, is exactly the top of comparator level 9 (60-66), so level <= 9 means the high band is safe; easy to automate
        THRESHOLD: 81,
        RESET: 50,
        COOLDOWN_TICKS: 600,
        // Natural decay is slow (only -1 every DECAY_INTERVAL_TICKS, about one batch); agitation is mainly kept down with wool and the low band
        DECAY_INTERVAL_TICKS: 200,
        WOOL_RELIEF: 10,
        OUTPUT_DIVISOR: 50,
        // Roar animation length of the Warden in the jar when a batch is voided (a vanilla Warden roar is about 84 ticks)
        ROAR_TICKS: 84,
        // Machine custom data (synced to the client, used to render the Warden in the jar)
        AGITATION_KEY: 'warden_chamber_agitation',
        COOLDOWN_KEY: 'warden_chamber_cooldown_until',
        ROAR_KEY: 'warden_chamber_roar_until',
        // Whether the Containment Jar holds a Warden (checked every second on the server; the original block entity data saved in the proxy block is not synced to the client)
        HAS_WARDEN_KEY: 'warden_chamber_has_warden',
        NEXT_CHECK_KEY: 'warden_chamber_next_check',
        CHECK_RETRY_TICKS: 20,
        // Custom renderers (client_scripts/sculk_acoustics/warden_chamber.js): the proxy block at the jar draws the Warden; the formed controller draws the jar model
        JAR_RENDERER: 'kubejs:warden_chamber_jar',
        FORMED_RENDERER: 'kubejs:warden_chamber_formed'
    }
}
