(() => {
    const cfg = global.SOURCE_CONVERTER
    const $TooltipModifier = Java.loadClass('com.simibubi.create.foundation.item.TooltipModifier')
    const $Description = Java.loadClass('com.simibubi.create.foundation.item.ItemDescription$Modifier')
    const $Palette = Java.loadClass('net.createmod.catnip.lang.FontHelper$Palette')

    // 客户端脚本首次加载时物品尚未注册，等资源生成阶段再接入 Create 的原生提示注册表。
    ClientEvents.generateAssets('after_mods', () => {
        const item = Item.of(cfg.MACHINE_ID).getItem()
        // F3+T 会重跑资源生成；Create 注册表不允许重复注册。
        if ($TooltipModifier.REGISTRY.get(item) == null) {
            $TooltipModifier.REGISTRY.register(item, new $Description(item, $Palette.STANDARD_CREATE))
        }
    })
})()
