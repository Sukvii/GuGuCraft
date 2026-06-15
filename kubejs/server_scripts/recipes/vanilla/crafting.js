ServerEvents.recipes(event => {
    event.shaped('kubejs:hallowed_gold_ingot', ['AAA', 'AAA', 'AAA'], {
        A: 'kubejs:hallowed_gold_nugget'
    }).id('guguaddons:crafting/hallowed_gold_ingot')

    event.shapeless('9x kubejs:hallowed_gold_nugget', [
        'kubejs:hallowed_gold_ingot'
    ]).id('guguaddons:crafting/hallowed_gold_nugget_from_ingot')

    event.shaped('theurgy:sal_ammoniac_accumulator', ['AAA', 'BCB', 'BDB'], {
        A: 'minecraft:polished_andesite',
        B: 'kubejs:mythril_ingot',
        C: 'create:fluid_tank',
        D: '#minecraft:wooden_slabs'
    }).id('guguaddons:crafting/sal_ammoniac_accumulator')
})
