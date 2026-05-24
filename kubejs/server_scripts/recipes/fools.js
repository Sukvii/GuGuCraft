function isFoolsPeriodNow() {
    const now = new Date()
    return now.getMonth() === 3 && now.getDate() >= 1 && now.getDate() <= 7
}

ServerEvents.recipes(event => {
    if (!isFoolsPeriodNow()) {
        return
    }

    const transitional = 'kubejs:incomplete_oula_ingot'

    event.recipes.create.sequenced_assembly([
        'kubejs:oula_ingot',
    ], 'minecraft:cobblestone', [
        event.recipes.create.deploying(transitional, [transitional, 'minecraft:cobblestone']),
        event.recipes.create.deploying(transitional, [transitional, 'minecraft:white_concrete']),
        event.recipes.create.deploying(transitional, [transitional, 'minecraft:cobblestone']),
        event.recipes.create.deploying(transitional, [transitional, 'minecraft:white_concrete']),
        event.recipes.create.deploying(transitional, [transitional, 'minecraft:cobblestone']),
        event.recipes.create.deploying(transitional, [transitional, 'minecraft:white_concrete']),
        event.recipes.create.deploying(transitional, [transitional, 'minecraft:cobblestone']),
        event.recipes.create.deploying(transitional, [transitional, 'minecraft:white_concrete']),
        event.recipes.create.deploying(transitional, [transitional, 'minecraft:cobblestone']),
        event.recipes.create.deploying(transitional, [transitional, 'minecraft:white_concrete']),
        event.recipes.create.deploying(transitional, [transitional, 'minecraft:cobblestone']),
        event.recipes.create.deploying(transitional, [transitional, 'minecraft:white_concrete']),
        event.recipes.create.deploying(transitional, [transitional, 'minecraft:cobblestone']),
        event.recipes.create.deploying(transitional, [transitional, 'minecraft:white_concrete']),
        event.recipes.create.deploying(transitional, [transitional, 'minecraft:cobblestone']),
        event.recipes.create.deploying(transitional, [transitional, 'minecraft:white_concrete']),
        event.recipes.create.deploying(transitional, [transitional, 'minecraft:cobblestone']),
        event.recipes.create.deploying(transitional, [transitional, 'minecraft:white_concrete'])
    ]).transitionalItem(transitional).loops(1024).id('kubejs:sequenced_assembly/oula_ingot')
})
