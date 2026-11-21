// Sculk Acoustics M7 Abyss Catalytic Chamber / M8 Otherside fluid veins (numbers are examples, pending testing; stage locks in stages/sculk_acoustics.js)
// The chamber's three-step process, vibration reports and dregs rule are implemented in GuGuAddons; only the recipes are here
//
// Abyss catalysis recipes (GuGuAddons 0.2.20 AbyssCatalysisRecipeParams): topIngredients / bottomIngredients / catalysts /
// chances (catalyst consumption chance) / results / heatRequirement. Each ingredient is either a "fluid ingredient" or an "item ingredient",
// and fluids are tried first: never write item ingredients as { tag: ... } (they would be read as fluid tags); express counts by repeating entries
ServerEvents.recipes(event => {
    const item = id => ({ item: id })
    const fluid = (id, amount) => ({ fluid: id, amount: amount })
    const repeat = (ingredient, times) => {
        const list = []
        for (let i = 0; i < times; i++) list.push(ingredient)
        return list
    }
    const catalysis = (name, recipe) => {
        recipe.type = 'guguaddons:abyss_catalysis'
        event.custom(recipe).id(`guguaddons:abyss_catalysis/${name}`)
    }

    // ================================================================ M7 Abyss Catalytic Chamber (abyss_catalysis)
    // Chamber: keeps the GuGuAddons mechanical crafting pattern, with Iron Sheet x4 -> Resonarium Plate x4 and Andesite Casing -> Alchemical Frame
    event.remove({ id: 'guguaddons:abyss_catalytic_chamber' })
    event.recipes.create.mechanical_crafting('guguaddons:abyss_catalytic_chamber', [
        'APA',
        'TBT',
        'SCS',
        'HBI',
        'APA'
    ], {
        A: 'minecraft:sculk',
        P: 'deeperdarker:resonarium_plate',
        T: 'create:fluid_tank',
        B: 'create:basin',
        S: 'minecraft:sculk_sensor',
        C: 'kubejs:alchemical_frame',
        H: 'create:hose_pulley',
        I: '#c:storage_blocks/iron'
    }).id('guguaddons:mechanical_crafting/abyss_catalytic_chamber')

    // Mechanical Shrieker: the original crafting recipe plus Lite x1 (only obtainable by breaking Lite blocks in Ancient Temples)
    event.remove({ id: 'guguaddons:mechanical_shrieker' })
    event.shaped('guguaddons:mechanical_shrieker', [
        'XS ',
        'WYP',
        ' L '
    ], {
        X: 'deeperdarker:lite',
        S: 'create:shaft',
        W: 'create:whisk',
        Y: 'minecraft:sculk_shrieker',
        P: 'create:precision_mechanism',
        L: 'create:large_cogwheel'
    }).id('guguaddons:crafting/mechanical_shrieker')

    // Soul Crystal: top Sculk Niter x1; bottom Soul Dust x4 + 250 mB Liquid Source; catalyst Activated Sculk Catalyst (10% consumption chance); heated
    catalysis('soul_crystal', {
        topIngredients: [item('kubejs:sculk_niter')],
        bottomIngredients: repeat(item('deeperdarker:soul_dust'), 4).concat([fluid('kubejs:liquid_source', 250)]),
        catalysts: [item('kubejs:activated_sculk_catalyst')],
        chances: 0.1,
        results: [{ id: 'deeperdarker:soul_crystal', count: 1 }],
        heatRequirement: 'heated'
    })

    // ================================================================ M8 Otherside fluid veins (otherside_fluid)
    // Otherside Slurry vein: only generates in Overcast Columns (biome tag in tags/sculk_acoustics.js); only the Resonant Drill works, with Gleam Lubricant as the drilling fluid
    event.recipes.createoreexcavation.vein('{"translate": "kubejs.vein.otherside_slurry", "fallback": "Otherside Slurry Vein"}', 'kubejs:otherside_slurry_bucket')
        .placement(64, 16, 246813579)
        .biomeWhitelist('kubejs:otherside_slurry_veins')
        .id('guguaddons:vein/otherside_slurry')
    event.recipes.createoreexcavation.extracting(Fluid.of('kubejs:otherside_slurry', 200), 'guguaddons:vein/otherside_slurry', 60)
        .fluid('50x kubejs:gleam_lubricant')
        .drill('kubejs:resonant_drill')
        .id('guguaddons:extracting/otherside_slurry')

    // Resonant Drill: mechanical crafting, narrowing from top to bottom; a Netherite Drill at the core; no durability, lasts forever once made
    event.recipes.create.mechanical_crafting('kubejs:resonant_drill', [
        'PPPPP',
        'CSDSC',
        ' CPC ',
        '  R  '
    ], {
        P: 'deeperdarker:resonarium_plate',
        C: 'kubejs:tempered_carapace',
        S: 'deeperdarker:soul_crystal',
        D: 'createoreexcavation:netherite_drill',
        R: 'deeperdarker:reinforced_echo_shard'
    }).id('guguaddons:mechanical_crafting/resonant_drill')

    // Gleam Lubricant: Gleam Gel x2 + 1000 mB Water -[heated mixing]-> 1000 mB
    event.recipes.create.mixing(Fluid.of('kubejs:gleam_lubricant', 1000), [
        'deeperdarker:gleam_gel', 'deeperdarker:gleam_gel', Fluid.of('minecraft:water', 1000)
    ]).heated().id('guguaddons:mixing/gleam_lubricant')

    // Echo Spirit: top Resonarium Ingot x1; bottom 1000 mB Otherside Slurry; catalyst Gleam Gel (25% consumption chance); superheated
    catalysis('echo_spirit', {
        topIngredients: [item('kubejs:resonarium_ingot')],
        bottomIngredients: [fluid('kubejs:otherside_slurry', 1000)],
        catalysts: [item('deeperdarker:gleam_gel')],
        chances: 0.25,
        results: [{ id: 'kubejs:echo_spirit', amount: 1000 }],
        heatRequirement: 'superheated'
    })
})
