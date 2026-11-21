(() => {
    const cfg = global.SOURCE_CONVERTER
    const $Brazier = Java.loadClass('com.klikli_dev.theurgy.content.apparatus.pyromanticbrazier.PyromanticBrazierBlockEntity')
    const $ContentModifier = Java.loadClass('com.lowdragmc.mbd2.api.recipe.content.ContentModifier')
    const $IO = Java.loadClass('com.lowdragmc.mbd2.api.capability.recipe.IO')
    // Sculk Acoustics side quest "Source Converter Upgrade": at level 2, input, output, full-yield range and tank capacity per batch are all x MULTIPLIER
    const mk2 = global.SCULK_ACOUSTICS.SOURCE_CONVERTER_MK2
    const multiplierOf = machine => machine.getCustomData().getInt(mk2.LEVEL_KEY) >= 2 ? mk2.MULTIPLIER : 1

    function isHeated(machine) {
        const level = machine.getLevel()
        if (level == null) return false
        const below = machine.getPos().below()
        if (!level.hasChunkAt(below)) return false
        const brazier = level.getBlockEntity(below)
        // Read the actual Theurgy burn timer instead of treating "has fuel" as burning.
        return brazier instanceof $Brazier && brazier.isLit()
    }

    function getEfficiency(machine, multiplier) {
        const trait = machine.getTraitByName(cfg.FLUID_TRAIT)
        const tank = trait == null ? null : trait.storages[0]
        if (tank == null || tank.getCapacity() <= 0) return 0
        const amount = tank.getFluidAmount()
        if (amount < cfg.FLUID_PER_BATCH * multiplier) return 0
        // Sampled from the absolute fluid amount at batch start, before ingredients are taken; the range includes both ends and no longer demands exactly half full.
        return amount >= cfg.OPTIMAL_FLUID_MIN * multiplier && amount <= cfg.OPTIMAL_FLUID_MAX * multiplier
            ? 1 : cfg.OFF_RANGE_EFFICIENCY
    }

    // The level 2 tank capacity is a runtime override of the machine's tank trait (saved with the machine); verify it again on load
    function syncTankCapacity(machine) {
        const trait = machine.getTraitByName(cfg.FLUID_TRAIT)
        if (trait == null) return
        const target = cfg.TANK_CAPACITY * multiplierOf(machine)
        if (Number(trait.capacity.get()) !== target) trait.capacity.setValue(target)
    }

    MBDMachineEvents.onLoad(cfg.MACHINE_ID, event => {
        const machine = event.event.machine
        if (machine.isRemote()) return
        const logic = machine.getRecipeLogic()
        const recipe = logic.getLastRecipe()
        const data = machine.getCustomData()
        // Migrates old periodic batches, per-tick conditions, and original recipes cached by accident after earlier sampling errors.
        // This machine only takes ingredients on finish, so the migration never swallows fluid already inserted.
        if (recipe != null && String(recipe.id) === cfg.CONVERSION_RECIPE_ID &&
            (recipe.duration !== cfg.TICKS_PER_BATCH || !recipe.conditions.isEmpty() || !data.getBoolean(cfg.SAMPLED_KEY))) {
            logic.resetRecipeLogic()
        }
        data.remove(cfg.NEXT_CHECK_KEY)
        syncTankCapacity(machine)
        if (logic.isIdle()) logic.markLastRecipeDirty()
        machine.markDirty()
    })

    MBDMachineEvents.onAfterRecipeModify(cfg.MACHINE_ID, event => {
        const nativeEvent = event.event
        const recipe = nativeEvent.recipe
        if (recipe == null || String(recipe.id) !== cfg.CONVERSION_RECIPE_ID) return
        // Reject the original recipe first; if a later script error is caught by the event bus, never fall back to the unscaled maximum yield.
        nativeEvent.setRecipe(null)
        const machine = nativeEvent.machine
        const data = machine.getCustomData()
        // KubeJS LevelMixin renames getGameTime to getTime.
        const now = machine.getLevel().getTime()
        // MBD2 may search the same candidate recipe repeatedly while idle; a rejected start is checked at most once per second.
        if (data.getLong(cfg.NEXT_CHECK_KEY) > now) {
            return
        }
        const heated = isHeated(machine)
        const multiplier = multiplierOf(machine)
        const efficiency = getEfficiency(machine, multiplier)
        data.putBoolean(cfg.SAMPLED_KEY, true)
        data.putBoolean(cfg.HEATED_KEY, heated)
        data.putDouble(cfg.EFFICIENCY_KEY, efficiency)
        data.putLong(cfg.NEXT_CHECK_KEY, now + cfg.CHECK_RETRY_TICKS)
        machine.markDirty()
        if (!heated || efficiency <= 0) {
            return
        }
        // Always copy: the original recipe is shared by every machine. Once a batch starts, its output and the brazier check no longer change.
        // MBD2 re-modifies from the original recipe every batch (RecipeLogic.lastOriginRecipe), so level multipliers never stack
        let modified = recipe
        if (multiplier > 1) modified = modified.copy($ContentModifier.of(multiplier, 0), false, $IO.IN)
        nativeEvent.setRecipe(modified.copy($ContentModifier.of(efficiency * multiplier, 0), false, $IO.OUT))
    })

    MBDMachineEvents.onBeforeRecipeWorking(cfg.MACHINE_ID, event => {
        const machine = event.event.machine
        if (machine.isRemote()) return
        // Clear the retry limit after a successful start, so the next batch samples normally even if batches get shorter in the future.
        machine.getCustomData().remove(cfg.NEXT_CHECK_KEY)
        machine.markDirty()
    })

    MBDMachineEvents.onRecipeStatusChanged(cfg.MACHINE_ID, event => {
        const nativeEvent = event.event
        const machine = nativeEvent.machine
        // When missing ingredients or a full buffer send the machine idle midway, invalidate MBD2's fast path.
        // After recovering it must resample from the original recipe instead of reusing the efficiency and brazier result of the previous batch.
        if (!machine.isRemote() && String(nativeEvent.getNewStatus().name()) === 'IDLE') {
            machine.getRecipeLogic().markLastRecipeDirty()
        }
    })
})()
