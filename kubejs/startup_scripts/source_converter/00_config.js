// priority: 1000
// 修改这些参数后需要重启游戏/服务器；server/client 脚本只读取此配置。
global.SOURCE_CONVERTER = {
    MACHINE_ID: 'mbd2:source_converter',
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
    // 无法启动时每秒重试一次；运行中的批次不再检测火盆或重算效率。
    CHECK_RETRY_TICKS: 20,
    // 仅在戴护目镜并看向机器时，每半秒获取一次魔源缓存。
    HUD_POLL_TICKS: 10,
    // 8 桶总容量，自动化以约 4 桶为目标；3–5 桶内均为满产。
    TANK_CAPACITY: 8000,
    OPTIMAL_FLUID_MIN: 3000,
    OPTIMAL_FLUID_MAX: 5000,
    SOURCE_CAPACITY: 10000,
    FLUID_PER_BATCH: 100,
    TICKS_PER_BATCH: 200,
    MAX_SOURCE_PER_BATCH: 1000,
    // 超出最佳液量区间仅保留一成产量，耗液与耗时不变；仍可继续加工以排出过量液体。
    OFF_RANGE_EFFICIENCY: 0.1
}

// client 脚本不能写入 global 顶层；预留可变状态，防止资源重载重复注册 Jade 回调。
global.SOURCE_CONVERTER_CLIENT = {}
