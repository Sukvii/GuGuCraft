(() => {
    const cfg = global.SOURCE_CONVERTER
    const state = global.SOURCE_CONVERTER_CLIENT
    const $BlockAccessor = Java.loadClass('snownee.jade.api.BlockAccessor')
    const $Registries = Java.loadClass('net.minecraft.core.registries.BuiltInRegistries')
    const $JadeRegistration = Java.loadClass('snownee.jade.impl.WailaClientRegistration')
    const registration = $JadeRegistration.instance()

    // Called by Jade 15.10.6 before collecting provider content; MBD2 21.1.2 only draws the recipe progress bar when a duration exists.
    // Only the client-side display NBT is changed; server recipe logic and other machines are unaffected.
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
                console.error('[Source Converter] Jade recipe progress filter failed; disabled until client scripts reload: ' + String(error))
                return true
            }
        })
        // CallbackContainer.add does not refresh the sorted list; also covers client scripts loading after the initial registration.
        registration.beforeTooltipCollectCallback.sort()
        state.jadeRegistered = true
    }
})()
