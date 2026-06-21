ServerEvents.recipes(event => {
    event.custom({
        type: 'lychee:block_interacting',
        item_in: {
            item: 'kubejs:hallowed_gold_ingot',
            count: 1
        },
        block_in: 'ars_nouveau:green_archwood_wood',
        post: [
            {
                type: 'place',
                block: 'ars_nouveau:imbuement_chamber'
            },
            {
                type: 'execute',
                command: 'execute align xyz positioned ~0.5 ~0.5 ~0.5 run particle minecraft:block{block_state:"ars_nouveau:green_archwood_wood"} ~ ~ ~ 0.35 0.35 0.35 0.05 80 force @a',
                hide: true
            },
            {
                type: 'execute',
                command: 'execute align xyz positioned ~0.5 ~0.5 ~0.5 run playsound minecraft:block.wood.break block @a ~ ~ ~ 1 1',
                hide: true
            },
            {
                type: 'execute',
                command: 'execute align xyz positioned ~0.5 ~0.5 ~0.5 run particle minecraft:end_rod ~ ~ ~ 0.16 0.16 0.16 0.1 20 force @a',
                hide: true
            },
            {
                type: 'execute',
                command: 'execute align xyz positioned ~0.5 ~0.5 ~0.5 run playsound ars_nouveau:ea_finish block @a ~ ~ ~ 1',
                hide: true
            }
        ]
    }).id('guguaddons:lychee/block_interacting/imbuement_chamber')

    event.custom({
        type: 'lychee:block_interacting',
        item_in: {
            item: 'kubejs:hallowed_gold_nugget',
            count: 1
        },
        block_in: 'ars_nouveau:green_archwood_log',
        post: [
            {
                type: 'place',
                block: 'ars_nouveau:arcane_pedestal'
            },
            {
                type: 'execute',
                command: 'execute align xyz positioned ~0.5 ~0.5 ~0.5 run particle minecraft:block{block_state:"ars_nouveau:green_archwood_wood"} ~ ~ ~ 0.35 0.35 0.35 0.05 80 force @a',
                hide: true
            },
            {
                type: 'execute',
                command: 'execute align xyz positioned ~0.5 ~0.5 ~0.5 run playsound minecraft:block.wood.break block @a ~ ~ ~ 1 1',
                hide: true
            },
            {
                type: 'execute',
                command: 'execute align xyz positioned ~0.5 ~0.5 ~0.5 run particle minecraft:end_rod ~ ~ ~ 0.16 0.16 0.16 0.1 20 force @a',
                hide: true
            },
            {
                type: 'execute',
                command: 'execute align xyz positioned ~0.5 ~0.5 ~0.5 run playsound ars_nouveau:ea_finish block @a ~ ~ ~ 1',
                hide: true
            }
        ]
    }).id('guguaddons:lychee/block_interacting/arcane_pedestal')

    event.custom({
        type: 'lychee:block_interacting',
        item_in: {
            item: 'minecraft:copper_block',
            count: 1
        },
        block_in: 'minecraft:blast_furnace',
        post: [
            {
                type: 'place',
                block: 'theurgy:calcination_oven'
            },
            {
                type: 'execute',
                command: 'execute align xyz positioned ~0.5 ~0.5 ~0.5 run particle minecraft:block{block_state:"minecraft:blast_furnace"} ~ ~ ~ 0.35 0.35 0.35 0.05 80 force @a',
                hide: true
            },
            {
                type: 'execute',
                command: 'execute align xyz positioned ~0.5 ~0.5 ~0.5 run playsound minecraft:block.copper.break block @a ~ ~ ~ 1 1',
                hide: true
            }
        ]
    }).id('guguaddons:lychee/block_interacting/calcination_oven')

    event.custom({
        type: 'lychee:block_interacting',
        item_in: {
            item: 'minecraft:copper_block',
            count: 1
        },
        block_in: 'create:blaze_burner[blaze=none]',
        post: [
            {
                type: 'place',
                block: 'theurgy:pyromantic_brazier[lit=false]'
            },
            {
                type: 'execute',
                command: 'execute align xyz positioned ~0.5 ~0.5 ~0.5 run particle minecraft:block{block_state:"create:blaze_burner[blaze=none]"} ~ ~ ~ 0.35 0.35 0.35 0.05 80 force @a',
                hide: true
            },
            {
                type: 'execute',
                command: 'execute align xyz positioned ~0.5 ~0.5 ~0.5 run playsound minecraft:block.copper.break block @a ~ ~ ~ 1 1',
                hide: true
            }
        ]
    }).id('guguaddons:lychee/block_interacting/pyromantic_brazier')

    event.custom({
        type: 'lychee:block_interacting',
        item_in: {
            item: 'minecraft:polished_deepslate',
            count: 1
        },
        block_in: 'create:fluid_tank',
        post: [
            {
                type: 'place',
                block: 'theurgy:sal_ammoniac_tank'
            },
            {
                type: 'execute',
                command: 'execute align xyz positioned ~0.5 ~0.5 ~0.5 run particle minecraft:block{block_state:"create:fluid_tank"} ~ ~ ~ 0.35 0.35 0.35 0.05 80 force @a',
                hide: true
            },
            {
                type: 'execute',
                command: 'execute align xyz positioned ~0.5 ~0.5 ~0.5 run playsound minecraft:block.deepslate.break block @a ~ ~ ~ 1 1',
                hide: true
            }
        ]
    }).id('guguaddons:lychee/block_interacting/sal_ammoniac_tank')

    const emptyBasinCommand = [
        'execute align xyz',
        'unless data block ~ ~ ~ InputItems.Items[0]',
        'unless data block ~ ~ ~ OutputItems.Items[0]',
        'unless data block ~ ~ ~ Overflow[0]',
        'unless data block ~ ~ ~ FluidOverflow[0]',
        'unless data block ~ ~ ~ InputTanks[0].TankContent.id',
        'unless data block ~ ~ ~ InputTanks[0].TankContent.FluidName',
        'unless data block ~ ~ ~ InputTanks[0].TankContent.amount',
        'unless data block ~ ~ ~ InputTanks[0].TankContent.Amount',
        'unless data block ~ ~ ~ InputTanks[1].TankContent.id',
        'unless data block ~ ~ ~ InputTanks[1].TankContent.FluidName',
        'unless data block ~ ~ ~ InputTanks[1].TankContent.amount',
        'unless data block ~ ~ ~ InputTanks[1].TankContent.Amount',
        'unless data block ~ ~ ~ OutputTanks[0].TankContent.id',
        'unless data block ~ ~ ~ OutputTanks[0].TankContent.FluidName',
        'unless data block ~ ~ ~ OutputTanks[0].TankContent.amount',
        'unless data block ~ ~ ~ OutputTanks[0].TankContent.Amount',
        'unless data block ~ ~ ~ OutputTanks[1].TankContent.id',
        'unless data block ~ ~ ~ OutputTanks[1].TankContent.FluidName',
        'unless data block ~ ~ ~ OutputTanks[1].TankContent.amount',
        'unless data block ~ ~ ~ OutputTanks[1].TankContent.Amount'
    ].join(' ')

    event.custom({
        type: 'lychee:block_interacting',
        item_in: {
            item: 'minecraft:copper_block',
            count: 1
        },
        block_in: 'create:basin',
        contextual: {
            type: 'execute',
            command: emptyBasinCommand
        },
        post: [
            {
                type: 'place',
                block: 'theurgy:liquefaction_cauldron'
            },
            {
                type: 'execute',
                command: 'execute align xyz positioned ~0.5 ~0.5 ~0.5 run particle minecraft:block{block_state:"create:basin"} ~ ~ ~ 0.35 0.35 0.35 0.05 80 force @a',
                hide: true
            },
            {
                type: 'execute',
                command: 'execute align xyz positioned ~0.5 ~0.5 ~0.5 run playsound minecraft:block.copper.break block @a ~ ~ ~ 1 1',
                hide: true
            }
        ]
    }).id('guguaddons:lychee/block_interacting/liquefaction_cauldron')

    event.custom({
        type: 'lychee:block_interacting',
        item_in: {
            item: 'waystones:warp_dust',
            count: 1
        },
        block_in: 'minecraft:jungle_sapling',
        post: [
            {
                type: 'place',
                block: 'ars_nouveau:green_archwood_sapling'
            },
            {
                type: 'execute',
                command: 'execute align xyz positioned ~0.5 ~0.5 ~0.5 run particle minecraft:end_rod ~ ~ ~ 0.16 0.16 0.16 0.1 20 force @a',
                hide: true
            },
            {
                type: 'execute',
                command: 'execute align xyz positioned ~0.5 ~0.5 ~0.5 run playsound ars_nouveau:ea_finish block @a ~ ~ ~ 1',
                hide: true
            }
        ]
    }).id('guguaddons:lychee/block_interacting/green_archwood_sapling')

    event.custom({
        type: 'lychee:block_interacting',
        item_in: {
            item: 'waystones:warp_dust',
            count: 1
        },
        block_in: 'minecraft:sweet_berry_bush',
        post: [
            {
                type: 'place',
                block: 'ars_nouveau:sourceberry_bush'
            },
            {
                type: 'execute',
                command: 'execute align xyz positioned ~0.5 ~0.5 ~0.5 run particle minecraft:end_rod ~ ~ ~ 0.16 0.16 0.16 0.1 20 force @a',
                hide: true
            },
            {
                type: 'execute',
                command: 'execute align xyz positioned ~0.5 ~0.5 ~0.5 run playsound ars_nouveau:ea_finish block @a ~ ~ ~ 1',
                hide: true
            }
        ]
    }).id('guguaddons:lychee/block_interacting/sourceberry_bush')
})
