ServerEvents.recipes(event => {
    // 原木复用 Ars Nouveau 的标签，同时允许四面去皮的至高木块。
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
