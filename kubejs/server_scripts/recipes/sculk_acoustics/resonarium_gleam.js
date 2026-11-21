// Sculk Acoustics M4 Resonarium / M5 Gleam Gel (stage locks in stages/sculk_acoustics.js; numbers are examples, pending testing)
// The Resonarium source (Drygmies in Blooming Caverns + the smallest Sludges) is restricted by loot table: data/deeperdarker/loot_table/entities/sludge.json
ServerEvents.recipes(event => {
    // M4 Refining: Resonarium x4 + Sculk Salt x2 + 250 mB Liquid Source -[heated mixing]-> Resonarium Ingot -[pressing]-> Resonarium Plate
    // The original recipe "Resonarium x4 + Scute x4" cannot be mass-produced, so it is removed
    event.remove({ id: 'deeperdarker:resonarium_plate' })
    event.recipes.create.mixing('kubejs:resonarium_ingot', [
        'deeperdarker:resonarium', 'deeperdarker:resonarium', 'deeperdarker:resonarium', 'deeperdarker:resonarium',
        'kubejs:sculk_salt', 'kubejs:sculk_salt',
        Fluid.of('kubejs:liquid_source', 250)
    ]).heated().id('guguaddons:mixing/resonarium_ingot')
    event.recipes.create.pressing('deeperdarker:resonarium_plate', 'kubejs:resonarium_ingot')
        .id('guguaddons:pressing/resonarium_plate')

    // M5 Cultivation: filling 250 mB Liquid Source onto a Sculk Gleam -> Porous Sculk Gleam (it only grows in the Otherside, see sculk_acoustics/gleam_growth.js)
    event.recipes.create.filling('deeperdarker:porous_sculk_gleam', [
        'deeperdarker:sculk_gleam', Fluid.of('kubejs:liquid_source', 250)
    ]).id('guguaddons:filling/porous_sculk_gleam')
})
