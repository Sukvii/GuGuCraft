(() => {
    const cfg = global.SOURCE_CONVERTER
    const $TooltipModifier = Java.loadClass('com.simibubi.create.foundation.item.TooltipModifier')
    const $Description = Java.loadClass('com.simibubi.create.foundation.item.ItemDescription$Modifier')
    const $Palette = Java.loadClass('net.createmod.catnip.lang.FontHelper$Palette')

    // Items are not registered yet when client scripts first load, so hook into Create's native tooltip registry at asset generation.
    ClientEvents.generateAssets('after_mods', () => {
        const item = Item.of(cfg.MACHINE_ID).getItem()
        // F3+T reruns asset generation; the Create registry does not allow registering twice.
        if ($TooltipModifier.REGISTRY.get(item) == null) {
            $TooltipModifier.REGISTRY.register(item, new $Description(item, $Palette.STANDARD_CREATE))
        }
    })
})()
