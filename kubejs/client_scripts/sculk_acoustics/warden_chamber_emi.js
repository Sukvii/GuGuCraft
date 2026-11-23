// Sculk Acoustics M10: EMI page of the Warden Resonance Chamber recipes (design doc F5 "M10 Warden Resonance Chamber · EMI recipe page")
// MBD2's default page is a placeholder without item slots, so this script builds the page for every recipe of the type:
// - Layout and textures follow Create's basin (mixing) page (create:textures/gui/jei/widgets.png, coordinates from AllGuiTextures / BasinCategory);
//   the Source line follows Ars Nouveau's EMI pages (ars_nouveau.source, bottom left, no shadow)
// - Only the band name and the Source line are written on the page; everything else is in hover tooltips (texts in kubejs/assets/kubejs/lang/zh_cn.json)
// - The page size is set on the recipe type in startup_scripts/sculk_acoustics/warden_chamber.js
// - EMI roles: Sculk Niter Powder = input, product = output (both bound by MBD2 through the element ids @item_import_0 / @item_export_0),
//   wool = catalyst; the kinetic input and Calibrated Sculk Sensor icons are display only (still R / U searchable on hover)
// - Center: the formed chamber in a small 3D scene (LDLib2 Scene with a dummy world holding only the controller, set to formed;
//   its formed renderer draws the whole jar model and, outside the real world, the Warden too; see client_scripts/sculk_acoustics/warden_chamber.js)
(() => {
    const cfg = global.SCULK_ACOUSTICS.WARDEN_CHAMBER
    const WIDGETS = 'create:textures/gui/jei/widgets.png'
    // Band name colors: low = gleam cyan, high = bright Resonarium blue; the Source line is Ars Nouveau's near black
    const LOW_COLOR = 0xFF3A8A9A | 0
    const HIGH_COLOR = 0xFF32C0F4 | 0
    const SOURCE_COLOR = 0xFF00000A | 0

    // Classes are loaded on first use (when EMI builds its recipe list), not when client scripts load
    let java = null
    const J = () => {
        if (java) return java
        java = {
            UI: Java.loadClass('com.lowdragmc.lowdraglib2.gui.ui.UI'),
            UIElement: Java.loadClass('com.lowdragmc.lowdraglib2.gui.ui.UIElement'),
            ItemSlot: Java.loadClass('com.lowdragmc.lowdraglib2.gui.ui.elements.ItemSlot'),
            Label: Java.loadClass('com.lowdragmc.lowdraglib2.gui.ui.elements.Label'),
            SpriteTexture: Java.loadClass('com.lowdragmc.lowdraglib2.gui.texture.SpriteTexture'),
            IGuiTexture: Java.loadClass('com.lowdragmc.lowdraglib2.gui.texture.IGuiTexture'),
            ScrollDataSource: Java.loadClass('com.lowdragmc.lowdraglib2.gui.sync.bindings.impl.ScrollDataSource'),
            IngredientIO: Java.loadClass('com.lowdragmc.lowdraglib2.integration.xei.IngredientIO'),
            Scene: Java.loadClass('com.lowdragmc.lowdraglib2.gui.ui.elements.Scene'),
            TrackedDummyWorld: Java.loadClass('com.lowdragmc.lowdraglib2.utils.virtuallevel.TrackedDummyWorld'),
            BlockInfo: Java.loadClass('com.lowdragmc.lowdraglib2.utils.data.BlockInfo'),
            BlockStateParser: Java.loadClass('net.minecraft.commands.arguments.blocks.BlockStateParser'),
            BuiltInRegistries: Java.loadClass('net.minecraft.core.registries.BuiltInRegistries'),
            BlockPos: Java.loadClass('net.minecraft.core.BlockPos'),
            Vector3f: Java.loadClass('org.joml.Vector3f'),
            Lighting: Java.loadClass('com.mojang.blaze3d.platform.Lighting'),
            ArrayList: Java.loadClass('java.util.ArrayList'),
            ResourceLocation: Java.loadClass('net.minecraft.resources.ResourceLocation')
        }
        return java
    }

    // Numbers are passed as strings so they are never formatted as doubles ("4096.0")
    const T = (key, english, a, b) => {
        const k = `kubejs.emi.warden_resonance.${key}`
        if (a === undefined) return Text.translatableWithFallback(k, english)
        if (b === undefined) return Text.translatableWithFallback(k, english, String(a))
        return Text.translatableWithFallback(k, english, String(a), String(b))
    }
    const gray = component => Text.gray(component)

    // Sprite of Create's JEI widget sheet
    const sprite = (x, y, w, h) => J().SpriteTexture.of(J().ResourceLocation.parse(WIDGETS)).setSprite(x, y, w, h)

    // Absolute placement inside the page (LDLib2 hides positionType from scripts, so it goes through the LSS property)
    const place = (element, x, y, w, h) => {
        element.lss('position', 'absolute')
        const layout = element.getLayout()
        layout.left(x)
        layout.top(y)
        layout.width(w)
        layout.height(h)
        return element
    }

    // One line at a time: Tooltips.of(List) / of(Component...) are ambiguous to Rhino for a Java list
    const setTooltips = (element, lines) => {
        lines.forEach(line => element.getStyle().appendTooltips(line))
        return element
    }

    const panel = (x, y, w, h, texture) => {
        const element = place(new (J().UIElement)(), x, y, w, h)
        if (texture) element.getStyle().backgroundTexture(texture)
        return element
    }

    // Display-only item icon: no slot frame, only our tooltip lines (the item's own tooltip is replaced)
    const icon = (x, y, size, stack, lines, hoverOverlay) => {
        const slot = place(new (J().ItemSlot)(), x, y, size, size)
        slot.getLayout().paddingAll(0)
        slot.getStyle().backgroundTexture(J().IGuiTexture.EMPTY)
        slot.slotStyle(style => {
            style.showItemTooltips(false)
            if (!hoverOverlay) style.hoverOverlay(J().IGuiTexture.EMPTY)
        })
        slot.setItem(stack)
        return setTooltips(slot, [stack.getHoverName()].concat(lines))
    }

    const label = (x, y, w, text, color) => {
        const element = place(new (J().Label)(), x, y, w, 9)
        element.setText(text)
        element.textStyle(style => {
            style.textColor(color)
            style.textShadow(false)
        })
        return element
    }

    // Formed chamber preview: orthographic, like the machines on Create's pages: mostly the front, turned 30 degrees to show the right side, seen slightly from above.
    // The controller sits at the front middle of a 3 x 3 x 5 box, facing north; yaw -90 looks straight at the north face, -120 also shows the west face on the right.
    // Pixels per block = size / zoom (orthographic range 0.5), so 80 / 7.3 is about 11 px: the machine is about 45 x 67 px.
    // The scene is square and wider than the machine because its depth clipping range equals half its width (the box corners reach about 3 blocks deep)
    const PREVIEW = { x: 67, y: 0, size: 80, zoom: 7.3, yaw: -120, pitch: 20, lowAgitation: 15, highAgitation: 60 }
    const buildPreview = (scene, high) => {
        const world = new (J().TrackedDummyWorld)()
        const pos = new (J().BlockPos)(1, 64, 0)
        const state = J().BlockStateParser.parseForBlock(J().BuiltInRegistries.BLOCK.asLookup(), `${cfg.MACHINE_ID}[facing=north]`, false).blockState()
        world.addBlock(pos, J().BlockInfo.fromBlockState(state))
        const machine = world.getBlockEntity(pos).getMetaMachine()
        // The Warden in the jar shows the band through its heartbeat: calm on the low band page, agitated on the high band page
        machine.getCustomData().putInt(cfg.AGITATION_KEY, high ? PREVIEW.highAgitation : PREVIEW.lowAgitation)
        machine.setFormed(true)

        scene.useOrtho(true)
        scene.setDraggable(false)
        scene.setScalable(false)
        scene.setIntractable(false)
        scene.setRenderFacing(false)
        scene.setRenderSelect(false)
        // The scene sets up no lighting of its own, so the models were lit by whatever the GUI last used (flat, wrong direction).
        // Use the world's diffuse lighting (top brightest, north / south faces brighter than east / west, matching block face shading),
        // then restore the GUI's 3D item lighting, which item icons drawn later rely on. Both hooks must be set before createScene
        scene.setBeforeWorldRender(() => J().Lighting.setupLevel())
        scene.setAfterWorldRender(() => J().Lighting.setupFor3DItems())
        scene.createScene(world)
        const core = new (J().ArrayList)()
        core.add(pos)
        scene.setRenderedCore(core, null, false)
        scene.setOrthoRange(0.5)
        scene.setZoom(PREVIEW.zoom)
        scene.setCameraYawAndPitch(PREVIEW.yaw, PREVIEW.pitch)
        scene.setCenter(new (J().Vector3f)(1.5, 66.5, 1.5))
    }

    const buildPage = recipe => {
        const high = String(recipe.id) === cfg.HIGH_RECIPE_ID
        const band = high ? 'high' : 'low'
        const signal = high ? cfg.HIGH_SIGNAL : cfg.LOW_SIGNAL
        const bandName = high ? T('band.high', 'High Frequency') : T('band.low', 'Low Frequency')
        const bandTip = high
            ? T('band.high.tooltip', 'High frequency while the controller receives a redstone signal of %s-%s', signal[0], signal[1])
            : T('band.low.tooltip', 'Low frequency while the controller receives a redstone signal of %s-%s', signal[0], signal[1])

        const root = new (J().UIElement)()
        root.getLayout().width(cfg.EMI_WIDTH)
        root.getLayout().height(cfg.EMI_HEIGHT)

        // Top left: kinetic input (stress); top right: question mark (working conditions)
        root.addChild(icon(6, 6, 16, Item.of(cfg.KINETIC_INPUT_ID), [
            gray(T('stress', 'Needs %s su of stress, at least %s RPM', cfg.STRESS, cfg.STRESS / cfg.STRESS_PER_RPM))
        ], true))
        root.addChild(setTooltips(panel(158, 6, 12, 16, sprite(0, 178, 12, 16)), [
            T('condition.otherside', 'Only works in the Otherside'),
            T('condition.dark', 'No light may reach the jar'),
            T('condition.warden', 'The jar must hold a Warden')
        ]))

        // Input: Sculk Niter Powder (Create's input slot position for a single ingredient)
        const input = place(new (J().ItemSlot)(), 35, 50, 18, 18)
        input.setId('@item_import_0')
        input.getStyle().backgroundTexture(sprite(0, 0, 18, 18))
        root.addChild(input)

        // Center: the formed chamber over Create's shadow. The scene is built on its first tick (ticks run on the render thread while the page is shown),
        // not here: EMI also builds these pages on its reload thread just to read the ingredients. If building fails, the enlarged controller icon is shown instead
        const controllerTip = [Item.of(cfg.MACHINE_ID).getHoverName(), gray(T('batch', '%s seconds per batch', recipe.duration / 20))]
        root.addChild(panel(81, 68, 52, 11, sprite(0, 56, 52, 11)))
        const fallback = icon(87, 28, 40, Item.of(cfg.MACHINE_ID), controllerTip.slice(1), false)
        // Explicit signature: KubeJS can also turn a boolean into the YogaDisplay / TaffyDisplay overloads
        fallback['setDisplay(boolean)'](false)
        const scene = place(new (J().Scene)(), PREVIEW.x, PREVIEW.y, PREVIEW.size, PREVIEW.size)
        let built = false
        scene.addEventListener('tick', () => {
            if (built) return
            built = true
            try {
                buildPreview(scene, high)
            } catch (e) {
                console.error(`[WardenChamber] EMI preview failed: ${e}`)
                fallback['setDisplay(boolean)'](true)
            }
        })
        root.addChild(scene)
        root.addChild(fallback)
        // The scene is wider than the machine (see PREVIEW); the tooltip only covers the machine itself
        root.addChild(setTooltips(panel(84, 6, 46, 70), controllerTip))

        // Output: Create's chance slot frame, since the actual count changes with agitation
        root.addChild(panel(136, 32, 18, 14, sprite(0, 21, 18, 14)))
        const output = place(new (J().ItemSlot)(), 141, 50, 18, 18)
        output.setId('@item_export_0')
        output.getStyle().backgroundTexture(sprite(20, 156, 18, 18))
        root.addChild(output)

        // Bottom: band bar with the band name, the Calibrated Sculk Sensor and the wool catalyst slot. Create's "no heat" bar (JEI_NO_HEAT_BAR):
        // its bottom edge is closed, and the opening in its top edge sits right under the machine and its shadow (Create pairs it with JEI_SHADOW the same way)
        const bar = setTooltips(panel(4, 80, 169, 19, sprite(0, 221, 169, 19)), [bandTip])
        bar.addChild(label(5, 6, 120, bandName, high ? HIGH_COLOR : LOW_COLOR))
        root.addChild(bar)
        root.addChild(icon(134, 81, 16, Item.of(cfg.CALIBRATED_SENSOR), [gray(bandTip)], true))

        const woolItems = new (J().ArrayList)()
        // KubeJS hides Ingredient.getItems(); getStackArray() is its script-side equivalent
        const woolStacks = Ingredient.of('#minecraft:wool').getStackArray()
        for (let i = 0; i < woolStacks.length; i++) woolItems.add(woolStacks[i])
        const wool = place(new (J().ItemSlot)(), 152, 80, 18, 18)
        wool.getStyle().backgroundTexture(sprite(0, 156, 18, 18))
        if (!woolItems.isEmpty()) wool.setItem(woolItems.get(0))
        if (woolItems.size() > 1) wool.bindDataSource(J().ScrollDataSource.of(woolItems))
        wool.xeiRecipeIngredient(J().IngredientIO.CATALYST, () => woolItems.stream())
        wool.xeiRecipeSlot(J().IngredientIO.CATALYST, 1, 1, () => woolItems.stream())
        root.addChild(setTooltips(wool, [gray(T('wool', 'Optional: lowers agitation when fed in'))]))

        // Source line (same place and style as Ars Nouveau's EMI pages)
        root.addChild(label(0, cfg.EMI_HEIGHT - 10, cfg.EMI_WIDTH, Text.translatable('ars_nouveau.source', String(cfg.SOURCE_PER_BATCH)), SOURCE_COLOR))

        return { root, output, band }
    }

    MBDRecipeTypeEvents.onRecipeUI(cfg.RECIPE_TYPE, event => {
        const nativeEvent = event.event
        const recipe = nativeEvent.recipe
        const page = buildPage(recipe)
        // Explicit signature: UI.of also has varargs overloads that a single argument could match
        const ui = J().UI['of(com.lowdragmc.lowdraglib2.gui.ui.UIElement)'](page.root)
        // Let MBD2 fill the input / output slots from the recipe contents (item, count, EMI role)
        recipe.recipeType.bindXEIRecipeUI(ui, recipe)
        page.output.getStyle().appendTooltips(gray(T('yield', 'The actual yield changes with agitation')))
        if (page.band === 'high') page.output.getStyle().appendTooltips(gray(T('yield.too_calm', 'No nuclei while the Warden is too calm')))
        nativeEvent.ui = ui
    })
})()
