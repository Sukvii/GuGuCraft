ServerEvents.recipes(event => {
    const keepRecipeIds = new Set([
        'ars_nouveau:sconce',
        'ars_nouveau:polished_sconce',
        'ars_nouveau:polished_source_sconce',
        'ars_nouveau:source_lamp',
        'ars_nouveau:source_gem_block',
        'ars_nouveau:gold_grate',
        'ars_nouveau:jar_of_light',
        'ars_nouveau:arcane_platform'
    ])

    const keepPatterns = [
        /^ars_nouveau:archwood_(?!boat$).+/,
        /^ars_nouveau:(blue|green|purple|red)_archwood_wood$/,
        /^ars_nouveau:stripped_(blue|green|purple|red)_archwood_wood$/,
        /^ars_nouveau:.*sourcestone.*$/
    ]

    const idsToRemove = []

    event.forEachRecipe({ mod: 'ars_nouveau' }, recipe => {
        const id = `${recipe.getId()}`
        const keep = keepRecipeIds.has(id) || keepPatterns.some(pattern => pattern.test(id))

        if (!keep) {
            idsToRemove.push(id)
        }
    })

    idsToRemove.forEach(id => {
        event.remove({ id: id })
    })
})
