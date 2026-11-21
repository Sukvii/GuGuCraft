StartupEvents.registry('block', event => {
    event.create('mythril_ore')
        .displayName('Mythril Ore')
        .hardness(4.0)
        .resistance(4.0)
        .tagBlock('minecraft:mineable/pickaxe')
        .tagBlock('minecraft:needs_diamond_tool')
        .requiresTool(true)
})
