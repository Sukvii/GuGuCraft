// Arcane Industry opening: Unattuned Essence + Encased Fan split into the seven essences (stage arcane_essence, locked on the sequenced assembly)
ServerEvents.recipes(event => {
    const unattuned = 'kubejs:unattuned_essence'
    const transitional = 'kubejs:incomplete_unattuned_essence'

    event.recipes.create.sequenced_assembly([
        unattuned
    ], 'ars_nouveau:source_gem', [
        event.recipes.create.filling(transitional, [transitional, Fluid.of('kubejs:liquid_source', 250)]),
        event.recipes.create.deploying(transitional, [transitional, 'kubejs:hallowed_gold_nugget']),
        event.recipes.create.pressing(transitional, transitional)
    ]).transitionalItem(transitional).loops(1).id('guguaddons:sequenced_assembly/unattuned_essence')

    // Each essence maps to one bulk processing type, 1 for 1
    event.recipes.create.splashing('ars_nouveau:water_essence', unattuned)
        .id('guguaddons:splashing/water_essence')
    event.recipes.create.haunting('ars_nouveau:conjuration_essence', unattuned)
        .id('guguaddons:haunting/conjuration_essence')

    const dragonsPlus = (type, output, extra) => {
        const recipe = {
            type: `create_dragons_plus:${type}`,
            ingredients: [{ item: unattuned }],
            results: [{ id: output }]
        }
        Object.keys(extra || {}).forEach(key => {
            recipe[key] = extra[key]
        })
        return event.custom(recipe).id(`guguaddons:${type}/${output.split(':')[1]}`)
    }
    dragonsPlus('ending', 'ars_nouveau:air_essence')
    dragonsPlus('freezing', 'ars_nouveau:abjuration_essence')
    // The sanding catalyst is the block tag fan_processing_catalysts/sanding; this pack adds sand to it (tags/arcane_industry.js)
    // create:sandpaper_polishing is not used: Dragons Plus also turns it into a sanding recipe, and players could make it with sandpaper in hand
    dragonsPlus('sanding', 'ars_nouveau:earth_essence')
    // Bulk dyeing: purple liquid dye, about 100 mB per item
    dragonsPlus('coloring', 'ars_nouveau:manipulation_essence', { color: 'minecraft:purple', dye_fluid_amount: 100 })

    // Fire Essence is not needed in this chapter, so it keeps the vanilla blast furnace recipe (bulk smelting works too)
    event.blasting('ars_nouveau:fire_essence', unattuned).id('guguaddons:blasting/fire_essence')
})
