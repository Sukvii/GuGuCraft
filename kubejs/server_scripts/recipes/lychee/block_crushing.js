ServerEvents.recipes(event => {
    const chanceDrop = (id, chance) => ({
        type: 'drop_item',
        id: id,
        if: {
            type: 'chance',
            chance: chance
        }
    })

    // Hallowed Gold Nugget: 8 independent 5% drops, only the first one shown.
    // No random action: Lychee's EMI plugin splits it into plain drops and hides the chance
    // Rhino's const is function-scoped and cannot be declared in a loop body, so it lives in its own function
    const hallowedGoldRoll = index => {
        const drop = chanceDrop('kubejs:hallowed_gold_nugget', 0.05)
        if (index === 0) {
            drop.if.description = { translate: 'kubejs.lychee.hallowed_gold_chance', fallback: 'Chance: 5%% x 8' }
        } else {
            drop.hide = true
        }
        return drop
    }
    const hallowedGoldRolls = []
    for (let i = 0; i < 8; i++) {
        hallowedGoldRolls.push(hallowedGoldRoll(i))
    }

    event.custom({
        type: 'lychee:block_crushing',
        item_in: '8x kubejs:crushed_raw_netherite',
        falling_block: '#minecraft:anvil',
        post: [chanceDrop('create:crushed_raw_gold', 0.6)].concat(hallowedGoldRolls, [
            chanceDrop('kubejs:crushed_raw_netherite', 0.5),
            chanceDrop('minecraft:netherite_scrap', 0.3),
            chanceDrop('minecraft:gold_ingot', 0.3)
        ])
    }).id('guguaddons:lychee/block_crushing/crushed_raw_netherite_refining')
})
