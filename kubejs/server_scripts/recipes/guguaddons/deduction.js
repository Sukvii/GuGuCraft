ServerEvents.recipes(event => {
    const transitional_deduction = 'kubejs:incomplete_deduction_casing'

    event.remove({ output: 'touhou_little_maid:wireless_io' })

    event.recipes.create.mechanical_crafting('touhou_little_maid:wireless_io', [
        ' AB',
        'ACA',
        'BA '
    ], {
        A: 'create:sturdy_sheet',
        B: 'minecraft:netherite_ingot',
        C: 'minecraft:ender_pearl'
    }).id('kubejs:mechanical_crafting/wireless_io')
    
    event.recipes.create.mechanical_crafting('guguaddons:quest_interface', [
            'AABAA',
            'ACDCA',
            'EDFDE',
            'AGGGA',
            'AAHAA'
        ], {
            A:'create:sturdy_sheet',
            B:'functionalstorage:compacting_drawer',
            C:'createdieselgenerators:engine_piston',
            D:'kubejs:kinetic_mechanism',
            E:'create:cogwheel',
            F:'create:display_board',
            G:'createaddition:gold_wire',
            H:'touhou_little_maid:wireless_io'
    })
    
    event.recipes.create.sequenced_assembly([
        'guguaddons:deduction_casing',
    ], 'create:sturdy_sheet', [
        event.recipes.create.cutting(transitional_deduction, transitional_deduction),
        event.recipes.create.pressing(transitional_deduction, transitional_deduction),
        event.recipes.create.deploying(transitional_deduction, [transitional_deduction, 'kubejs:kinetic_mechanism']),
        event.recipes.create.deploying(transitional_deduction, [transitional_deduction, 'touhou_little_maid:wireless_io']),
        event.recipes.create.deploying(transitional_deduction, [transitional_deduction, 'create:sturdy_sheet'])
    ]).transitionalItem(transitional_deduction).loops(3).id('kubejs:sequenced_assembly/deduction_casing')

    event.shapeless('guguaddons:quest_submission',['guguaddons:deduction_casing','#c:chests']).id('kubejs:crafting/quest_submission')
    event.shapeless('guguaddons:quest_input',['guguaddons:deduction_casing','create:shaft']).id('kubejs:crafting/quest_input')
})
