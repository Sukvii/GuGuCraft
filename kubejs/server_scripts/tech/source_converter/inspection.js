(() => {
    const cfg = global.SOURCE_CONVERTER
    const $GogglesItem = Java.loadClass('com.simibubi.create.content.equipment.goggles.GogglesItem')
    const $MachineBlockEntity = Java.loadClass('com.lowdragmc.mbd2.common.blockentity.MachineBlockEntity')
    const $BlockPos = Java.loadClass('net.minecraft.core.BlockPos')
    const $CompoundTag = Java.loadClass('net.minecraft.nbt.CompoundTag')

    // 普通单方块 MBD2 机器没有 Create 的护目镜接口，存量也不默认同步到客户端。
    // 仅向正在查看且戴有护目镜的玩家回复数据，不为每台机器添加 tick 或持续广播。
    NetworkEvents.dataReceived(cfg.HUD_REQUEST, event => {
        const player = event.getEntity()
        if (player == null || !$GogglesItem.isWearingGoggles(player)) return
        // Entity.level() 在 KubeJS 中隐藏，使用 EntityKJS 的访问器。
        const level = player.getLevel()
        const request = event.getData()
        // LevelKJS.getDimension() 已经返回 ResourceLocation。
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
