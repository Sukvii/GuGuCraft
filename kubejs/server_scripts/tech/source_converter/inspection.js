(() => {
    const cfg = global.SOURCE_CONVERTER
    const $GogglesItem = Java.loadClass('com.simibubi.create.content.equipment.goggles.GogglesItem')
    const $MachineBlockEntity = Java.loadClass('com.lowdragmc.mbd2.common.blockentity.MachineBlockEntity')
    const $BlockPos = Java.loadClass('net.minecraft.core.BlockPos')
    const $CompoundTag = Java.loadClass('net.minecraft.nbt.CompoundTag')

    // Plain single-block MBD2 machines have no Create goggle interface, and their storage is not synced to the client by default.
    // Data is only sent to players looking at the machine while wearing goggles; no per-machine tick or constant broadcast is added.
    NetworkEvents.dataReceived(cfg.HUD_REQUEST, event => {
        const player = event.getEntity()
        if (player == null || !$GogglesItem.isWearingGoggles(player)) return
        // Entity.level() is hidden in KubeJS; use the EntityKJS accessor.
        const level = player.getLevel()
        const request = event.getData()
        // LevelKJS.getDimension() already returns a ResourceLocation.
        if (String(request.getString('dimension')) !== String(level.getDimension())) return
        const pos = new $BlockPos(request.getInt('x'), request.getInt('y'), request.getInt('z'))
        if (player.distanceToSqr(pos.getX() + 0.5, pos.getY() + 0.5, pos.getZ() + 0.5) > 64 || !level.hasChunkAt(pos)) return
        const blockEntity = level.getBlockEntity(pos)
        if (!(blockEntity instanceof $MachineBlockEntity)) return
        const machine = blockEntity.getMetaMachine()
        if (String(machine.getDefinition().id()) !== cfg.MACHINE_ID) return
        const sourceTrait = machine.getTraitByName(cfg.SOURCE_TRAIT)
        if (sourceTrait == null) return
        const storage = sourceTrait.getStorage()
        const response = new $CompoundTag()
        response.putString('dimension', request.getString('dimension'))
        response.putInt('x', pos.getX())
        response.putInt('y', pos.getY())
        response.putInt('z', pos.getZ())
        response.putInt('source', storage.getSource())
        response.putInt('source_capacity', storage.getSourceCapacity())
        player.sendData(cfg.HUD_RESPONSE, response)
    })
})()
