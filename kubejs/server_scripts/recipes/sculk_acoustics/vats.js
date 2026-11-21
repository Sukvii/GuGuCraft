// Sculk Acoustics M6 Echo fermentation / M9 Digestion: obtaining and recipes of the Theurgy Fermentation Vat and Digestion Vat (numbers are examples, pending testing)
// compat/theurgy.js removes every Theurgy recipe; Theurgy recipe types cannot be locked, so Lychee conversion (by player) and item locks on the machines gate them (stages/sculk_acoustics.js)
ServerEvents.recipes(event => {
    const FRAME = 'kubejs:alchemical_frame'

    // Right-click an Alchemical Frame with the material in the main hand -> remove the frame and drop the finished vat (both vats have a facing and close their lid on redstone from the back, so the player places them)
    const convertToItem = (name, key, itemOut) => event.custom({
        type: 'lychee:block_interacting',
        item_in: { item: key, count: 1 },
        block_in: FRAME,
        post: [
            { type: 'place', block: 'minecraft:air' },
            { type: 'drop_item', id: itemOut },
            {
                type: 'execute',
                command: `execute align xyz positioned ~0.5 ~0.5 ~0.5 run particle minecraft:block{block_state:"${FRAME}"} ~ ~ ~ 0.35 0.35 0.35 0.05 80 force @a`,
                hide: true
            },
            {
                type: 'execute',
                command: 'execute align xyz positioned ~0.5 ~0.5 ~0.5 run particle minecraft:sculk_soul ~ ~ ~ 0.2 0.2 0.2 0.03 20 force @a',
                hide: true
            },
            {
                type: 'execute',
                command: 'execute align xyz positioned ~0.5 ~0.5 ~0.5 run playsound ars_nouveau:ea_finish block @a ~ ~ ~ 1',
                hide: true
            }
        ]
    }).id(`guguaddons:lychee/block_interacting/${name}`)

    // ---------------------------------------------------------------- M6 Fermentation
    convertToItem('fermentation_vat', 'kubejs:sculk_sulfur', 'theurgy:fermentation_vat')
    // Sculk Sulfur + Echo Log + 125 mB Water -> Sculk Niter, 200 ticks (same numbers and form as Theurgy's original fermentation)
    event.custom({
        type: 'theurgy:fermentation',
        category: 'misc',
        fluid: { amount: 125, ingredient: { fluid: 'minecraft:water' } },
        ingredients: [{ item: 'kubejs:sculk_sulfur' }, { tag: 'deeperdarker:echo_logs' }],
        result: { type: 'theurgy:item', count: 1, id: 'kubejs:sculk_niter' },
        time: 200
    }).id('guguaddons:theurgy/fermentation/sculk_niter')

    // ---------------------------------------------------------------- M9 Digestion
    convertToItem('digestion_vat', 'kubejs:sculk_niter', 'theurgy:digestion_vat')
    // Sculk Niter x1 + 15 mB Echo Spirit -> Sculk Niter Powder x4, 200 ticks
    event.custom({
        type: 'theurgy:digestion',
        category: 'misc',
        fluid: { amount: 15, ingredient: { fluid: 'kubejs:echo_spirit' } },
        ingredients: [{ count: 1, ingredient: { item: 'kubejs:sculk_niter' } }],
        result: { type: 'theurgy:item', count: 4, id: 'kubejs:sculk_niter_powder' },
        time: 200
    }).id('guguaddons:theurgy/digestion/sculk_niter_powder')
})
