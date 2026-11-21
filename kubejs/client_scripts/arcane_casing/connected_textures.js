(() => {
    const state = global.ARCANE_CASING_CLIENT
    const $RegisterAdditional = Java.loadClass('net.neoforged.neoforge.client.event.ModelEvent$RegisterAdditional')

    // KubeJS forbids loading lifecycle events under net.neoforged.fml.
    // RegisterAdditional fires when ModelBakery is constructed, before Create's ModifyBakingResult
    // and before TextureStitchEvent.Post after atlas upload, so model wrappers and SpriteShifts can be registered safely.
    NativeEvents.onEvent($RegisterAdditional, () => {
        if (state.connectedTexturesRegistered) return

        const $CreateClient = Java.loadClass('com.simibubi.create.CreateClient')
        const $AllCTTypes = Java.loadClass('com.simibubi.create.foundation.block.connected.AllCTTypes')
        const $CTSpriteShifter = Java.loadClass('com.simibubi.create.foundation.block.connected.CTSpriteShifter')
        const $CTModel = Java.loadClass('com.simibubi.create.foundation.block.connected.CTModel')
        const $EncasedCTBehaviour = Java.loadClass('com.simibubi.create.content.decoration.encasing.EncasedCTBehaviour')
        const $ResourceLocation = Java.loadClass('net.minecraft.resources.ResourceLocation')
        const $BuiltInRegistries = Java.loadClass('net.minecraft.core.registries.BuiltInRegistries')
        const blockId = $ResourceLocation.parse('kubejs:arcane_casing')
        const shift = $CTSpriteShifter.getCT(
            $AllCTTypes.OMNIDIRECTIONAL,
            $ResourceLocation.parse('kubejs:block/arcane_casing'),
            $ResourceLocation.parse('kubejs:block/arcane_casing_connected')
        )

        $CreateClient.MODEL_SWAPPER.getCustomBlockModels().register(
            blockId,
            model => new $CTModel(model, new $EncasedCTBehaviour(shift))
        )
        $CreateClient.CASING_CONNECTIVITY.makeCasing($BuiltInRegistries.BLOCK.get(blockId), shift)
        state.connectedTexturesRegistered = true
        console.info('[Arcane Casing] Registered native Create connected textures')
    })
})()
