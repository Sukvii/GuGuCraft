(() => {
    const cfg = global.SOURCE_CONVERTER
    const $Brazier = Java.loadClass('com.klikli_dev.theurgy.content.apparatus.pyromanticbrazier.PyromanticBrazierBlockEntity')
    const $ContentModifier = Java.loadClass('com.lowdragmc.mbd2.api.recipe.content.ContentModifier')
    const $IO = Java.loadClass('com.lowdragmc.mbd2.api.capability.recipe.IO')

    function isHeated(machine) {
        const level = machine.getLevel()
        if (level == null) return false
        const below = machine.getPos().below()
        if (!level.hasChunkAt(below)) return false
        const brazier = level.getBlockEntity(below)
        // 读取 Theurgy 的实际燃烧计时，不以“放了燃料”代替正在燃烧。
        return brazier instanceof $Brazier && brazier.isLit()
    }

    function getEfficiency(machine) {
        const trait = machine.getTraitByName(cfg.FLUID_TRAIT)
        const tank = trait == null ? null : trait.storages[0]
        if (tank == null || tank.getCapacity() <= 0) return 0
        const amount = tank.getFluidAmount()
        if (amount < cfg.FLUID_PER_BATCH) return 0
        // 按批次开始、扣料前的绝对液量采样；区间含两个端点，不再要求精确半满。
        return amount >= cfg.OPTIMAL_FLUID_MIN && amount <= cfg.OPTIMAL_FLUID_MAX ? 1 : cfg.OFF_RANGE_EFFICIENCY
    }

    MBDMachineEvents.onLoad(cfg.MACHINE_ID, event => {
        const machine = event.event.machine
        if (machine.isRemote()) return
        const logic = machine.getRecipeLogic()
        const recipe = logic.getLastRecipe()
        const data = machine.getCustomData()
        // 迁移旧周期批次、逐 tick 条件，以及此前采样报错后意外缓存的原始配方。
        // 本机在完成时才扣原料，因此迁移不会吞掉已经投入的液体。
        if (recipe != null && String(recipe.id) === cfg.CONVERSION_RECIPE_ID &&
            (recipe.duration !== cfg.TICKS_PER_BATCH || !recipe.conditions.isEmpty() || !data.getBoolean(cfg.SAMPLED_KEY))) {
            logic.resetRecipeLogic()
        }
        data.remove(cfg.NEXT_CHECK_KEY)
        if (logic.isIdle()) logic.markLastRecipeDirty()
        machine.markDirty()
    })

    MBDMachineEvents.onAfterRecipeModify(cfg.MACHINE_ID, event => {
        const nativeEvent = event.event
        const recipe = nativeEvent.recipe
        if (recipe == null || String(recipe.id) !== cfg.CONVERSION_RECIPE_ID) return
        // 先拒绝原始配方；若后续脚本异常被事件总线捕获，不能退回未缩放的最高产量。
        nativeEvent.setRecipe(null)
        const machine = nativeEvent.machine
        const data = machine.getCustomData()
        // KubeJS LevelMixin 将 getGameTime 重命名为 getTime。
        const now = machine.getLevel().getTime()
        // MBD2 待机时可能重复搜索同一候选配方；被拒绝的启动尝试最多每秒检测一次。
        if (data.getLong(cfg.NEXT_CHECK_KEY) > now) {
            return
        }
        const heated = isHeated(machine)
        const efficiency = getEfficiency(machine)
        data.putBoolean(cfg.SAMPLED_KEY, true)
        data.putBoolean(cfg.HEATED_KEY, heated)
        data.putDouble(cfg.EFFICIENCY_KEY, efficiency)
        data.putLong(cfg.NEXT_CHECK_KEY, now + cfg.CHECK_RETRY_TICKS)
        machine.markDirty()
        if (!heated || efficiency <= 0) {
            return
        }
        // 始终复制：原配方由所有机器共享。本批开始后不再改变输出或检查火盆。
        nativeEvent.setRecipe(recipe.copy($ContentModifier.of(efficiency, 0), false, $IO.OUT))
    })

    MBDMachineEvents.onBeforeRecipeWorking(cfg.MACHINE_ID, event => {
        const machine = event.event.machine
        if (machine.isRemote()) return
        // 成功启动后清除重试限制；即使将来缩短批次，也允许下一批正常采样。
        machine.getCustomData().remove(cfg.NEXT_CHECK_KEY)
        machine.markDirty()
    })

    MBDMachineEvents.onRecipeStatusChanged(cfg.MACHINE_ID, event => {
        const nativeEvent = event.event
        const machine = nativeEvent.machine
        // 中途原料不足或缓存满导致待机时，使 MBD2 的快速路径失效。
        // 恢复后必须从原始配方重新采样，不能复用上一批的效率与火盆结果。
        if (!machine.isRemote() && String(nativeEvent.getNewStatus().name()) === 'IDLE') {
            machine.getRecipeLogic().markLastRecipeDirty()
        }
    })
})()
