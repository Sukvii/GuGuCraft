ServerEvents.recipes(event => {
    event.remove({ id: 'pantographsandwires:blasting/coal_coke' })

    event.custom({
        type: 'theurgy:calcination',
        category: 'misc',
        ingredient: {
            ingredient: {
                tag: 'minecraft:coals'
            },
            count: 1
        },
        result: {
            type: 'theurgy:item',
            id: 'pantographsandwires:coal_coke',
            count: 1
        },
        time: 200
    }).id('guguaddons:theurgy/calcination/coal_coke')

    event.custom({
        type: 'theurgy:calcination',
        category: 'misc',
        ingredient: {
            ingredient: {
                item: 'minecraft:coal_block'
            },
            count: 1
        },
        result: {
            type: 'theurgy:item',
            id: 'pantographsandwires:coal_coke_block',
            count: 1
        },
        time: 1600
    }).id('guguaddons:theurgy/calcination/coal_coke_block')
})
