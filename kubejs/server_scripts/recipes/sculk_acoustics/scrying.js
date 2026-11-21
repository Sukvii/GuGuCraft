// Sculk Acoustics M1 Scrying: crafting recipe of the Scrying Slate (stage locks in stages/sculk_acoustics.js) and two Otherside-specific scry recipes
// The pack removes every Ars Nouveau recipe (compat/ars_nouveau.js removes by the ars_nouveau namespace), so these recipes use the guguaddons namespace
ServerEvents.recipes(event => {
    // Keeps the shapeless form of the original recipe, swapping each ingredient for a mass-produced item from earlier chapters, plus an Arcane Mechanism:
    // Vexing Archwood Log -> Flourishing Archwood Log (F4 M1 centrifuge line), Spider Eye x3 -> Sculk Sensor x3 (F4 M6), Glowstone -> Reinforced Echo Shard (F4 M11)
    event.shapeless('ars_nouveau:ritual_scrying', [
        'ars_nouveau:green_archwood_log',
        'minecraft:sculk_sensor',
        'minecraft:sculk_sensor',
        'minecraft:sculk_sensor',
        'deeperdarker:reinforced_echo_shard',
        'ars_nouveau:source_gem_block',
        'kubejs:arcane_mechanism'
    ]).id('guguaddons:crafting/ritual_scrying')

    // Scry ritual recipes (Ars Nouveau 5.13.3 ScryRitualRecipe): augment is the tag of the inserted item, highlight is the tag of the blocks to reveal
    // Both tags are in tags/sculk_acoustics.js. The ritual matches recipes first, so inserting Sculk no longer scries for Sculk itself
    const scry = (name, augment, highlight) => event.custom({
        type: 'ars_nouveau:scry_ritual',
        augment: augment,
        highlight: highlight
    }).id(`guguaddons:ars_nouveau/scry_ritual/${name}`)

    scry('otherside_light_sources', 'kubejs:scry_augments/light_sources', 'kubejs:scry_targets/light_sources')
    scry('infested_sculk', 'kubejs:scry_augments/infested_sculk', 'kubejs:scry_targets/infested_sculk')
})
