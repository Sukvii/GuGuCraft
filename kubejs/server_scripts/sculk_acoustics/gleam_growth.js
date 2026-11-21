// Sculk Acoustics M5: Porous Sculk Gleam only grows in the Otherside (gel level 0 -> 6 only through random ticks); random ticks are cancelled outside the Otherside
// KubeJS 2101.7.2 fires this at the start of BlockStateBase.randomTick and it is cancellable, which also works for blocks that override randomTick
// Each block fires about once every 68 seconds, so the cost is negligible
BlockEvents.randomTick('deeperdarker:porous_sculk_gleam', event => {
    // KubeJS renames Level.dimension() to getDimensionKey(); use LevelKJS.getDimension() (a ResourceLocation) instead
    if (String(event.level.getDimension()) !== global.SCULK_ACOUSTICS.DIMENSION) event.cancel()
})
