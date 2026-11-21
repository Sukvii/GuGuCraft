// M6 Sculk Spreader: Create-style item tooltip; the name and tooltip texts are in kubejs/assets/guguaddons/lang (same approach as client_scripts/source_converter)
(() => {
    const cfg = global.ARCANE_INDUSTRY.SCULK_SPREADER
    const $TooltipModifier = Java.loadClass('com.simibubi.create.foundation.item.TooltipModifier')
    const $Description = Java.loadClass('com.simibubi.create.foundation.item.ItemDescription$Modifier')
    const $Palette = Java.loadClass('net.createmod.catnip.lang.FontHelper$Palette')

    // Items are not registered yet when client scripts first load, so hook into Create's tooltip registry at asset generation; F3+T reruns it, so never register twice
    ClientEvents.generateAssets('after_mods', () => {
        const item = Item.of(cfg.MACHINE_ID).getItem()
        if ($TooltipModifier.REGISTRY.get(item) == null) {
            $TooltipModifier.REGISTRY.register(item, new $Description(item, $Palette.STANDARD_CREATE))
        }
    })
})()
