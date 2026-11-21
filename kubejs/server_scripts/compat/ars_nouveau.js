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

    // Original recipes restored by the Arcane Industry chapter (F4): tier 1 glyphs and a few crafting recipes, stage locks in stages/arcane_industry.js
    const arcane = global.ARCANE_INDUSTRY
    Object.keys(arcane.GLYPH_STAGES).forEach(stage => {
        arcane.GLYPH_STAGES[stage]
            .filter(glyph => arcane.REWRITTEN_GLYPHS.indexOf(glyph) < 0)
            .forEach(glyph => keepRecipeIds.add(`ars_nouveau:${glyph}`))
    })
    Object.keys(arcane.RESTORED_CRAFTING).forEach(id => keepRecipeIds.add(id))

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
