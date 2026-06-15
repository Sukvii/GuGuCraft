RecipeViewerEvents.removeEntries('item', event => {
    event.remove('kaleidoscope_cookery:tomato_seed')
    event.remove('kaleidoscope_cookery:tomato')
    event.remove('farmersdelight:rice')
    event.remove('pantographsandwires:iron_rod')
    event.remove('kubejs:incomplete_kinetic_mechanism')
    event.remove('kubejs:incomplete_arcane_mechanism')
    event.remove('kubejs:incomplete_deduction_casing')
    event.remove('kubejs:incomplete_oula_ingot')
    Ingredient.of('/^create_ae2recipes:.*$/').itemIds.forEach(id => {
        event.remove(id)
    })
    Ingredient.of('/^displaydelight:(?!(?:food_plate|small_food_plate)$).*$/').itemIds.forEach(id => {
        event.remove(id)
    })

    const visibleTheurgyItems = new Set([
        'theurgy:calcination_oven',
        'theurgy:pyromantic_brazier',
        'theurgy:sal_ammoniac_tank',
        'theurgy:liquefaction_cauldron',
        'theurgy:purified_gold',
        'theurgy:sal_ammoniac_accumulator',
        'theurgy:sal_ammoniac_bucket'
    ])

    Ingredient.of('/^theurgy:.*$/').itemIds.forEach(id => {
        if (!visibleTheurgyItems.has(id)) {
            event.remove(id)
        }
    })
})
