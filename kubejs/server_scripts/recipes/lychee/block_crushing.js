ServerEvents.recipes(event => {
    const chanceDrop = (id, chance) => ({
        type: 'drop_item',
        id: id,
        if: {
            type: 'chance',
            chance: chance
        }
    })

    event.custom({
        type: 'lychee:block_crushing',
        item_in: '8x kubejs:crushed_raw_netherite',
        falling_block: '#minecraft:anvil',
        post: [
            chanceDrop('create:crushed_raw_gold', 0.6),
            chanceDrop('kubejs:hallowed_gold_nugget', 0.05),
            chanceDrop('kubejs:crushed_raw_netherite', 0.5),
            chanceDrop('minecraft:netherite_scrap', 0.3),
            chanceDrop('minecraft:gold_ingot', 0.3)
        ]
    }).id('guguaddons:lychee/block_crushing/crushed_raw_netherite_refining')
})
