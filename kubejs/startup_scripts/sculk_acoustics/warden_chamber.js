// Sculk Acoustics M10: the Warden Resonance Chamber (MBD2 21.1.2 multiblock) and its kinetic input (an MBD2 Create kinetic machine used as a multiblock part)
// Runtime logic (bands, agitation, wool, cooldown, comparator, breaking the jar) is in server_scripts/tech/warden_chamber.js
// The Warden in the jar is rendered by GuGuAddons (WardenChamberRenderer), called from the custom script renderer of the proxy block at the jar (client_scripts/sculk_acoustics/warden_chamber.js)
//
// Structure 3x3x5 (width x depth x height); the controller is in the front middle of the bottom layer, the kinetic input in the back middle (the runtime script checks that the jar holds a Warden):
//   Layer 1 (bottom): Resonant Casing ring (controller front middle, kinetic input back middle), Activated Sculk Catalyst center; once formed these 7 blocks are all item / redstone ports
//   Layers 2-4: Soundproof Glass ring; center column from bottom to top: Containment Jar holding a Warden, Calibrated Sculk Sensor, Mechanical Shrieker facing down
//   Layer 5 (top): Resonant Casing ring, Basic Spell Turret facing down in the center
//   Once formed, every block except the kinetic input becomes a hidden MBD2 proxy block (proxyWhileFormed), and the controller's GeckoLib jar model draws the whole machine
(() => {
    const cfg = global.SCULK_ACOUSTICS.WARDEN_CHAMBER
    const $IO = Java.loadClass('com.lowdragmc.mbd2.api.capability.recipe.IO')
    const $MBDRegistries = Java.loadClass('com.lowdragmc.mbd2.api.registry.MBDRegistries')
    const $MachineState = Java.loadClass('com.lowdragmc.mbd2.common.machine.definition.config.MachineState')
    const $StateMachine = Java.loadClass('com.lowdragmc.mbd2.common.machine.definition.config.StateMachine')
    const $BlockProperties = Java.loadClass('com.lowdragmc.mbd2.common.machine.definition.config.ConfigBlockProperties')
    const $MachineSettings = Java.loadClass('com.lowdragmc.mbd2.common.machine.definition.config.ConfigMachineSettings')
    const $RecipeSettings = Java.loadClass('com.lowdragmc.mbd2.common.machine.definition.config.ConfigRecipeLogicSettings')
    const $PartSettings = Java.loadClass('com.lowdragmc.mbd2.common.machine.definition.config.ConfigPartSettings')
    const $ProxyCapability = Java.loadClass('com.lowdragmc.mbd2.common.machine.definition.config.ConfigPartSettings$ProxyCapability')
    const $MultiblockDefinition = Java.loadClass('com.lowdragmc.mbd2.common.machine.definition.MultiblockMachineDefinition')
    const $KineticDefinition = Java.loadClass('com.lowdragmc.mbd2.integration.create.machine.CreateKineticMachineDefinition')
    const $KineticSettings = Java.loadClass('com.lowdragmc.mbd2.integration.create.machine.ConfigKineticMachineSettings')
    const $RotationFacing = Java.loadClass('com.lowdragmc.mbd2.integration.create.machine.ConfigKineticMachineSettings$RotationFacing')
    const $CreateMachineState = Java.loadClass('com.lowdragmc.mbd2.integration.create.machine.CreateMachineState')
    const $ItemSlot = Java.loadClass('com.lowdragmc.mbd2.common.trait.item.ItemSlotCapabilityTraitDefinition')
    const $NearbySource = Java.loadClass('com.lowdragmc.mbd2.integration.arsnouveau.trait.NearbySourceTraitDefinition')
    const $FactoryBlockPattern = Java.loadClass('com.lowdragmc.mbd2.api.pattern.FactoryBlockPattern')
    const $Predicates = Java.loadClass('com.lowdragmc.mbd2.api.pattern.Predicates')
    const $HashMap = Java.loadClass('java.util.HashMap')
    const $MultiblockShapeInfo = Java.loadClass('com.lowdragmc.mbd2.api.pattern.MultiblockShapeInfo')
    const $ModelRenderer = Java.loadClass('com.lowdragmc.lowdraglib2.client.renderer.impl.IModelRenderer')
    const $ResourceLocation = Java.loadClass('net.minecraft.resources.ResourceLocation')
    const $BuiltInRegistries = Java.loadClass('net.minecraft.core.registries.BuiltInRegistries')
    const $CompoundTag = Java.loadClass('net.minecraft.nbt.CompoundTag')
    const $AABB = Java.loadClass('net.minecraft.world.phys.AABB')
    const $Size = Java.loadClass('com.lowdragmc.lowdraglib2.math.Size')
    // shapeInfoFactory must return a Java MultiblockShapeInfo[]; Java.cast turns the JS array into that array type
    const $ShapeInfoArray = Java.tryLoadClass('[Lcom.lowdragmc.mbd2.api.pattern.MultiblockShapeInfo;')

    const rl = id => $ResourceLocation.parse(id)
    const SHAFT_MODEL = 'kubejs:block/warden_chamber_shaft_up'
    const blockOf = id => $BuiltInRegistries.BLOCK.get(rl(id))
    const isClient = Platform.isClientEnvironment()

    // Real renderers are only created on the client (MachineState.Builder.renderer ignores the factory on the server)
    const modelRenderer = path => () => new $ModelRenderer(rl(path))

    // Renderer of the formed controller: a custom script renderer that draws the jar model in two passes (opaque body, double-sided translucent glass; see the client script).
    // MBD2's GeckolibRenderer is not used directly: with translucency on, the whole model goes through entityTranslucentCull, and parts vanish at some angles or hide behind the glass
    const formedRenderer = () => {
        const $CustomScript = Java.loadClass('com.lowdragmc.mbd2.client.renderer.CustomScriptRenderer')
        const renderer = new $CustomScript()
        renderer.setRendererName(rl(cfg.FORMED_RENDERER))
        return renderer
    }

    // Renderer of the proxy block at the jar: a custom script renderer that draws the Warden in the jar
    const jarRenderer = () => {
        const $CustomScript = Java.loadClass('com.lowdragmc.mbd2.client.renderer.CustomScriptRenderer')
        const renderer = new $CustomScript()
        renderer.setRendererName(rl(cfg.JAR_RENDERER))
        return renderer
    }

    // State tree shared by the controller / proxy blocks: unformed, formed -> working -> waiting, formed -> suspend
    const chamberStates = (rootRenderer, formedRenderer, renderingBox) => $MachineState.baseBuilder()
        .renderer(rootRenderer)
        .child('unformed')
        .child('formed', formed => {
            if (formedRenderer) formed.renderer(formedRenderer)
            if (renderingBox) formed.renderingBox(renderingBox)
            formed.child('working', working => working.child('waiting')).child('suspend')
        })
        .build()

    // Flywheel PartialModels must be registered before model baking, so MBD2 gets the baked shaft model when rendering
    if (isClient) Java.loadClass('dev.engine_room.flywheel.lib.model.baked.PartialModel').of(rl(SHAFT_MODEL))

    MBDRegistryEvents.recipeType(event => {
        // EMI page: MBD2 sizes the page from the recipe type (the width is always 176); the page itself is built by
        // client_scripts/sculk_acoustics/warden_chamber_emi.js, so only the size is set here (Create's mixing page is 177 x 103, plus a Source line)
        event.createRecipeType(cfg.RECIPE_TYPE).setUiSize($Size.of(cfg.EMI_WIDTH, cfg.EMI_HEIGHT))
    })

    MBDRegistryEvents.machine(event => {
        // ---------------------------------------------------------------- Resonance Chamber Kinetic Input (part)
        // The shaft side faces out and power connects from the front; the back faces the jar and draws no shaft (per the art delivery notes)
        const kinetic = $KineticDefinition.builder()
        kinetic.id(rl(cfg.KINETIC_INPUT_ID))
        // Shaft model: MBD2 uses Create's half shaft (facing south) by default, but its Flywheel path rotates from "facing up" (rotateToFace),
        // so the shaft turns the wrong way depending on placement; a half shaft model facing up lines up on both render paths
        kinetic.rootState($StateMachine.createSingleDefault(
            () => {
                const builder = $CreateMachineState.builder()
                if (isClient) builder.rotationRenderer(new $ModelRenderer(rl(SHAFT_MODEL)))
                return builder
            },
            modelRenderer('kubejs:block/warden_resonance_kinetic_input')
        ))
        // The model is not a full block (the top only reaches 12 pixels); treating it as solid makes the inner faces sample light 0 at its own position and turn black
        kinetic.blockProperties($BlockProperties.builder().destroyTime(3).explosionResistance(6).canOcclude(false).build())
        kinetic.machineSettings(() => $MachineSettings.builder().hasUI(false).build())
        kinetic.partSettings(() => $PartSettings.builder().enable(true).build())
        // The model's shaft hole is on the north side, which is MBD2's FRONT; the back faces the jar and draws no shaft
        kinetic.kineticMachineSettings($KineticSettings.builder()
            .isGenerator(false)
            .torque(cfg.STRESS_PER_RPM)
            .frontRotation($RotationFacing.FRONT)
            .hasBackRotation(false)
            .build())
        $MBDRegistries.MACHINE_DEFINITIONS.register(rl(cfg.KINETIC_INPUT_ID), kinetic.build())

        // ---------------------------------------------------------------- Warden Resonance Chamber (controller)
        // The formed model covers the whole 3x3x5; the render box is the bounding box over every controller facing
        const formedBox = new $AABB(-2, 0, -2, 3, 5, 3)
        const chamber = $MultiblockDefinition.builder()
        chamber.id(rl(cfg.MACHINE_ID))
        chamber.rootState(chamberStates(
            modelRenderer('kubejs:block/warden_resonance_chamber'),
            isClient ? formedRenderer : null,
            formedBox
        ))
        chamber.blockProperties($BlockProperties.builder().destroyTime(4).explosionResistance(8).canOcclude(false).build())
        chamber.machineSettings(() => {
            const settings = $MachineSettings.builder().hasUI(false).build()

            // Two input slots, one item each: with a shared slot, continuously fed Sculk Niter Powder fills every slot and wool can never get in.
            // Both names contain item_input, so the bottom-layer port forwarding (name containment) covers both
            const input = new $ItemSlot()
            input.setName(cfg.ITEM_INPUT_TRAIT)
            input.setSlotSize(1)
            input.setRecipeHandlerIO($IO.IN)
            input.getCapabilityIO().setAllIO($IO.IN)
            input.getItemFilterSettings().setEnable(true)
            input.getItemFilterSettings().getFilterItems().add(Item.of(cfg.POWDER))
            settings.addTraitDefinition(input)

            // Wool (the script takes one per second to soothe). Filtered by item tag (MBD2 checks tags on insertion);
            // the tag cannot be expanded into an item list here: tags are not loaded yet when startup scripts run, so the expansion is empty
            const wool = new $ItemSlot()
            wool.setName(cfg.WOOL_INPUT_TRAIT)
            wool.setSlotSize(1)
            wool.setRecipeHandlerIO($IO.IN)
            wool.getCapabilityIO().setAllIO($IO.IN)
            wool.getItemFilterSettings().setEnable(true)
            wool.getItemFilterSettings().getFilterTags().add(rl('minecraft:wool'))
            settings.addTraitDefinition(wool)

            // Output: Warden Carapace / Resonance Nucleus
            const output = new $ItemSlot()
            output.setName(cfg.ITEM_OUTPUT_TRAIT)
            output.setSlotSize(2)
            output.setRecipeHandlerIO($IO.OUT)
            output.getCapabilityIO().setAllIO($IO.OUT)
            settings.addTraitDefinition(output)

            // Source: read from Source Jars within the radius (as with the Drygmy and the Imbuement Chamber)
            const source = new $NearbySource()
            source.setName(cfg.SOURCE_TRAIT)
            source.setRadius(cfg.SOURCE_RADIUS)
            settings.addTraitDefinition(source)

            return settings
        })
        chamber.recipeLogicSettings($RecipeSettings.builder()
            .recipeType(rl(cfg.RECIPE_TYPE))
            // Recheck cooldown and agitation before every batch, and scale the yield by agitation
            .alwaysModifyRecipe(true)
            .consumeInputsAfterWorking(true)
            .recipeDampingValue(0)
            .build())
        const definition = chamber.build()

        // Structure pattern (MBD2 FactoryBlockPattern.start(): characters go left, strings go up, aisles go forward; the first aisle is the back)
        let pattern = null
        const buildPattern = () => {
            if (pattern) return pattern
            const hidden = id => $Predicates.blocks(blockOf(id)).proxyWhileFormed()
            // Once formed, the proxy blocks of the bottom casing (B) double as item ports: they forward the controller input slots (in only) and output slot (out only);
            // hoppers / chutes / Create funnels work from any side, and products stay in the output slot until extracted.
            // The name filter matches by contains: item_input matches both the powder slot and the wool slot (item_input_wool), and neither contains item_output.
            // Redstone (band input, comparator reading agitation) also uses "proxy blocks with forwarding capabilities" as ports, implemented by GuGuAddons
            const port = proxy => {
                const input = new $ProxyCapability()
                input.traitNameFilter(cfg.ITEM_INPUT_TRAIT)
                input.capabilityIO().setAllIO($IO.IN)
                proxy.getProxyCapabilities().add(input)
                const output = new $ProxyCapability()
                output.traitNameFilter(cfg.ITEM_OUTPUT_TRAIT)
                output.capabilityIO().setAllIO($IO.OUT)
                proxy.getProxyCapabilities().add(output)
            }
            // Blocks that must face down (Mechanical Shrieker, Basic Spell Turret); the preview shows them facing down too
            // Explicit signature: Rhino cannot pick between the Map overload and the varargs overloads
            const hiddenDown = id => {
                const facing = new $HashMap()
                facing.put('facing', 'down')
                return $Predicates['partialState(net.minecraft.world.level.block.Block,java.util.Map)'](blockOf(id), facing).proxyWhileFormed()
            }
            pattern = $FactoryBlockPattern.start()
                .aisle('BKB', 'GGG', 'GGG', 'GGG', 'CCC')
                .aisle('BAB', 'GJG', 'GLG', 'GMG', 'CTC')
                .aisle('B@B', 'GGG', 'GGG', 'GGG', 'CCC')
                .where('B', $Predicates.blocks(blockOf(cfg.CASING)).proxyWhileFormed(port))
                .where('A', $Predicates.blocks(blockOf(cfg.CATALYST)).proxyWhileFormed(port))
                .where('C', hidden(cfg.CASING))
                .where('G', hidden(cfg.GLASS))
                .where('L', hidden(cfg.CALIBRATED_SENSOR))
                .where('M', hiddenDown(cfg.SHRIEKER))
                .where('T', hiddenDown(cfg.TURRET))
                // Containment Jar: the structure only checks the block; "holds a Warden" is checked by server_scripts/tech/warden_chamber.js before each batch.
                // setNBT cannot be used: once formed this is a proxy block, and when MBD2 rechecks the structure (rejoining the world, nearby block changes) it reads the proxy block's own data,
                // which never matches, so the structure breaks and the proxy positions are lost, and the proxy blocks cannot be restored when the controller is broken (tested 2026-11-18)
                // The proxy block draws the Warden with a custom renderer instead
                .where('J', $Predicates.blocks(blockOf(cfg.JAR)).proxyWhileFormed(proxy => {
                    proxy.setStateMachine(new $StateMachine(chamberStates(isClient ? jarRenderer : null, null, null)))
                }))
                .where('K', $Predicates.blocks(blockOf(cfg.KINETIC_INPUT_ID)))
                .where('@', $Predicates.controller($Predicates.blocks(blockOf(cfg.MACHINE_ID))))
                .build()
            return pattern
        }
        definition.blockPatternFactory(controller => buildPattern())
        // Structure preview (EMI multiblock info, the MBD2 preview item)
        definition.shapeInfoFactory(def => {
            const infos = [new $MultiblockShapeInfo(buildPattern().getPreview([1, 1, 1]))]
            return $ShapeInfoArray ? Java.cast($ShapeInfoArray, infos) : infos
        })
        $MBDRegistries.MACHINE_DEFINITIONS.register(rl(cfg.MACHINE_ID), definition)
    })
})()
