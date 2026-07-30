StartupEvents.registry('item', event => {
  event.create('iron_contract')
  event.create('gold_contract')
  event.create('diamond_contract')
  event.create('crowbar')
  event.create('station_linker').maxStackSize(1)
})
