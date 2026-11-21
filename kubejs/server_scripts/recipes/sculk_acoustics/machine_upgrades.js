// Sculk Acoustics side quests: upgrades for the Source Converter / Sculk Spreader (numbers are examples, pending testing; right-click upgrading in server_scripts/sculk_acoustics/machine_upgrades.js)
ServerEvents.recipes(event => {
    // Source Converter Upgrade (below M3): Arcane Sheet -[sequenced assembly x2]-> deploy Source Gem Block -> deploy Soul Dust -> fill 500 mB Liquid Source -> press
    const sc = 'kubejs:incomplete_source_converter_upgrade'
    event.recipes.create.sequenced_assembly(['kubejs:source_converter_upgrade'], 'kubejs:arcane_sheet', [
        event.recipes.create.deploying(sc, [sc, 'ars_nouveau:source_gem_block']),
        event.recipes.create.deploying(sc, [sc, 'deeperdarker:soul_dust']),
        event.recipes.create.filling(sc, [sc, Fluid.of('kubejs:liquid_source', 500)]),
        event.recipes.create.pressing(sc, sc)
    ]).transitionalItem(sc).loops(2).id('guguaddons:sequenced_assembly/source_converter_upgrade')

    // Sculk Spreader Upgrade (below M6): Resonarium Plate -[sequenced assembly x2]-> deploy Activated Sculk Catalyst -> deploy Gleam Gel -> deploy Sculk Niter -> press
    const ss = 'kubejs:incomplete_sculk_spreader_upgrade'
    event.recipes.create.sequenced_assembly(['kubejs:sculk_spreader_upgrade'], 'deeperdarker:resonarium_plate', [
        event.recipes.create.deploying(ss, [ss, 'kubejs:activated_sculk_catalyst']),
        event.recipes.create.deploying(ss, [ss, 'deeperdarker:gleam_gel']),
        event.recipes.create.deploying(ss, [ss, 'kubejs:sculk_niter']),
        event.recipes.create.pressing(ss, ss)
    ]).transitionalItem(ss).loops(2).id('guguaddons:sequenced_assembly/sculk_spreader_upgrade')
})
