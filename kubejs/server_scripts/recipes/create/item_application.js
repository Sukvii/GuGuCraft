ServerEvents.recipes(event => {
    // Logs reuse the Ars Nouveau tag and also accept Archwood blocks stripped on all four sides.
    const strippedArchwood = Ingredient.of([
        '#c:logs/archwood_stripped',
        'ars_nouveau:stripped_blue_archwood_wood',
        'ars_nouveau:stripped_green_archwood_wood',
        'ars_nouveau:stripped_purple_archwood_wood',
        'ars_nouveau:stripped_red_archwood_wood'
    ])

    event.recipes.create.item_application('kubejs:arcane_casing', [
        strippedArchwood,
        'kubejs:arcane_sheet'
    ]).id('guguaddons:item_application/arcane_casing')
})
