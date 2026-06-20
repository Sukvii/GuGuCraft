ServerEvents.recipes(event => {
    event.custom({
        type: 'lychee:anvil_crafting',
        item_in: [
            'create:andesite_alloy',
            'create:rose_quartz'
        ],
        item_out: 'guguaddons:interface_upgrade_1',
        level_cost: 30,
        material_cost: 1
    }).id('guguaddons:lychee/anvil_crafting/interface_upgrade_1')

    event.custom({
        type: 'lychee:anvil_crafting',
        item_in: [
            'create:brass_sheet',
            'minecraft:emerald'
        ],
        item_out: 'guguaddons:interface_upgrade_2',
        level_cost: 40,
        material_cost: 1
    }).id('guguaddons:lychee/anvil_crafting/interface_upgrade_2')

    event.custom({
        type: 'lychee:anvil_crafting',
        item_in: [
            'minecraft:netherite_upgrade_smithing_template',
            'kubejs:arcane_sheet'
        ],
        item_out: 'guguaddons:interface_upgrade_3',
        level_cost: 50,
        material_cost: 1
    }).id('guguaddons:lychee/anvil_crafting/interface_upgrade_3')
})
