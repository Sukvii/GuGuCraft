// Sculk Acoustics side quests "Source Converter Upgrade" (below M3) / "Sculk Spreader Upgrade" (below M6): right-click a placed machine with the upgrade in hand
// The upgrade is consumed (not in creative) and level 2 is stored in the machine custom data; fluid, Source and the current batch are kept, and the block is not replaced
// The level 2 effects are read by level in tech/source_converter/logic.js and tech/sculk_spreader.js
(() => {
    const acoustics = global.SCULK_ACOUSTICS
    const $MachineBlockEntity = Java.loadClass('com.lowdragmc.mbd2.common.blockentity.MachineBlockEntity')
    const $InteractionHand = Java.loadClass('net.minecraft.world.InteractionHand')
    const $SoundEvents = Java.loadClass('net.minecraft.sounds.SoundEvents')
    const $SoundSource = Java.loadClass('net.minecraft.sounds.SoundSource')
    const $ParticleTypes = Java.loadClass('net.minecraft.core.particles.ParticleTypes')
    const PLAY_SOUND = 'playSound(net.minecraft.world.entity.player.Player,net.minecraft.core.BlockPos,net.minecraft.sounds.SoundEvent,net.minecraft.sounds.SoundSource,float,float)'

    const UPGRADES = [
        {
            machineId: global.SOURCE_CONVERTER.MACHINE_ID,
            cfg: acoustics.SOURCE_CONVERTER_MK2,
            // The runtime tank capacity override is saved with the machine (MBD2 FluidTankCapabilityTrait.capacity)
            apply: machine => {
                const trait = machine.getTraitByName(global.SOURCE_CONVERTER.FLUID_TRAIT)
                if (trait != null) trait.capacity.setValue(global.SOURCE_CONVERTER.TANK_CAPACITY * acoustics.SOURCE_CONVERTER_MK2.MULTIPLIER)
            }
        },
        {
            machineId: global.ARCANE_INDUSTRY.SCULK_SPREADER.MACHINE_ID,
            cfg: acoustics.SCULK_SPREADER_MK2,
            apply: () => {}
        }
    ]

    // Machine name from its block translation key (the texts are in kubejs/assets/guguaddons/lang)
    const machineName = upgrade => Text.translatable(`block.${upgrade.machineId.replace(':', '.')}`)

    UPGRADES.forEach(upgrade => {
        BlockEvents.rightClicked(upgrade.machineId, event => {
            if (event.hand !== $InteractionHand.MAIN_HAND) return
            const stack = event.item
            if (stack.isEmpty() || String(stack.getId()) !== upgrade.cfg.UPGRADE_ITEM) return
            const player = event.player
            const level = event.level
            const pos = event.block.getPos()
            const blockEntity = level.getBlockEntity(pos)
            if (!(blockEntity instanceof $MachineBlockEntity)) return
            const machine = blockEntity.getMetaMachine()
            const data = machine.getCustomData()
            // Cancel whether or not the upgrade succeeds, so the upgrade item never triggers the block's other interactions
            event.cancel()
            if (data.getInt(upgrade.cfg.LEVEL_KEY) >= 2) {
                player.displayClientMessage(Text.translatableWithFallback('message.kubejs.machine_upgrade.already_max', 'This %s is already level 2.', machineName(upgrade)), true)
                return
            }
            data.putInt(upgrade.cfg.LEVEL_KEY, 2)
            upgrade.apply(machine)
            // The next batch re-modifies the recipe at the new level
            const logic = machine.getRecipeLogic()
            if (logic.isIdle()) logic.markLastRecipeDirty()
            machine.markDirty()
            if (!player.isCreative()) stack.shrink(1)
            level[PLAY_SOUND](null, pos, $SoundEvents.SMITHING_TABLE_USE, $SoundSource.BLOCKS, 1.0, 1.0)
            level.sendParticles($ParticleTypes.ENCHANT, pos.getX() + 0.5, pos.getY() + 1.0, pos.getZ() + 0.5, 40, 0.3, 0.3, 0.3, 0.5)
            player.displayClientMessage(Text.translatableWithFallback('message.kubejs.machine_upgrade.done', '%s upgraded to level 2.', machineName(upgrade)), true)
        })
    })
})()
