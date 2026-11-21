// Sculk Acoustics side quests: Abyss Extraction, uses of Fire Essence; recipes moved out of this chapter (numbers are examples, pending testing; stage locks in stages/sculk_acoustics.js)
// Resonarium gear, the remaining Warden gear and the Soul Elytra keep their original recipes and only get stage locks
ServerEvents.recipes(event => {
    // Abyss Extraction (below M7): top Gleam Gel x1; bottom 1000 mB Source Mash; catalyst Activated Sculk Catalyst (5% consumption chance); superheated
    // -> 1500 mB Liquid Source (no ethanol byproduct). Never write item ingredients as { tag: ... }, see catalysis_fluid.js for why
    event.custom({
        type: 'guguaddons:abyss_catalysis',
        topIngredients: [{ item: 'deeperdarker:gleam_gel' }],
        bottomIngredients: [{ fluid: 'kubejs:source_mash', amount: 1000 }],
        catalysts: [{ item: 'kubejs:activated_sculk_catalyst' }],
        chances: 0.05,
        results: [{ id: 'kubejs:liquid_source', amount: 1500 }],
        heatRequirement: 'superheated'
    }).id('guguaddons:abyss_catalysis/liquid_source')

    // Use of Fire Essence (below M8): Sculk x8 + Fire Essence -[heated mixing]-> Sculk Salt x8, the bulk route for Sculk Salt (the Theurgy Calcination Oven stays)
    const sculk = []
    for (let i = 0; i < 8; i++) sculk.push('minecraft:sculk')
    event.recipes.create.mixing('8x kubejs:sculk_salt', sculk.concat(['ars_nouveau:fire_essence']))
        .heated().id('guguaddons:mixing/sculk_salt')

    // The Sonorous Staff is not opened in this chapter (noted for F6), so its original recipe is removed
    event.remove({ id: 'deeperdarker:sonorous_staff' })
})
