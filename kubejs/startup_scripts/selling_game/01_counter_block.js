StartupEvents.registry('block', event => {
  event.create('counter')
    .unbreakable()
    .blockEntity(info => {
      // KubeJS 2101: enable the server-side tick; the tick body is the
      // BlockEvents.blockEntityTick('kubejs:counter', ...) handler in the
      // server script. tickFrequency(1) = every tick (smooth customer movement;
      // per-second logic is gated inside tableTick).
      info.serverTicking()
      info.tickFrequency(1)
    })
})
