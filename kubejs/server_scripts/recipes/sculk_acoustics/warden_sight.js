// Sculk Acoustics M3 Seeing: Seeing Echo Shard (Enchanting Apparatus) and the Warden Helmet smithing (the addition becomes the Seeing Echo Shard)
// Stage locks in stages/sculk_acoustics.js: the Enchanting Apparatus recipe cannot be locked, so the Seeing Echo Shard item is locked; the smithing recipe uses an AStages recipe lock
ServerEvents.recipes(event => {
    // Reinforced Echo Shard in the center, Soul Dust x8 on the pedestals (consumed), 5000 Source (example)
    event.custom({
        type: 'ars_nouveau:enchanting_apparatus',
        keepNbtOfReagent: false,
        pedestalItems: [1, 2, 3, 4, 5, 6, 7, 8].map(() => ({ item: 'deeperdarker:soul_dust' })),
        reagent: { item: 'deeperdarker:reinforced_echo_shard' },
        result: { count: 1, id: 'kubejs:seeing_echo_shard' },
        sourceCost: 5000
    }).id('guguaddons:ars_nouveau/enchanting_apparatus/seeing_echo_shard')

    // Original recipe: Warden Upgrade Smithing Template + Netherite Helmet + Reinforced Echo Shard
    event.remove({ id: 'deeperdarker:warden_helmet_smithing' })
    event.custom({
        type: 'minecraft:smithing_transform',
        template: { item: 'deeperdarker:warden_upgrade_smithing_template' },
        base: { item: 'minecraft:netherite_helmet' },
        addition: { item: 'kubejs:seeing_echo_shard' },
        result: { count: 1, id: 'deeperdarker:warden_helmet' }
    }).id('guguaddons:smithing/warden_helmet')
})
