ServerEvents.recipes(event => {
    // Only keep the plates and the compress / decompress recipes between alloys and alloy blocks.
    // The root *_alloy recipes are decompression; alloy production recipes live under mixing / mechanical_crafting.
    const keepRecipeIds = new Set([
        'createmoremachines:pressing/netherite_sheet',
        'createmoremachines:pressing/end_sheet',
        'createmoremachines:pressing/beyond_sheet',
        'createmoremachines:netherite_alloy',
        'createmoremachines:netherite_alloy_block',
        'createmoremachines:end_alloy',
        'createmoremachines:end_alloy_block',
        'createmoremachines:beyond_alloy',
        'createmoremachines:beyond_alloy_block'
    ])

    const idsToRemove = []

    event.forEachRecipe({ mod: 'createmoremachines' }, recipe => {
        const id = `${recipe.getId()}`
        if (!keepRecipeIds.has(id)) {
            idsToRemove.push(id)
        }
    })

    idsToRemove.forEach(id => {
        event.remove({ id: id })
    })
})
