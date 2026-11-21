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
        // onTick fires before the native trait.serverTick; take over scheduling so one round never outputs twice.
        // The transfer itself still calls MBD2 handleAutoIO, keeping the capacity limits, capability cache and existing side settings.
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
            // Same tracking orb, default color and client trail as Ars SourcelinkTile.tick.
            // The native utility checks chunks and nearby players; called once, only on successful output.
            try {
                $ParticleUtil.spawnFollowProjectile(level, pos, pos.relative(side), color)
            } catch (error) {
                // Visual errors must not interrupt the Source transfer of the remaining outputs.
                particleFailed = true
                console.error('[SourceConverter] Ars transfer particles disabled until script reload: ' + error)
            }
        })
    })
})()
