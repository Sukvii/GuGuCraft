// Arcane Industry M1: high-yield Liquid Source route (stage source_industry); numbers are examples, pending testing
// Flourishing Archwood Log -> centrifuging -> Archwood Sap + sawdust
// Archwood Sap + Sourceberries + sawdust -> bulk fermentation -> Source Mash -> distillation -> Dilute Liquid Source + ethanol
// Dilute Liquid Source + Mythril Solvent (the compressor's internal tank) -> vacuum processing -> Liquid Source
ServerEvents.recipes(event => {
    // GuGuAddons recipes use NeoForge's fluid ingredient format; Diesel-powered recipes keep the fluid_stack format of their bundled data
    const fluidIn = (fluid, amount) => ({ type: 'neoforge:single', fluid: fluid, amount: amount })
    const repeat = (ingredient, times) => {
        const list = []
        for (let i = 0; i < times; i++) {
            list.push(ingredient)
        }
        return list
    }

    // ---------------------------------------------------------------- Centrifuging (GuGuAddons Centrifuge, >= 128 RPM)
    event.custom({
        type: 'guguaddons:centrifugation',
        ingredients: repeat({ item: 'ars_nouveau:green_archwood_log' }, 4),
        results: [
            { id: 'kubejs:archwood_sap', amount: 1000 },
            { id: 'createdieselgenerators:wood_chip', count: 4 },
            { id: 'createdieselgenerators:wood_chip', count: 2, chance: 0.5 }
        ],
        processing_time: 200,
        minimalRPM: 128
    }).id('guguaddons:centrifugation/archwood_sap')

    // ---------------------------------------------------------------- Bulk fermentation (Diesel-powered large fermentation tank, heat from the burner below)
    event.custom({
        type: 'createdieselgenerators:bulk_fermenting',
        ingredients: [{ type: 'fluid_stack', fluid: 'kubejs:archwood_sap', amount: 1000 }]
            .concat(repeat({ item: 'ars_nouveau:sourceberry_bush' }, 4))
            .concat(repeat({ item: 'createdieselgenerators:wood_chip' }, 2)),
        heat_requirement: 'heated',
        processing_time: 600,
        results: [{ id: 'kubejs:source_mash', amount: 1000 }]
    }).id('guguaddons:bulk_fermenting/source_mash')

    // ---------------------------------------------------------------- Distillation (the 1st product goes to the 1st level up from the bottom)
    const distill = (name, heat, time, dilute, ethanol) => {
        event.custom({
            type: 'createdieselgenerators:distillation',
            ingredients: [{ type: 'fluid_stack', fluid: 'kubejs:source_mash', amount: 100 }],
            heat_requirement: heat,
            processing_time: time,
            results: [
                { id: 'kubejs:dilute_liquid_source', amount: dilute },
                { id: 'createdieselgenerators:ethanol', amount: ethanol }
            ]
        }).id(`guguaddons:distillation/${name}`)
    }
    distill('source_mash', 'heated', 60, 60, 30)
    distill('superheated_source_mash', 'superheated', 40, 90, 45)

    // ---------------------------------------------------------------- Vacuum processing (GuGuAddons Compressor; the Mythril Solvent is read from the machine's internal tank)
    const vacuum = (name, heat, output) => {
        event.custom({
            type: 'guguaddons:vacuumizing',
            ingredients: [
                fluidIn('kubejs:dilute_liquid_source', 200),
                fluidIn('kubejs:mythril_solvent', 2)
            ],
            results: [{ id: 'kubejs:liquid_source', amount: output }],
            heat_requirement: heat,
            allowSuperheated: heat === 'superheated',
            processing_time: 100,
            // The 2nd fluid input (index 1) is read from the internal tank
            secondaryFluidInput: 1
        }).id(`guguaddons:vacuumizing/${name}`)
    }
    vacuum('liquid_source', 'heated', 150)
    vacuum('superheated_liquid_source', 'superheated', 225)

    // ---------------------------------------------------------------- Machine: sequenced assembly, replacing the Centrifuge's original crafting recipe
    event.remove({ id: 'guguaddons:centrifuge' })

    const centrifugeT = 'kubejs:incomplete_centrifuge'
    event.recipes.create.sequenced_assembly(['guguaddons:centrifuge'], 'create:mechanical_mixer', [
        event.recipes.create.deploying(centrifugeT, [centrifugeT, 'create:large_cogwheel']),
        event.recipes.create.deploying(centrifugeT, [centrifugeT, 'kubejs:mythril_ingot']),
        event.recipes.create.deploying(centrifugeT, [centrifugeT, 'create:precision_mechanism']),
        event.recipes.create.pressing(centrifugeT, centrifugeT)
    ]).transitionalItem(centrifugeT).loops(1).id('guguaddons:sequenced_assembly/centrifuge')

    const vacuumT = 'kubejs:incomplete_vacuum_chamber'
    event.recipes.create.sequenced_assembly(['guguaddons:vacuum_chamber'], 'create:mechanical_press', [
        event.recipes.create.deploying(vacuumT, [vacuumT, 'create:fluid_tank']),
        event.recipes.create.deploying(vacuumT, [vacuumT, 'kubejs:mythril_ingot']),
        event.recipes.create.filling(vacuumT, [vacuumT, Fluid.of('kubejs:mythril_solvent', 250)]),
        event.recipes.create.pressing(vacuumT, vacuumT)
    ]).transitionalItem(vacuumT).loops(1).id('guguaddons:sequenced_assembly/vacuum_chamber')
})
