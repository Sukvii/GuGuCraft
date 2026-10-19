(() => {
    const cfg = global.SOURCE_CONVERTER
    const $Minecraft = Java.loadClass('net.minecraft.client.Minecraft')
    const $GogglesItem = Java.loadClass('com.simibubi.create.content.equipment.goggles.GogglesItem')
    const $MachineBlockEntity = Java.loadClass('com.lowdragmc.mbd2.common.blockentity.MachineBlockEntity')
    const $BlockHitResult = Java.loadClass('net.minecraft.world.phys.BlockHitResult')
    const $CompoundTag = Java.loadClass('net.minecraft.nbt.CompoundTag')
    const $RenderGuiLayerPost = Java.loadClass('net.neoforged.neoforge.client.event.RenderGuiLayerEvent$Post')
    const $CreateConfigs = Java.loadClass('com.simibubi.create.infrastructure.config.AllConfigs')
    const $CreateGui = Java.loadClass('com.simibubi.create.foundation.gui.RemovedGuiUtils')
    const $CreateLang = Java.loadClass('com.simibubi.create.foundation.utility.CreateLang')
    const $AllItems = Java.loadClass('com.simibubi.create.AllItems')
    const $CreateMods = Java.loadClass('com.simibubi.create.compat.Mods')
    const $GuiGameElement = Java.loadClass('net.createmod.catnip.gui.element.GuiGameElement')
    const $BoxElement = Java.loadClass('net.createmod.catnip.gui.element.BoxElement')
    const $Color = Java.loadClass('net.createmod.catnip.theme.Color')
    const $ArrayList = Java.loadClass('java.util.ArrayList')
    const drawTooltip = 'drawHoveringText(net.minecraft.client.gui.GuiGraphics,java.util.List,int,int,int,int,int,int,int,int,net.minecraft.client.gui.Font)'
    let target = null
    let nextPoll = 0
    let tick = 0
    let hoverTicks = 0
    const lines = new $ArrayList()
    let renderFailed = false

    function clear() {
        target = null
        nextPoll = 0
        hoverTicks = 0
        lines.clear()
    }

    function matchesTarget(data) {
        return target != null && String(data.getString('dimension')) === target.dimension &&
            data.getInt('x') === target.pos.getX() && data.getInt('y') === target.pos.getY() && data.getInt('z') === target.pos.getZ()
    }

    ClientEvents.loggedOut(() => clear())
    ClientEvents.tick(event => {
        tick++
        const client = event.getClient()
        if (renderFailed || client.player == null || client.level == null || client.screen != null || client.options.hideGui ||
            client.player.isSpectator() ||
            !$GogglesItem.isWearingGoggles(client.player) || !(client.hitResult instanceof $BlockHitResult) ||
            String(client.hitResult.getType()) !== 'BLOCK') {
            clear()
            return
        }
        const pos = client.hitResult.getBlockPos()
        const blockEntity = client.level.getBlockEntity(pos)
        if (!(blockEntity instanceof $MachineBlockEntity) || String(blockEntity.getMetaMachine().getDefinition().id()) !== cfg.MACHINE_ID) {
            clear()
            return
        }
        // KubeJS 的 dimension 属性是 ResourceLocation，原生 dimension() 已被重映射。
        const dimension = String(client.level.getDimension())
        if (target == null || target.dimension !== dimension || !target.pos.equals(pos)) {
            clear()
            target = { dimension: dimension, pos: pos.immutable() }
        }
        if (tick < nextPoll) return
        nextPoll = tick + cfg.HUD_POLL_TICKS
        const request = new $CompoundTag()
        request.putString('dimension', dimension)
        request.putInt('x', pos.getX())
        request.putInt('y', pos.getY())
        request.putInt('z', pos.getZ())
        client.player.sendData(cfg.HUD_REQUEST, request)
    })

    NetworkEvents.dataReceived(cfg.HUD_RESPONSE, event => {
        const data = event.getData()
        if (!matchesTarget(data)) return
        lines.clear()
        // 按 LangBuilder.forGoggles/getIndents 为图标留 16px；不让泛型 List 转换丢失新增行。
        const padding = ' '.repeat(Math.ceil(16 / Math.max(1, $Minecraft.getInstance().font.width(' '))))
        lines.add($CreateLang.builder().text(padding)['add(net.minecraft.network.chat.Component)'](
            Text.translate('goggles.gugucraft.source_converter.source', data.getInt('source'), data.getInt('source_capacity'))
        ).component())
    })

    // 按实装 Create 6.0.10 的 GoggleOverlayRenderer.renderOverlay 调用原生 Tooltip 和图标渲染器。
    // 普通 MBD2 方块没有 IHaveGoggleInformation 接口，在 Create 护目镜图层后提供这一行数据。
    function renderOverlay(event) {
        const client = $Minecraft.getInstance()
        if (target == null || lines.isEmpty() || client.player == null || client.level == null ||
            client.player.isSpectator() ||
            client.screen != null || client.options.hideGui || !$GogglesItem.isWearingGoggles(client.player) ||
            !(client.hitResult instanceof $BlockHitResult) || String(client.hitResult.getType()) !== 'BLOCK' ||
            target.dimension !== String(client.level.getDimension()) || !target.pos.equals(client.hitResult.getBlockPos())) return
        const graphics = event.getGuiGraphics()
        const font = client.font
        const screenWidth = graphics.guiWidth()
        const screenHeight = graphics.guiHeight()
        const createConfig = $CreateConfigs.client()
        const x = Math.min(Math.floor(screenWidth / 2) + createConfig.overlayOffsetX.get(), screenWidth - font.width(lines.get(0)) - 20)
        const y = Math.min(Math.floor(screenHeight / 2) + createConfig.overlayOffsetY.get(), screenHeight - 8 - 20)
        const fade = Math.max(0, Math.min((++hoverTicks + event.getPartialTick().getGameTimeDeltaPartialTick(false)) / 24, 1))
        const customColor = createConfig.overlayCustomColor.get()
        const background = customColor ? new $Color(createConfig.overlayBackgroundColor.get()) : $BoxElement.COLOR_VANILLA_BACKGROUND.scaleAlpha(0.75)
        const top = customColor ? new $Color(createConfig.overlayBorderColorTop.get()) : $BoxElement.COLOR_VANILLA_BORDER.getFirst().copy()
        const bottom = customColor ? new $Color(createConfig.overlayBorderColorBot.get()) : $BoxElement.COLOR_VANILLA_BORDER.getSecond().copy()
        const pose = graphics.pose()
        pose.pushPose()
        try {
            if (fade < 1) {
                pose['translate(double,double,double)'](Math.pow(1 - fade, 3) * Math.sign(createConfig.overlayOffsetX.get() + 0.5) * 8, 0, 0)
                background.scaleAlpha(fade)
                top.scaleAlpha(fade)
                bottom.scaleAlpha(fade)
            }
            $GuiGameElement['of(net.minecraft.world.item.ItemStack)']($AllItems.GOGGLES.asStack()).at(x + 10, y - 16, 450).render(graphics)
            if ($CreateMods.MODERNUI.isLoaded()) {
                // 与 Create 的 ModernUI 分支相同：临时对齐鼠标像素，绘制后恢复。
                const mouse = client.mouseHandler
                const scale = client.getWindow().getGuiScale()
                const cursorX = mouse.xpos()
                const cursorY = mouse.ypos()
                try {
                    mouse['create$setXPos'](Math.round(cursorX / scale) * scale)
                    mouse['create$setYPos'](Math.round(cursorY / scale) * scale)
                    $CreateGui[drawTooltip](graphics, lines, x, y, screenWidth, screenHeight, -1, background.getRGB(), top.getRGB(), bottom.getRGB(), font)
                } finally {
                    mouse['create$setXPos'](cursorX)
                    mouse['create$setYPos'](cursorY)
                }
            } else {
                $CreateGui[drawTooltip](graphics, lines, x, y, screenWidth, screenHeight, -1, background.getRGB(), top.getRGB(), bottom.getRGB(), font)
            }
        } finally {
            pose.popPose()
        }
    }

    NativeEvents.onEvent($RenderGuiLayerPost, event => {
        if (renderFailed || String(event.getName()) !== 'create:goggle_info') return
        // NativeEventWrapper.Listeners.accept 直接调用 Consumer，不会像 KubeJS 事件那样捕获脚本异常。
        // 渲染失败后停止本信息框并仅记录一次，避免异常冒出渲染线程导致客户端崩溃。
        try {
            renderOverlay(event)
        } catch (error) {
            renderFailed = true
            clear()
            console.error('[Source Converter] 护目镜信息框渲染失败，已停用至客户端脚本重新加载：' + String(error))
        }
    })
})()
