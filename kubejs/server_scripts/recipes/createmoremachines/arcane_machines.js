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
        // 复用 Create 的右键装配：消耗一个奥术机壳，升级已放置的原版机器。
        event.recipes.create.item_application(`createmoremachines:brass_${machine}`, [
            `create:${machine}`,
            'kubejs:arcane_casing'
        ]).id(`guguaddons:item_application/arcane_${machine}`)
    })
})
