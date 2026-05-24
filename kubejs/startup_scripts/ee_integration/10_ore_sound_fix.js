BlockEvents.modification(event => {
  const deepslateOres = [
    'emendatusenigmatica:coal_deepslate_ore',
    'emendatusenigmatica:copper_deepslate_ore',
    'emendatusenigmatica:diamond_deepslate_ore',
    'emendatusenigmatica:emerald_deepslate_ore',
    'emendatusenigmatica:gold_deepslate_ore',
    'emendatusenigmatica:iron_deepslate_ore',
    'emendatusenigmatica:lapis_deepslate_ore',
    'emendatusenigmatica:quartz_deepslate_ore',
    'emendatusenigmatica:redstone_deepslate_ore',
    'emendatusenigmatica:zinc_deepslate_ore'
  ]

  const netherrackOres = [
    'emendatusenigmatica:coal_netherrack_ore',
    'emendatusenigmatica:copper_netherrack_ore',
    'emendatusenigmatica:diamond_netherrack_ore',
    'emendatusenigmatica:emerald_netherrack_ore',
    'emendatusenigmatica:gold_netherrack_ore',
    'emendatusenigmatica:iron_netherrack_ore',
    'emendatusenigmatica:lapis_netherrack_ore',
    'emendatusenigmatica:quartz_netherrack_ore',
    'emendatusenigmatica:redstone_netherrack_ore',
    'emendatusenigmatica:zinc_netherrack_ore'
  ]

  deepslateOres.forEach(id => {
    event.modify(id, block => {
      block.soundType = 'deepslate'
    })
  })

  netherrackOres.forEach(id => {
    event.modify(id, block => {
      block.soundType = 'netherrack'
    })
  })
})
