ServerEvents.recipes(event => {
    event.remove({id:"handcrafted:wood_cup"})
    event.shaped('handcrafted:wood_cup', [
        'W W',
        'W W',
        ' W '
    ], {
        W: '#minecraft:wooden_slabs'
    }).id('kubejs:crafting/wood_cup')
})