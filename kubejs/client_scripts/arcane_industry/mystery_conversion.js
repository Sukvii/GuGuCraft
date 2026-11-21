// Arcane Industry: show the two products of the Sculk Spreader in Create's "Mysterious Conversion" category, with only input and product, without revealing how
// - The Sculk Spreader recipe type is hidden in EMI (its products are blocks in the world, see startup_scripts/arcane_industry/sculk_spreader.js)
// - The Mysterious Conversion category of Create 6.0.10 only reads the static list MysteriousItemConversionCategory.RECIPES (not datapack recipes),
//   shown in EMI through TooManyRecipeViewers, so append to that list here
(() => {
    const CONVERSIONS = [
        ['minecraft:deepslate', 'minecraft:sculk'],
        ['kubejs:dormant_sculk_seal', 'kubejs:sculk_seal']
    ]

    // Client scripts run while mods are still being constructed, before items are registered; the class's static initializer creates Create items,
    // so loading it early fails and disables the whole category for this session. Hook in at asset generation instead (registration done, recipe viewers not loaded yet)
    ClientEvents.generateAssets('after_mods', () => {
        const $Category = Java.loadClass('com.simibubi.create.compat.jei.category.MysteriousItemConversionCategory')
        const $ConversionRecipe = Java.loadClass('com.simibubi.create.compat.jei.ConversionRecipe')
        const $BuiltInRegistries = Java.loadClass('net.minecraft.core.registries.BuiltInRegistries')

        // The list is static and F3+T reruns this script: deduplicate by product and skip conversions whose product is already there
        // (client scripts cannot assign to global, so no global flag)
        const existing = {}
        $Category.RECIPES.forEach(holder => {
            holder.value().getRollableResults().forEach(output => {
                existing[String($BuiltInRegistries.ITEM.getKey(output.getStack().getItem()))] = true
            })
        })

        CONVERSIONS.forEach(pair => {
            if (existing[pair[1]]) return
            $Category.RECIPES.add($ConversionRecipe.create(Item.of(pair[0]), Item.of(pair[1])))
        })
    })
})()
