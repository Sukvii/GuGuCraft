ServerEvents.recipes(event => {
    event.recipes.ars_nouveau.imbuement(
        'theurgy:purified_gold',
        'kubejs:hallowed_gold_ingot',
        5000,
        [
            'mynethersdelight:golden_egg',
            'createaddition:electrum_block',
            'minecraft:resin_clump'
        ]
    ).id('guguaddons:ars_nouveau/imbuement/hallowed_gold_ingot')
})
