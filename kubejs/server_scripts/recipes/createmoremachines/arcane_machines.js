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
        // Reuses Create's right-click assembly: consumes one Arcane Casing to upgrade a placed vanilla machine.
        event.recipes.create.item_application(`createmoremachines:brass_${machine}`, [
            `create:${machine}`,
            'kubejs:arcane_casing'
        ]).id(`guguaddons:item_application/arcane_${machine}`)
    })
})
