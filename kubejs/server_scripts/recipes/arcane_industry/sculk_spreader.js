// Arcane Industry M6: Sculk Spreader (stage sculk_spreader) and the "Sculk Harvest" parchment. Numbers are examples, pending testing
ServerEvents.recipes(event => {
    const cfg = global.ARCANE_INDUSTRY.SCULK_SPREADER

    // ---------------------------------------------------------------- Spreading (internal MBD2 recipe; tech/sculk_spreader.js controls start and output)
    event.recipes.mbd2.sculk_spreading()
        .inputSource(cfg.SOURCE_PER_BATCH)
        .inputItems(`${cfg.XP_PER_BATCH}x create:experience_nugget`)
        .duration(cfg.TICKS_PER_BATCH)
        .id(cfg.SPREAD_RECIPE_ID)

    // ---------------------------------------------------------------- M12 Sculk Seal: awakening (start conditions in tech/sculk_spreader.js)
    event.recipes.mbd2.sculk_spreading()
        .inputSource(cfg.AWAKEN_SOURCE)
        .inputItems('1x kubejs:dormant_sculk_seal')
        .outputItems('1x kubejs:sculk_seal')
        .duration(cfg.AWAKEN_TICKS)
        .id(cfg.AWAKEN_RECIPE_ID)

    // ---------------------------------------------------------------- Controller: mechanical crafting
    // The structure core (Activated Sculk Catalyst) is placed in the world, not used in the recipe; the recipe uses a plain Sculk Catalyst
    event.recipes.create.mechanical_crafting(cfg.MACHINE_ID, [
        ' K ',
        'TWT',
        'PBP',
        'TJT'
    ], {
        K: 'minecraft:sculk_catalyst',
        T: 'kubejs:tempered_carapace',
        W: 'deeperdarker:warden_carapace',
        P: 'create:precision_mechanism',
        B: 'create:brass_casing',
        J: 'ars_nouveau:source_jar'
    }).id('guguaddons:mechanical_crafting/sculk_spreader')

    // ---------------------------------------------------------------- "Sculk Harvest" parchment: Touch -> Break -> Extract
    // Paper -[sequenced assembly x2]-> Inscribed Draft -[bulk haunting]-> Resonant Draft -[imbuement 10000]-> pre-inscribed Spell Parchment
    const draftT = 'kubejs:incomplete_inscribed_draft'
    event.recipes.create.sequenced_assembly(['kubejs:inscribed_draft'], 'minecraft:paper', [
        event.recipes.create.filling(draftT, [draftT, Fluid.of('kubejs:liquid_source', 250)]),
        event.recipes.create.deploying(draftT, [draftT, 'kubejs:arcane_sheet']),
        event.recipes.create.deploying(draftT, [draftT, 'ars_nouveau:source_gem']),
        event.recipes.create.pressing(draftT, draftT)
    ]).transitionalItem(draftT).loops(2).id('guguaddons:sequenced_assembly/inscribed_draft')

    event.recipes.create.haunting('kubejs:resonant_draft', 'kubejs:inscribed_draft')
        .id('guguaddons:haunting/resonant_draft')

    // Build the spell component with Ars Nouveau's API instead of hand-writing the ars_nouveau:spell_caster encoding
    const $Spell = Java.loadClass('com.hollingsworth.arsnouveau.api.spell.Spell')
    const $SpellCaster = Java.loadClass('com.hollingsworth.arsnouveau.api.spell.SpellCaster')
    const $MethodTouch = Java.loadClass('com.hollingsworth.arsnouveau.common.spell.method.MethodTouch')
    const $EffectBreak = Java.loadClass('com.hollingsworth.arsnouveau.common.spell.effect.EffectBreak')
    const $AugmentExtract = Java.loadClass('com.hollingsworth.arsnouveau.common.spell.augment.AugmentExtract')
    // Spell.add has both single-argument and varargs overloads that Rhino cannot choose between, so spell out the signature; add / withName both return a new Spell
    const addPart = 'add(com.hollingsworth.arsnouveau.api.spell.AbstractSpellPart)'
    let spell = new $Spell()
    spell = spell[addPart]($MethodTouch.INSTANCE)
    spell = spell[addPart]($EffectBreak.INSTANCE)
    spell = spell[addPart]($AugmentExtract.INSTANCE)
    // The spell name is a plain string stored in the spell data (shown in the spell book once copied there), so it cannot be translated;
    // it stays in Chinese for the Chinese-speaking players of this pack. The parchment name itself is translatable (below)
    spell = spell.withName('幽匿收割')
    const parchment = Item.of('ars_nouveau:spell_parchment')
    new $SpellCaster().setSpell(spell).saveToStack(parchment)

    event.recipes.ars_nouveau.imbuement('kubejs:resonant_draft', parchment.withCustomName(Text.translatableWithFallback('item.kubejs.sculk_harvest_parchment', 'Sculk Harvest').italic(false)), 10000, [
        'kubejs:tempered_carapace',
        'kubejs:activated_sculk_catalyst',
        'minecraft:echo_shard'
    ]).id('guguaddons:ars_nouveau/imbuement/sculk_harvest_parchment')
})
