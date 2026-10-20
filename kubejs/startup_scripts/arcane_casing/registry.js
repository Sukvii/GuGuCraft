// 客户端脚本重载时保留注册状态，Create 的模型包装只在首次烘焙前注册一次。
global.ARCANE_CASING_CLIENT = {
    connectedTexturesRegistered: false
}

StartupEvents.registry('block', event => {
    event.create('kubejs:arcane_casing')
        .displayName('奥术机壳')
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
