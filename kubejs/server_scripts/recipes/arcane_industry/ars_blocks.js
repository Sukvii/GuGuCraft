// Arcane Industry: arcane rework of Ars Nouveau blocks (based on the matching Create blocks, "arcanized" with essences)
// Stage locks are in stages/arcane_industry.js
ServerEvents.recipes(event => {
    const LS = amount => Fluid.of('kubejs:liquid_source', amount)

    // ---------------------------------------------------------------- Right-click conversion (Lychee)
    const effects = block => [
        {
            type: 'execute',
            command: `execute align xyz positioned ~0.5 ~0.5 ~0.5 run particle minecraft:block{block_state:"${block}"} ~ ~ ~ 0.35 0.35 0.35 0.05 80 force @a`,
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

    // Replace in place with the target block
    const convertInPlace = (name, key, blockIn, blockOut) => {
        event.custom({
            type: 'lychee:block_interacting',
            item_in: { item: key, count: 1 },
            block_in: blockIn,
            post: [{ type: 'place', block: blockOut }].concat(effects(blockIn))
        }).id(`guguaddons:lychee/block_interacting/${name}`)
    }

    // Remove the original block and drop the finished one: the Scribe's Table is two blocks wide, so placing it in place would leave it incomplete
    const convertToItem = (name, key, blockIn, itemOut) => {
        event.custom({
            type: 'lychee:block_interacting',
            item_in: { item: key, count: 1 },
            block_in: blockIn,
            post: [{ type: 'place', block: 'minecraft:air' }, { type: 'drop_item', id: itemOut }].concat(effects(blockIn))
        }).id(`guguaddons:lychee/block_interacting/${name}`)
    }

    convertToItem('scribes_table', 'ars_nouveau:manipulation_essence', 'create:schematic_table', 'ars_nouveau:scribes_table')
    convertInPlace('basic_spell_turret', 'ars_nouveau:air_essence', 'create:deployer', 'ars_nouveau:basic_spell_turret')
    // The same block as the Pyromantic Brazier (copper block) right-click, with a different key item
    convertInPlace('ritual_brazier', 'ars_nouveau:conjuration_essence', 'create:blaze_burner[blaze=none]', 'ars_nouveau:ritual_brazier')

    // ---------------------------------------------------------------- Sequenced assembly
    const assembly = (name, output, input, steps, loops) => {
        const t = `kubejs:incomplete_${name}`
        const stepRecipes = steps.map(step => {
            if (step === 'press') {
                return event.recipes.create.pressing(t, t)
            }
            if (typeof step === 'number') {
                return event.recipes.create.filling(t, [t, LS(step)])
            }
            return event.recipes.create.deploying(t, [t, step])
        })
        event.recipes.create.sequenced_assembly([output], input, stepRecipes)
            .transitionalItem(t).loops(loops || 1).id(`guguaddons:sequenced_assembly/${name}`)
    }

    // Number = filling with Liquid Source (mB), 'press' = pressing, anything else = deploying that item
    assembly('repository', 'ars_nouveau:repository', 'create:item_vault', ['ars_nouveau:earth_essence', 250, 'press'])
    assembly('mob_jar', 'ars_nouveau:mob_jar', 'create:fluid_tank', ['ars_nouveau:abjuration_essence', 250, 'press'])
    assembly('relay', 'ars_nouveau:relay', 'create:fluid_pipe', ['ars_nouveau:water_essence', 250, 'press'])
    assembly('unaligned_relay', 'kubejs:unaligned_relay', 'ars_nouveau:relay', [250, 'kubejs:hallowed_gold_nugget', 'press'])
    assembly('timer_spell_turret', 'ars_nouveau:timer_spell_turret', 'ars_nouveau:basic_spell_turret',
        ['minecraft:clock', 'minecraft:sculk_sensor', 'create:precision_mechanism', 500])
    assembly('storage_lectern', 'ars_nouveau:storage_lectern', 'minecraft:lectern',
        ['ars_nouveau:repository', 'theurgy:mercury_shard', 'kubejs:arcane_sheet', 'press'])
    assembly('unbound_spellbook', 'kubejs:unbound_spellbook', 'create:clipboard', [
        'ars_nouveau:water_essence', 'ars_nouveau:earth_essence', 'ars_nouveau:air_essence',
        'ars_nouveau:abjuration_essence', 'ars_nouveau:conjuration_essence', 'ars_nouveau:manipulation_essence',
        'ars_nouveau:magebloom_fiber', 500
    ])

    // ---------------------------------------------------------------- Imbuement (pedestal items are not consumed)
    const imbue = (name, input, output, source, pedestals) => {
        event.recipes.ars_nouveau.imbuement(input, output, source, pedestals)
            .id(`guguaddons:ars_nouveau/imbuement/${name}`)
    }

    imbue('relay_collector', 'kubejs:unaligned_relay', 'ars_nouveau:relay_collector', 3000,
        ['minecraft:chest', 'minecraft:chest', 'minecraft:chest'])
    imbue('relay_deposit', 'kubejs:unaligned_relay', 'ars_nouveau:relay_deposit', 3000,
        ['minecraft:hopper', 'minecraft:hopper', 'minecraft:hopper'])
    imbue('relay_splitter', 'kubejs:unaligned_relay', 'ars_nouveau:relay_splitter', 3000,
        ['minecraft:quartz', 'minecraft:quartz', 'minecraft:lapis_lazuli'])
    // The pedestals pay homage to the iron pickaxe / axe / sword of the original recipe
    imbue('novice_spell_book', 'kubejs:unbound_spellbook', 'ars_nouveau:novice_spell_book', 5000,
        ['minecraft:iron_pickaxe', 'minecraft:iron_axe', 'minecraft:iron_sword'])

    // ---------------------------------------------------------------- Magebloom (ingredient of Blank Parchment)
    event.recipes.create.mixing('ars_nouveau:magebloom_crop', [
        'minecraft:wheat_seeds',
        'ars_nouveau:source_gem',
        'ars_nouveau:earth_essence'
    ]).heated().id('guguaddons:mixing/magebloom_crop')

    // ---------------------------------------------------------------- Wilden Wing: this pack disables Wilden spawning, so it comes from imbuing Phantom Membrane instead
    // Imbuement recipes cannot be locked, so the item lock in stages/arcane_industry.js holds it back until spell_mobility
    imbue('wilden_wing', 'minecraft:phantom_membrane', 'ars_nouveau:wilden_wing', 500, ['ars_nouveau:air_essence'])
})
