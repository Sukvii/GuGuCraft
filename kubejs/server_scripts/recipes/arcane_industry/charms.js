// Arcane Industry: summoning circle rituals (6 charms + the M12 Warden Seal). The ritual table is RITUALS in startup_scripts/arcane_industry/00_config.js,
// shared with the client Ponder scenes (client_scripts/arcane_industry/ponder_rituals.js)
// The structure is 5x5 on the center layer: Arcane Pedestals at the side midpoints (kept), corner blocks in the corners
// The 8 blocks around the spot below the center are Sourcestone; the spot right below the center is free (the Whirlisprig's Flowering Azalea can only sit on dirt-like blocks)
// Lychee location offsets are world coordinates; the structure is symmetric in all four directions, so facing does not matter
ServerEvents.recipes(event => {
    const arcane = global.ARCANE_INDUSTRY
    const PEDESTAL = 'ars_nouveau:arcane_pedestal'
    const PEDESTALS = [[2, 0], [-2, 0], [0, 2], [0, -2]]
    const CORNERS = [[2, 2], [2, -2], [-2, 2], [-2, -2]]
    const SOURCESTONE_RING = [[1, 1], [1, 0], [1, -1], [0, 1], [0, -1], [-1, 1], [-1, 0], [-1, -1]]

    const blockAt = (dx, dy, dz, block, nbt) => {
        const predicate = { blocks: block }
        if (nbt) predicate.nbt = nbt
        return {
            type: 'location',
            offsetX: dx,
            offsetY: dy,
            offsetZ: dz,
            predicate: { block: predicate }
        }
    }

    const effect = command => ({
        type: 'execute',
        command: `execute align xyz positioned ~0.5 ~0.5 ~0.5 run ${command}`,
        hide: true
    })

    const CHARM_EFFECTS = [
        effect('particle minecraft:soul_fire_flame ~ ~ ~ 2 0.3 2 0.02 120 force @a'),
        effect('particle minecraft:end_rod ~ ~0.5 ~ 0.2 0.6 0.2 0.05 40 force @a'),
        effect('playsound ars_nouveau:ea_finish block @a ~ ~ ~ 1')
    ]
    const WARDEN_EFFECTS = [
        effect('particle minecraft:sculk_soul ~ ~0.5 ~ 2 0.5 2 0.02 120 force @a'),
        effect('particle minecraft:sonic_boom ~ ~1 ~ 0 0 0 0 1 force @a'),
        effect('playsound minecraft:entity.warden.sonic_boom block @a ~ ~ ~ 1'),
        effect('playsound ars_nouveau:ea_finish block @a ~ ~ ~ 1')
    ]

    arcane.RITUALS.forEach(ritual => {
        const hands = ritual.hands || arcane.RITUAL_DEFAULT_HANDS
        // The creature in a Containment Jar is checked through the block entity NBT
        const cornerNbt = ritual.cornerEntity ? `{entityTag:{id:"${ritual.cornerEntity}"}}` : null

        let contextual = []
        if (ritual.ancientCity) {
            // The Ancient City check lives in a datapack predicate (data/kubejs/predicate/in_ancient_city.json):
            // recipes are synced to the client, which has no structure registry, so writing structures in the recipe fails to decode and disconnects on joining
            contextual.push({ type: 'execute', command: 'execute if predicate kubejs:in_ancient_city' })
        }
        contextual = contextual
            .concat(PEDESTALS.map(p => blockAt(p[0], 0, p[1], PEDESTAL)))
            .concat(CORNERS.map(c => blockAt(c[0], 0, c[1], ritual.corner, cornerNbt)))
            .concat(SOURCESTONE_RING.map(r => blockAt(r[0], -1, r[1], 'ars_nouveau:sourcestone')))

        const clearCorners = ritual.keepCorners ? [] : CORNERS.map(c => ({
            type: 'place',
            block: 'minecraft:air',
            offsetX: c[0],
            offsetZ: c[1]
        }))

        event.custom({
            type: 'lychee:block_interacting',
            // The second entry is the other hand
            item_in: hands.map(id => ({ item: id, count: 1 })),
            block_in: ritual.center,
            contextual: contextual,
            post: [{ type: 'place', block: 'minecraft:air' }].concat(
                clearCorners,
                [{ type: 'drop_item', id: ritual.result }],
                ritual.cornerEntity ? WARDEN_EFFECTS : CHARM_EFFECTS
            )
        }).id(`guguaddons:lychee/block_interacting/ritual/${ritual.id}`)
    })
})
