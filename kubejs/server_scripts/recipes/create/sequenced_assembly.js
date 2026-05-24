ServerEvents.recipes(event => {
    const transitional = 'kubejs:incomplete_kinetic_mechanism'
    const precisionTransitional = 'create:incomplete_precision_mechanism'

    event.recipes.create.sequenced_assembly([
        'kubejs:kinetic_mechanism',
    ], 'create:andesite_alloy', [
        event.recipes.create.deploying(transitional, [transitional, 'create:andesite_alloy']),
        event.recipes.create.deploying(transitional, [transitional, 'create:andesite_alloy']),
        event.recipes.create.deploying(transitional, [transitional, Ingredient.of('#minecraft:planks')]),
        event.recipes.create.deploying(transitional, [transitional, 'kubejs:saw']),
    ]).transitionalItem(transitional).loops(1).damageIngredient('kubejs:saw').id('kubejs:sequenced_assembly/kinetic_mechanism')

    event.remove({ id: 'create:sequenced_assembly/precision_mechanism' })

    event.recipes.create.sequenced_assembly([
        'create:precision_mechanism',
    ], Ingredient.of('#c:plates/gold'), [
        event.recipes.create.deploying(precisionTransitional, [precisionTransitional, 'create:cogwheel']),
        event.recipes.create.deploying(precisionTransitional, [precisionTransitional, 'create:large_cogwheel']),
        event.recipes.create.deploying(precisionTransitional, [precisionTransitional, Ingredient.of('#c:nuggets/iron')]),
    ]).transitionalItem(precisionTransitional).loops(6).id('create:sequenced_assembly/precision_mechanism')
})
