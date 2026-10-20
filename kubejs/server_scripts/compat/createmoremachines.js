ServerEvents.recipes(event => {
    // 仅保留压板，以及合金与合金块之间的压缩／解压配方。
    // 根目录的 *_alloy 是解压配方，合金生产配方位于 mixing / mechanical_crafting 下。
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
