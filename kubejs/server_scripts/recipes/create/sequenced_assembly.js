ServerEvents.recipes(event => {
    const kineticTransitional = 'kubejs:incomplete_kinetic_mechanism'
    const precisionTransitional = 'create:incomplete_precision_mechanism'
    const arcaneTransitional = 'kubejs:incomplete_arcane_mechanism'

    event.recipes.create.sequenced_assembly([
        'kubejs:kinetic_mechanism',
    ], 'create:andesite_alloy', [
        event.recipes.create.deploying(kineticTransitional, [kineticTransitional, 'create:andesite_alloy']),
        event.recipes.create.deploying(kineticTransitional, [kineticTransitional, 'create:andesite_alloy']),
        event.recipes.create.deploying(kineticTransitional, [kineticTransitional, Ingredient.of('#minecraft:planks')]),
        event.recipes.create.deploying(kineticTransitional, [kineticTransitional, 'kubejs:saw']),
    ]).transitionalItem(kineticTransitional).loops(1).damageIngredient('kubejs:saw').id('kubejs:sequenced_assembly/kinetic_mechanism')

    event.remove({ id: 'create:sequenced_assembly/precision_mechanism' })

    event.recipes.create.sequenced_assembly([
        'create:precision_mechanism',
    ], Ingredient.of('#c:plates/gold'), [
        event.recipes.create.deploying(precisionTransitional, [precisionTransitional, 'create:cogwheel']),
        event.recipes.create.deploying(precisionTransitional, [precisionTransitional, 'create:large_cogwheel']),
        event.recipes.create.deploying(precisionTransitional, [precisionTransitional, Ingredient.of('#c:nuggets/iron')]),
    ]).transitionalItem(precisionTransitional).loops(6).id('create:sequenced_assembly/precision_mechanism')

    event.recipes.create.sequenced_assembly([
        'kubejs:arcane_mechanism',
    ], 'pantographsandwires:iron_rod_bundle', [
        event.recipes.create.cutting(arcaneTransitional, arcaneTransitional),
        event.recipes.create.deploying(arcaneTransitional, [arcaneTransitional, 'kubejs:arcane_sheet']),
        event.recipes.create.filling(arcaneTransitional, [arcaneTransitional, Fluid.of('kubejs:liquid_source', 250)]),
        event.recipes.create.deploying(arcaneTransitional, [arcaneTransitional, 'kubejs:hallowed_gold_nugget']),
        event.recipes.create.pressing(arcaneTransitional, arcaneTransitional)
    ]).transitionalItem(arcaneTransitional).loops(3).id('guguaddons:sequenced_assembly/arcane_mechanism')
})
