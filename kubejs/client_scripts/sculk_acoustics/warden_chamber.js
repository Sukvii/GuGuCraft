// Sculk Acoustics M10: client side of the Warden Resonance Chamber
// - Warden in the jar: the proxy block at the jar position uses a custom script renderer that calls GuGuAddons' WardenChamberRenderer
//   (vanilla Warden scaled to about 0.8; agitation is synced as its anger, and it roars when a batch is voided). Agitation and roar time come from the controller custom data
// - Create-style item tooltips (same approach as client_scripts/arcane_industry/sculk_spreader.js). Names and tooltip texts are in kubejs/assets/guguaddons/lang;
//   the MBD2 proxy part block (replaces the structure blocks once formed; MBD2 ships no name for it, and Jade shows it) is named in kubejs/assets/mbd2/lang
(() => {
    const cfg = global.SCULK_ACOUSTICS.WARDEN_CHAMBER
    const $TooltipModifier = Java.loadClass('com.simibubi.create.foundation.item.TooltipModifier')
    const $Description = Java.loadClass('com.simibubi.create.foundation.item.ItemDescription$Modifier')
    const $Palette = Java.loadClass('net.createmod.catnip.lang.FontHelper$Palette')

    // Jar model: the delivered model is split into a body and a glass part (_gugu_work/split_chamber_geo.py).
    // The body uses GeckoLib's default opaque, no-cull rendering (with the glow layer, and animations played by state name: formed / working / waiting / suspend);
    // the glass is rendered separately, double-sided and translucent without depth writes (entityTranslucentEmissive). This avoids parts vanishing at some angles or hiding behind the glass in MBD2 translucent mode
    const TEXTURE = 'kubejs:textures/block/warden_resonance_chamber_formed.png'
    const Y_ROT = { south: 0, west: 90, north: 180, east: 270 }
    const WARDEN_EXTRA_SCALE = 0.75
    const ANIMATION = 'kubejs:animations/warden_resonance_chamber.animation.json'
    // Animations in the animation file named after the machine states (MBD2 state names: formed / working / waiting / suspend)
    const STATE_ANIMATIONS = ['formed', 'working', 'waiting', 'suspend']
    let chamberRenderers = null
    const getChamberRenderers = () => {
        if (chamberRenderers) return chamberRenderers
        const $Gecko = Java.loadClass('com.lowdragmc.mbd2.integration.geckolib.GeckolibRenderer')
        const $RegistryAccess = Java.loadClass('net.minecraft.core.RegistryAccess')
        const $ResourceLocation = Java.loadClass('net.minecraft.resources.ResourceLocation')
        const create = (geo, flags) => {
            const renderer = new $Gecko($ResourceLocation.parse(geo), $ResourceLocation.parse(TEXTURE), $ResourceLocation.parse(ANIMATION))
            // These switches are @Persisted fields of GeckolibRenderer without setters, so they are set through LDLib persistence (serialize, edit, deserialize)
            // (Rhino treats const as function-scoped, so use let inside the try block)
            let settings = null
            try {
                settings = renderer.serializeNBT($RegistryAccess.EMPTY)
                Object.keys(flags).forEach(key => settings.putBoolean(key, flags[key]))
                renderer.deserializeNBT($RegistryAccess.EMPTY, settings)
            } catch (e) {
                console.error(`[WardenChamber] GeckoLib renderer setup failed: ${e}`)
            }
            return renderer
        }
        chamberRenderers = {
            body: create('kubejs:geo/warden_resonance_chamber_body.geo.json', { useGlowingLayer: true, scheduleStateAnimation: true }),
            glass: create('kubejs:geo/warden_resonance_chamber_glass.geo.json', {})
        }
        // State animations (scheduleStateAnimation) only play animations registered in the renderer animation list (GeckolibRenderer.getRawAnimation looks names up in the list,
        // not in the animation file). With an empty list nothing plays, so register the four animations named after the states (single stage, looping)
        const $Animation = Java.loadClass('com.lowdragmc.mbd2.integration.geckolib.Animation')
        const $CompoundTag = Java.loadClass('net.minecraft.nbt.CompoundTag')
        const $ListTag = Java.loadClass('net.minecraft.nbt.ListTag')
        const stateAnimation = name => {
            const stage = new $CompoundTag()
            stage.putString('animationName', name)
            stage.putString('loopType', 'LOOP')
            const stages = new $ListTag()
            stages.add(stage)
            const tag = new $CompoundTag()
            tag.putString('name', name)
            tag.put('stages', stages)
            const animation = new $Animation()
            animation.deserializeNBT(tag)
            return animation
        }
        // Errors are only logged: an exception reaching the renderer makes MBD2 disable the whole formed renderer
        try {
            STATE_ANIMATIONS.forEach(name => chamberRenderers.body.getAnimations().add(stateAnimation(name)))
        } catch (e) {
            console.error(`[WardenChamber] State animation registration failed: ${e}`)
        }
        return chamberRenderers
    }

    MBDClientEvents.registerCustomRenderers(event => {
        const $Renderer = Java.loadClass('com.gugucraft.guguaddons.client.compat.mbd2.WardenChamberRenderer')
        const $AnimationSource = Java.loadClass('com.lowdragmc.mbd2.api.capability.IAnimationSource')
        const $RenderType = Java.loadClass('net.minecraft.client.renderer.RenderType')
        const $ResourceLocation = Java.loadClass('net.minecraft.resources.ResourceLocation')
        // The glass uses entityTranslucentEmissive: double-sided, translucent, writes color but not depth. entityTranslucent writes depth,
        // and the glass faces within one model are not drawn back to front, so a near pane drawn first hides the panes behind it (invisible at the seams).
        // The cost is that the glass ignores lighting (it keeps its pale color in the dark)
        const glassRenderType = $RenderType.entityTranslucentEmissive($ResourceLocation.parse(TEXTURE))

        const $ProxyPartBlockEntity = Java.loadClass('com.lowdragmc.mbd2.api.blockentity.ProxyPartBlockEntity')
        const $IMachine = Java.loadClass('com.lowdragmc.mbd2.api.machine.IMachine')
        const $Direction = Java.loadClass('net.minecraft.core.Direction')
        const $PonderLevel = Java.loadClass('net.createmod.ponder.api.level.PonderLevel')

        const renderFormed = ctx => {
            const renderers = getChamberRenderers()
            renderers.body.render(ctx.blockEntity, ctx.partialTick, ctx.poseStack, ctx.bufferSource, ctx.packedLight, ctx.packedOverlay)
            const source = $AnimationSource.of(ctx.blockEntity)
            if (source == null) return
            renderers.glass.defaultRender(ctx.poseStack, renderers.glass.getAnimatable(source), ctx.bufferSource,
                glassRenderType, null, 0, ctx.partialTick, ctx.packedLight)
        }

        // Draws the Warden in the jar: the pose origin is the jar block; agitation and roar time come from the controller custom data
        const renderWarden = (ctx, anchor, machine) => {
            const data = machine.getCustomData()
            const agitation = data.getInt(cfg.AGITATION_KEY)
            const roaring = data.getLong(cfg.ROAR_KEY) > ctx.getGameTime()
            // The Warden faces the front of the controller
            const front = machine.getFrontFacing().orElse($Direction.NORTH)
            // GuGuAddons scales the Warden by 0.8 internally (about 2.3 blocks tall), which pokes into the crystals of the upper section; scale down again around the jar's bottom center, about 0.6 overall
            const poses = ctx.poseStack
            poses.pushPose()
            poses.translate(0.5, 0, 0.5)
            poses.scale(WARDEN_EXTRA_SCALE, WARDEN_EXTRA_SCALE, WARDEN_EXTRA_SCALE)
            poses.translate(-0.5, 0, -0.5)
            // Direction has no toYRot() in KubeJS, so convert from the direction name (same as vanilla Direction.toYRot)
            $Renderer.render(anchor, agitation, roaring, -(Y_ROT[String(front)] || 0), ctx.partialTick,
                poses, ctx.bufferSource, ctx.packedLight)
            poses.popPose()
        }

        // The Ponder scene (client_scripts/sculk_acoustics/ponder_warden_chamber.js) has no proxy blocks, so the controller draws the Warden in the jar itself:
        // the jar is one block behind and one above the controller. Errors in Ponder are logged once and never let MBD2 disable this renderer (that would stop drawing the chamber in game too)
        const BACK_OFFSET = { north: [0, 1], south: [0, -1], west: [1, 0], east: [-1, 0] }
        let ponderErrorLogged = false
        const renderPonder = ctx => {
            let pushed = false
            try {
                renderFormed(ctx)
                let machine = ctx.blockEntity.getMetaMachine()
                let offset = BACK_OFFSET[String(machine.getFrontFacing().orElse($Direction.NORTH))] || [0, 1]
                ctx.poseStack.pushPose()
                pushed = true
                ctx.poseStack.translate(offset[0], 1, offset[1])
                renderWarden(ctx, ctx.blockEntity, machine)
            } catch (e) {
                if (!ponderErrorLogged) {
                    ponderErrorLogged = true
                    console.error(`[WardenChamber] Ponder scene rendering failed: ${e}`)
                }
            }
            if (pushed) ctx.poseStack.popPose()
        }

        event.register(cfg.FORMED_RENDERER, ctx => {
            if (ctx.getLevel() instanceof $PonderLevel) {
                renderPonder(ctx)
                return
            }
            renderFormed(ctx)
        }).viewDistance(64).boundingBoxInflate(3)

        event.register(cfg.JAR_RENDERER, ctx => {
            const proxy = ctx.blockEntity
            if (!(proxy instanceof $ProxyPartBlockEntity)) return
            const controllerPos = proxy.getControllerPos()
            if (controllerPos == null) return
            const machine = $IMachine.ofMachine(ctx.getLevel(), controllerPos).orElse(null)
            if (machine == null || (typeof machine.isFormed === 'function' && !machine.isFormed())) return
            // The structure only checks for a Containment Jar block; draw only when it holds a Warden (checked every second on the server and written to the controller custom data, which syncs to the client)
            if (!machine.getCustomData().getBoolean(cfg.HAS_WARDEN_KEY)) return
            renderWarden(ctx, proxy, machine)
        }).viewDistance(64)
    })

    // Items are not registered yet when client scripts first load, so hook into Create's tooltip registry at asset generation; F3+T reruns it, so never register twice
    ClientEvents.generateAssets('after_mods', () => {
        ;[cfg.MACHINE_ID, cfg.KINETIC_INPUT_ID].forEach(id => {
            const item = Item.of(id).getItem()
            if ($TooltipModifier.REGISTRY.get(item) == null) {
                $TooltipModifier.REGISTRY.register(item, new $Description(item, $Palette.STANDARD_CREATE))
            }
        })
    })
})()
