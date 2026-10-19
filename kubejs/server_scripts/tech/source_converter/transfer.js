(() => {
    const cfg = global.SOURCE_CONVERTER
    const $IO = Java.loadClass('com.lowdragmc.mbd2.api.capability.recipe.IO')
    const $Direction = Java.loadClass('net.minecraft.core.Direction')
    const $ParticleUtil = Java.loadClass('com.hollingsworth.arsnouveau.client.particle.ParticleUtil')
    const $ParticleColor = Java.loadClass('com.hollingsworth.arsnouveau.client.particle.ParticleColor')
    const color = $ParticleColor.defaultParticleColor()
    const sides = [$Direction.DOWN, $Direction.UP, $Direction.NORTH, $Direction.SOUTH, $Direction.WEST, $Direction.EAST]
    let particleFailed = false

    MBDMachineEvents.onTick(cfg.MACHINE_ID, event => {
        const machine = event.event.machine
        if (machine.isRemote()) return
        const source = machine.getTraitByName(cfg.SOURCE_TRAIT)
        if (source == null) return
        const autoIO = source.getRuntimeAutoIO()
        // onTick 在原生 trait.serverTick 前触发；接管调度，避免同一轮重复输出。
        // 传输本身仍调用 MBD2 handleAutoIO，沿用容量限制、能力缓存与原有侧面设置。
        if (autoIO.enable.get()) source.setAutoIOEnabled(false)
        if (machine.getOffsetTimer() % autoIO.intervalTicks() !== 0) return
        const storage = source.getStorage()
        if (storage.getSource() <= 0) return
        const level = machine.getLevel()
        const pos = machine.getPos()
        const front = machine.getFrontFacing().orElse($Direction.NORTH)

        sides.forEach(side => {
            if (!autoIO.getIO(front, side).support($IO.OUT) || storage.getSource() <= 0) return
            const before = storage.getSource()
            source.handleAutoIO(pos, side, $IO.OUT)
            if (storage.getSource() >= before || particleFailed) return
            // 与 Ars SourcelinkTile.tick 相同的追踪光球、默认颜色和客户端拖尾。
            // 原生工具会检查区块与附近玩家；仅成功输出时调用一次。
            try {
                $ParticleUtil.spawnFollowProjectile(level, pos, pos.relative(side), color)
            } catch (error) {
                // 视觉异常不能中断后续出口的魔源传输。
                particleFailed = true
                console.error('[SourceConverter] Ars transfer particles disabled until script reload: ' + error)
            }
        })
    })
})()
