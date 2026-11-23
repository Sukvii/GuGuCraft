// Sculk Acoustics M10: Warden Resonance Chamber (numbers are examples, pending testing; runtime logic in server_scripts/tech/warden_chamber.js)
ServerEvents.recipes(event => {
    const cfg = global.SCULK_ACOUSTICS.WARDEN_CHAMBER

    // Low band (redstone signal 1-7) -> Warden Carapace; high band (8-15) -> Resonance Nucleus
    // Per batch Sculk Niter Powder x4 + 2000 Source + 4096 stress (kinetic input at least 64 RPM); the yield scales with agitation, voiding and cooldown are handled by the script
    const band = (id, signal, output) => event.recipes.mbd2.warden_resonance()
        .inputItems(`${cfg.POWDER_PER_BATCH}x ${cfg.POWDER}`)
        .inputSource(cfg.SOURCE_PER_BATCH)
        .inputStress(cfg.STRESS)
        .outputItems(`1x ${output}`)
        .dimension(global.SCULK_ACOUSTICS.DIMENSION)
        .redstoneSignal(signal[0], signal[1])
        .duration(cfg.TICKS_PER_BATCH)
        .id(id)
    band(cfg.LOW_RECIPE_ID, cfg.LOW_SIGNAL, cfg.LOW_OUTPUT)
    band(cfg.HIGH_RECIPE_ID, cfg.HIGH_SIGNAL, cfg.HIGH_OUTPUT)

    // Controller: mechanical crafting (Resonarium Plate, Soundproof Glass, Soul Crystal, Sculk Shrieker, Reinforced Echo Shard, Arcane Casing; the pattern is an example)
    event.recipes.create.mechanical_crafting(cfg.MACHINE_ID, [
        'PGGGP',
        'SYRYS',
        'PAAAP'
    ], {
        P: 'deeperdarker:resonarium_plate',
        G: 'deeperdarker:soundproof_glass',
        S: 'deeperdarker:soul_crystal',
        Y: 'minecraft:sculk_shrieker',
        R: 'deeperdarker:reinforced_echo_shard',
        A: 'kubejs:arcane_casing'
    }).id('guguaddons:mechanical_crafting/warden_resonance_chamber')

    // Resonance Chamber Kinetic Input: Arcane Casing + Shaft + Resonarium Plate
    event.shapeless(cfg.KINETIC_INPUT_ID, ['kubejs:arcane_casing', 'create:shaft', 'deeperdarker:resonarium_plate'])
        .id('guguaddons:crafting/warden_resonance_kinetic_input')
})
