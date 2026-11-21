// MBD2 21.1.2 / LDLib2 2.2.42: machines must be registered during startup.
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
        // Only hides the conversion category in recipe viewers; the machine still runs this recipe type.
        event.createRecipeType(cfg.RECIPE_TYPE).setXEIVisible(false)
    })

    MBDRegistryEvents.machine(event => {
        // No part of the current model is rotated; merge once at startup so collision and selection share the model geometry.
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
        // createSingleDefault forces a full block shape, so it must be overridden after the factory returns.
        // The working / waiting / suspend states inherit this shape, so the model is never read or merged at runtime.
        rootState.shape().setValue(shape.optimize())

        // The KubeJS builder key is single; single_machine is the editor definition type name.
        event.create('single', cfg.MACHINE_ID)
            // The block and the item share the Liquid Source channel model; the fluid surface reuses Ars's animated source_still texture.
            .rootState(rootState)
            .blockProperties($BlockProperties.builder().destroyTime(3).explosionResistance(6).canOcclude(false).build())
            // The factory runs once registries are ready, which is when custom fluids can be referenced safely.
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
                // Before each consecutive batch, re-modify the original recipe, check the brazier and compute the yield from the current fluid level.
                .alwaysModifyRecipe(true)
                // Fluid is only taken on finish; a short buffer or ingredients lost midway never swallow the input.
                .consumeInputsAfterWorking(true)
                .recipeDampingValue(0)
                .build())
        // MBDRegistryEvents builds / registers automatically when the event ends.
    })
})()
