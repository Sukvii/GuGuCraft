RecipeViewerEvents.removeEntries('item', event => {
    event.remove('kaleidoscope_cookery:tomato_seed')
    event.remove('kaleidoscope_cookery:tomato')
    event.remove('farmersdelight:rice')
    event.remove('kubejs:incomplete_kinetic_mechanism')
    event.remove('kubejs:incomplete_deduction_casing')
    event.remove('kubejs:incomplete_oula_ingot')
    Ingredient.of('/^create_ae2recipes:.*$/').itemIds.forEach(id => {
        event.remove(id)
    })
    Ingredient.of('/^displaydelight:(?!(?:food_plate|small_food_plate)$).*$/').itemIds.forEach(id => {
        event.remove(id)
    })
})
