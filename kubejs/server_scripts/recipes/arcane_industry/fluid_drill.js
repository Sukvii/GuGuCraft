// Arcane Industry optional node in the M11 column / F3: Fluid Drill (stage fluid_drill)
// Vertical shaft pattern, top to bottom: wellhead -> control -> shaft -> drill head. The original COE recipe is removed by compat/coe.js
ServerEvents.recipes(event => {
    event.recipes.create.mechanical_crafting('createoreexcavation:extractor', [
        'PATAP',
        'AMHMA',
        ' CSC ',
        ' CQC ',
        ' CRC ',
        '  D  '
    ], {
        P: 'create:mechanical_pump',
        T: 'create:fluid_tank',
        A: 'kubejs:arcane_sheet',
        M: 'kubejs:arcane_mechanism',
        H: 'create:hose_pulley',
        C: 'kubejs:tempered_carapace',
        S: 'minecraft:sculk_sensor',
        Q: 'theurgy:mercury_shard',
        R: 'deeperdarker:reinforced_echo_shard',
        D: 'create:mechanical_drill'
    }).id('guguaddons:mechanical_crafting/extractor')
})
