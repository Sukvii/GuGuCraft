LootJS.modifiers((event) => {
    event.addBlockModifier("kubejs:mythril_ore")
        .replaceLoot(ItemFilter.ANY, "kubejs:raw_mythril");
});
