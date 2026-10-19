// MBD2 21.1.2 / LDLib2 2.2.42：机器注册必须在 startup 阶段完成。
(() => {
    const cfg = global.SOURCE_CONVERTER
    const $IO = Java.loadClass('com.lowdragmc.mbd2.api.capability.recipe.IO')
    const $MachineState = Java.loadClass('com.lowdragmc.mbd2.common.machine.definition.config.MachineState')
    const $StateMachine = Java.loadClass('com.lowdragmc.mbd2.common.machine.definition.config.StateMachine')
    const $BlockProperties = Java.loadClass('com.lowdragmc.mbd2.common.machine.definition.config.ConfigBlockProperties')
    const $MachineSettings = Java.loadClass('com.lowdragmc.mbd2.common.machine.definition.config.ConfigMachineSettings')
    const $RecipeSettings = Java.loadClass('com.lowdragmc.mbd2.common.machine.definition.config.ConfigRecipeLogicSettings')
    const $FluidTank = Java.loadClass('com.lowdragmc.mbd2.common.trait.fluid.FluidTankCapabilityTraitDefinition')
    const $SourceStorage = Java.loadClass('com.lowdragmc.mbd2.integration.arsnouveau.trait.SourceStorageCapabilityTraitDefinition')
    const $ModelRenderer = Java.loadClass('com.lowdragmc.lowdraglib2.client.renderer.impl.IModelRenderer')
    const $ResourceLocation = Java.loadClass('net.minecraft.resources.ResourceLocation')
    const $Shapes = Java.loadClass('net.minecraft.world.phys.shapes.Shapes')

    MBDRegistryEvents.recipeType(event => {
        // 仅隐藏配方浏览器中的转换分类，机器仍使用此配方类型运行。
        event.createRecipeType(cfg.RECIPE_TYPE).setXEIVisible(false)
    })

    MBDRegistryEvents.machine(event => {
        // 当前模型的部件均无旋转；启动时合并一次，碰撞与选取共用模型几何。
        const model = JSON.parse(JsonIO.readString('kubejs/assets/ars_nouveau/models/block/liquid_sourcelink.json'))
        let shape = $Shapes.empty()
        model.elements.forEach(element => {
            const from = element.from
            const to = element.to
            shape = $Shapes['or(net.minecraft.world.phys.shapes.VoxelShape,net.minecraft.world.phys.shapes.VoxelShape)'](
                shape, $Shapes.box(from[0] / 16, from[1] / 16, from[2] / 16, to[0] / 16, to[1] / 16, to[2] / 16)
            )
        })
        const rootState = $StateMachine.createSingleDefault(
            () => $MachineState.baseBuilder(),
            () => new $ModelRenderer($ResourceLocation.parse('ars_nouveau:block/liquid_sourcelink'))
        )
        // createSingleDefault 会强制设置完整方块形状，必须在工厂返回后覆盖。
        // working / waiting / suspend 状态继承此形状，运行时不再读取模型或合并。
        rootState.shape().setValue(shape.optimize())

        // KubeJS builder 的键是 single；single_machine 是编辑器定义类型名。
        event.create('single', cfg.MACHINE_ID)
            // 方块与物品共用液态魔源通道模型；液面复用 Ars 的 source_still 动画贴图。
            .rootState(rootState)
            .blockProperties($BlockProperties.builder().destroyTime(3).explosionResistance(6).canOcclude(false).build())
            // 工厂在注册表就绪后执行，此时才能安全引用自定义流体。
            .machineSettings(() => {
                const settings = $MachineSettings.builder().hasUI(false).build()

                const fluid = new $FluidTank()
                fluid.setName(cfg.FLUID_TRAIT)
                fluid.setTankSize(1)
                fluid.setCapacity(cfg.TANK_CAPACITY)
                fluid.setRecipeHandlerIO($IO.IN)
                fluid.getCapabilityIO().setAllIO($IO.IN)
                fluid.getFluidFilterSettings().setEnable(true)
                fluid.getFluidFilterSettings().getFilterFluids().add(Fluid.of(cfg.FLUID_ID, 1))
                settings.addTraitDefinition(fluid)

                const source = new $SourceStorage()
                source.setName(cfg.SOURCE_TRAIT)
                source.setCapacity(cfg.SOURCE_CAPACITY)
                source.setMaxReceive(0)
                source.setMaxExtract(cfg.SOURCE_CAPACITY)
                source.setRecipeHandlerIO($IO.OUT)
                source.getCapabilityIO().setAllIO($IO.OUT)
                source.setExposeToDevices(true)
                source.getAutoIO().setAllIO($IO.OUT)
                settings.addTraitDefinition(source)

                return settings
            })
            .recipeLogicSettings($RecipeSettings.builder()
                .recipeType($ResourceLocation.parse(cfg.RECIPE_TYPE))
                // 连续批次开始前重新修改原始配方，检测火盆并按当时液位计算产量。
                .alwaysModifyRecipe(true)
                // 完成时才扣液体；缓冲不足或中途失去原料时不会吞掉输入。
                .consumeInputsAfterWorking(true)
                .recipeDampingValue(0)
                .build())
        // MBDRegistryEvents 在事件结束时自动 build / 注册。
    })
})()
