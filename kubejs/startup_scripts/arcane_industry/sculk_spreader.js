// M6 Sculk Spreader: MBD2 21.1.2 single-block machine, registered the same way as startup_scripts/source_converter/01_machine.js
// The structure core (the Activated Sculk Catalyst directly below) and the convertible Deepslate are checked by server_scripts/tech/sculk_spreader.js before each batch
(() => {
    const cfg = global.ARCANE_INDUSTRY.SCULK_SPREADER
    const $IO = Java.loadClass('com.lowdragmc.mbd2.api.capability.recipe.IO')
    const $MachineState = Java.loadClass('com.lowdragmc.mbd2.common.machine.definition.config.MachineState')
    const $StateMachine = Java.loadClass('com.lowdragmc.mbd2.common.machine.definition.config.StateMachine')
    const $BlockProperties = Java.loadClass('com.lowdragmc.mbd2.common.machine.definition.config.ConfigBlockProperties')
    const $MachineSettings = Java.loadClass('com.lowdragmc.mbd2.common.machine.definition.config.ConfigMachineSettings')
    const $RecipeSettings = Java.loadClass('com.lowdragmc.mbd2.common.machine.definition.config.ConfigRecipeLogicSettings')
    const $ItemSlot = Java.loadClass('com.lowdragmc.mbd2.common.trait.item.ItemSlotCapabilityTraitDefinition')
    const $SourceStorage = Java.loadClass('com.lowdragmc.mbd2.integration.arsnouveau.trait.SourceStorageCapabilityTraitDefinition')
    const $ModelRenderer = Java.loadClass('com.lowdragmc.lowdraglib2.client.renderer.impl.IModelRenderer')
    const $ResourceLocation = Java.loadClass('net.minecraft.resources.ResourceLocation')
    const $Shapes = Java.loadClass('net.minecraft.world.phys.shapes.Shapes')

    MBDRegistryEvents.recipeType(event => {
        // The script controls when recipes start and what they produce, so they are hidden from recipe viewers (the tooltip explains the machine)
        event.createRecipeType(cfg.RECIPE_TYPE).setXEIVisible(false)
    })

    MBDRegistryEvents.machine(event => {
        // No model part is rotated (art spec 2.3); merged into the collision and selection shape
        const model = JSON.parse(JsonIO.readString('kubejs/assets/kubejs/models/block/sculk_spreader.json'))
        let shape = $Shapes.empty()
        model.elements.forEach(element => {
            const from = element.from
            const to = element.to
            shape = $Shapes['or(net.minecraft.world.phys.shapes.VoxelShape,net.minecraft.world.phys.shapes.VoxelShape)'](
                shape, $Shapes.box(from[0] / 16, from[1] / 16, from[2] / 16, to[0] / 16, to[1] / 16, to[2] / 16)
            )
        })
        // Idle / running texture sets: working (and its substate waiting) uses the running model
        const rootState = $StateMachine.createSingleDefault(
            () => $MachineState.baseBuilder(),
            () => new $ModelRenderer($ResourceLocation.parse('kubejs:block/sculk_spreader')),
            () => new $ModelRenderer($ResourceLocation.parse('kubejs:block/sculk_spreader_working')),
            null,
            null
        )
        // createSingleDefault forces a full block shape, so it must be overridden after the factory returns
        rootState.shape().setValue(shape.optimize())

        event.create('single', cfg.MACHINE_ID)
            .rootState(rootState)
            .blockProperties($BlockProperties.builder().destroyTime(3).explosionResistance(6).canOcclude(false).build())
            .machineSettings(() => {
                const settings = $MachineSettings.builder().hasUI(false).build()

                // Source: supplied by Source Relays and similar devices
                const source = new $SourceStorage()
                source.setName(cfg.SOURCE_TRAIT)
                source.setCapacity(cfg.SOURCE_CAPACITY)
                source.setMaxReceive(cfg.SOURCE_CAPACITY)
                source.setMaxExtract(0)
                source.setRecipeHandlerIO($IO.IN)
                source.getCapabilityIO().setAllIO($IO.IN)
                source.setExposeToDevices(true)
                settings.addTraitDefinition(source)

                // Input: Experience Nuggets; also reserved for the Dormant Sculk Seal (the M12 spreader recipe)
                const input = new $ItemSlot()
                input.setName(cfg.ITEM_INPUT_TRAIT)
                input.setSlotSize(2)
                input.setRecipeHandlerIO($IO.IN)
                input.getCapabilityIO().setAllIO($IO.IN)
                input.getItemFilterSettings().setEnable(true)
                input.getItemFilterSettings().getFilterItems().add(Item.of('create:experience_nugget'))
                input.getItemFilterSettings().getFilterItems().add(Item.of('kubejs:dormant_sculk_seal'))
                settings.addTraitDefinition(input)

                // Output: reserved for the M12 Sculk Seal
                const output = new $ItemSlot()
                output.setName(cfg.ITEM_OUTPUT_TRAIT)
                output.setSlotSize(1)
                output.setRecipeHandlerIO($IO.OUT)
                output.getCapabilityIO().setAllIO($IO.OUT)
                settings.addTraitDefinition(output)

                return settings
            })
            .recipeLogicSettings($RecipeSettings.builder()
                .recipeType($ResourceLocation.parse(cfg.RECIPE_TYPE))
                // Recheck the core block and the Deepslate before every batch
                .alwaysModifyRecipe(true)
                // Source and Experience Nuggets are only taken on finish
                .consumeInputsAfterWorking(true)
                .recipeDampingValue(0)
                .build())
    })
})()
