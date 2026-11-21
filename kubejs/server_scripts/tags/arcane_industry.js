// Arcane Industry: the Dragons Plus bulk sanding catalyst is only quicksand (#c:quicksands) by default; this pack has no quicksand, so use sand (from the Earth Essence split)
ServerEvents.tags('block', event => {
    event.add('create_dragons_plus:fan_processing_catalysts/sanding', ['minecraft:sand', 'minecraft:red_sand'])
})

// Theurgy pedestals and incubator vessels validate by item tag (isItemValid):
// - Reformation source / target pedestals: theurgy:alchemical_sulfurs_and_niters (= alchemical_sulfurs + alchemical_niters)
// - Incubator sulfur / salt / mercury vessels: alchemical_sulfurs / alchemical_salts / alchemical_mercuries (Mercury Shards are already in)
// In Theurgy code alchemical_niters is only used for pedestal validation through the merged tag above, so the items each Alchemy Seal step puts on pedestals go here
ServerEvents.tags('item', event => {
    event.add('theurgy:alchemical_sulfurs', 'kubejs:sculk_sulfur')
    event.add('theurgy:alchemical_salts', 'kubejs:sculk_salt')
    event.add('theurgy:alchemical_niters', [
        'kubejs:blank_seal',
        'kubejs:salted_blank_seal',
        'kubejs:sulfurized_blank_seal',
        'kubejs:sculk_salt',
        'theurgy:mercury_shard',
        'minecraft:echo_shard',
        'kubejs:alchemical_frame'
    ])
})
