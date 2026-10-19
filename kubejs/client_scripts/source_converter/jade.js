(() => {
    const cfg = global.SOURCE_CONVERTER
    const state = global.SOURCE_CONVERTER_CLIENT
    const $BlockAccessor = Java.loadClass('snownee.jade.api.BlockAccessor')
    const $Registries = Java.loadClass('net.minecraft.core.registries.BuiltInRegistries')
    const $JadeRegistration = Java.loadClass('snownee.jade.impl.WailaClientRegistration')
    const registration = $JadeRegistration.instance()

    // Jade 15.10.6 在收集 Provider 内容前调用；MBD2 21.1.2 仅在 duration 存在时绘制配方读条。
    // 修改的是客户端展示用 NBT，不改变服务器配方逻辑，也不影响其他机器。
    state.jadeFilter = accessor => {
        if (!(accessor instanceof $BlockAccessor) || String($Registries.BLOCK.getKey(accessor.getBlock())) !== cfg.MACHINE_ID) return true
        const data = accessor.getServerData()
        if (data.contains('recipe_logic', 10)) data.getCompound('recipe_logic').remove('duration')
        return true
    }
    state.jadeFailed = false

    if (!state.jadeRegistered) {
        registration.addBeforeTooltipCollectCallback((theme, accessor) => {
            if (state.jadeFailed) return true
            try {
                return state.jadeFilter(accessor)
            } catch (error) {
                state.jadeFailed = true
                console.error('[Source Converter] Jade 配方读条过滤失败，已停用至客户端脚本重新加载：' + String(error))
                return true
            }
        })
        // CallbackContainer.add 不会刷新排序列表；兼容客户端脚本在初始注册后才加载的情况。
        registration.beforeTooltipCollectCallback.sort()
        state.jadeRegistered = true
    }
})()
