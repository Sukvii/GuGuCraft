// Sculk Acoustics side quest "Next Machine Tier" below M4 (stage resonant_machines, locks in stages/sculk_acoustics.js)
// The CMM netherite tier is renamed "Resonant" (kubejs/assets/createmoremachines/lang); machines must reach the Arcane (brass) tier first
ServerEvents.recipes(event => {
    const machines = [
        'basin',
        'crushing_wheel',
        'deployer',
        'depot',
        'encased_fan',
        'mechanical_mixer',
        'mechanical_press',
        'mechanical_saw',
        'spout'
    ]

    machines.forEach(machine => {
        // Reuses Create's right-click assembly: consumes one Resonant Casing to upgrade a placed Arcane machine to a Resonant machine
        event.recipes.create.item_application(`createmoremachines:netherite_${machine}`, [
            `createmoremachines:brass_${machine}`,
            'kubejs:resonant_casing'
        ]).id(`guguaddons:item_application/resonant_${machine}`)
    })

    // Resonant Casing: Arcane Casing -[sequenced assembly x2]-> deploy Stripped Echo Log -> deploy Resonarium Plate -> deploy Soul Dust -> fill 250 mB Liquid Source -> press
    const t = 'kubejs:incomplete_resonant_casing'
    event.recipes.create.sequenced_assembly(['kubejs:resonant_casing'], 'kubejs:arcane_casing', [
        event.recipes.create.deploying(t, [t, 'deeperdarker:stripped_echo_log']),
        event.recipes.create.deploying(t, [t, 'deeperdarker:resonarium_plate']),
        event.recipes.create.deploying(t, [t, 'deeperdarker:soul_dust']),
        event.recipes.create.filling(t, [t, Fluid.of('kubejs:liquid_source', 250)]),
        event.recipes.create.pressing(t, t)
    ]).transitionalItem(t).loops(2).id('guguaddons:sequenced_assembly/resonant_casing')
})
