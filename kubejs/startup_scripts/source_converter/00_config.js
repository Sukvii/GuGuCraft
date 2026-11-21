// priority: 1000
// Changing these parameters needs a game/server restart; server/client scripts only read this config.
global.SOURCE_CONVERTER = {
    // 2026-11-13: moved from mbd2:source_converter to the guguaddons namespace (still in testing, no compatibility with the old ID)
    MACHINE_ID: 'guguaddons:source_converter',
    RECIPE_TYPE: 'mbd2:source_conversion',
    CONVERSION_RECIPE_ID: 'kubejs:source_converter/liquid_source',
    FLUID_ID: 'kubejs:liquid_source',
    FLUID_TRAIT: 'liquid_source_input',
    SOURCE_TRAIT: 'converted_source_output',
    HEATED_KEY: 'source_converter_heated',
    SAMPLED_KEY: 'source_converter_sampled',
    EFFICIENCY_KEY: 'source_converter_efficiency',
    NEXT_CHECK_KEY: 'source_converter_next_check',
    HUD_REQUEST: 'gugucraft:source_converter_inspect',
    HUD_RESPONSE: 'gugucraft:source_converter_status',
    // Retry once per second while it cannot start; a running batch no longer checks the brazier or recomputes efficiency.
    CHECK_RETRY_TICKS: 20,
    // Fetch the Source buffer every half second, only while wearing goggles and looking at the machine.
    HUD_POLL_TICKS: 10,
    // 8 buckets total; automation targets about 4 buckets, and anything within 3-5 buckets is full yield.
    TANK_CAPACITY: 8000,
    OPTIMAL_FLUID_MIN: 3000,
    OPTIMAL_FLUID_MAX: 5000,
    SOURCE_CAPACITY: 10000,
    FLUID_PER_BATCH: 100,
    TICKS_PER_BATCH: 200,
    MAX_SOURCE_PER_BATCH: 1000,
    // Outside the optimal fluid range only a tenth of the yield remains, with the same fluid use and duration; processing continues to drain excess fluid.
    OFF_RANGE_EFFICIENCY: 0.1
}

// Client scripts cannot write top-level global entries; reserve mutable state so resource reloads do not register the Jade callback twice.
global.SOURCE_CONVERTER_CLIENT = {}
