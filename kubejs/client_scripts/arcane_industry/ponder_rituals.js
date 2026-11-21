// Arcane Industry: Ponder scenes for the summoning circle (Ponder for KubeJS 2.4.0), see "Recipe rework · summoning circle Ponder scenes" in the design doc
// The ritual table is shared with the server-side Lychee recipes: RITUALS in startup_scripts/arcane_industry/00_config.js
// The scenes use PonderJS's built-in ponderjs:basic structure (5x5 base plate at y = 0); the ritual layer is y = 1, centered on (2, 1, 2)
(() => {
    const arcane = global.ARCANE_INDUSTRY
    const ESSENCE = 'ars_nouveau:conjuration_essence'
    const TAG_ID = 'kubejs:summoning_circle'

    // Ponder draws texts as plain strings, so § formatting codes work; & is turned into §. Each text is a translation key
    // with an English fallback; the Chinese texts are in kubejs/assets/kubejs/lang/zh_cn.json. The wording follows the quests
    // (voice of the Arcane Industry department): &a items / creatures, &b processes, &5 things from the deep, &c the closing quip.
    // Item names are passed as translatable arguments (%s), so they follow the client language
    const C = text => text.replace(/&([0-9a-fk-or])/g, '§$1')
    const T = (key, english, a, b) => {
        const k = `kubejs.ponder.summoning_circle.${key}`
        if (a === undefined) return Text.translatableWithFallback(k, C(english))
        if (b === undefined) return Text.translatableWithFallback(k, C(english), a)
        return Text.translatableWithFallback(k, C(english), a, b)
    }
    const nameOf = id => Item.of(id).getHoverName()
    // Scene titles are plain strings registered before the language files load: English from the item id here,
    // Chinese via the kubejs.ponder.summoning_circle_<id>.header keys in zh_cn.json
    const titleOf = id => id.split(':')[1].split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')

    // Closing quip of each scene (like the &c paragraph at the end of the quest texts)
    const QUIPS = {
        whirlisprig_charm: 'Once it lands, the Whirlisprig considers the whole field its own. Please notify the Agriculture Department in advance.',
        starbuncle_charm: 'Starbuncles have an inexplicable fixation on gold blocks. Please lock the vault separately.',
        drygmy_charm: 'The Drygmy took the four Containment Jars as a dorm deposit. The deposit is non-refundable.',
        alakarkinos_charm: 'Do not mourn the broken pot. The Alakarkinos says it was its job interview.',
        bookwyrm_charm: 'The Bookwyrm helps itself to books from the shelves as a midnight snack. The library has already called the guards.',
        wixie_charm: 'The Wixie brings its own recipe book, but never lets you see it.',
        amethyst_golem_charm: 'It is deeply attached to amethyst. Please do not break clusters in front of it.',
        warden_seal: 'Human Resources has handled the resignation paperwork for the four Wardens. Please do not ask where they went.'
    }

    const $ParticleTypes = Java.loadClass('net.minecraft.core.particles.ParticleTypes')
    const $CompoundTag = Java.loadClass('net.minecraft.nbt.CompoundTag')
    const stateOf = id => Block.getBlock(id).defaultBlockState()

    const buildScene = ritual => (scene, util) => {
        // PonderJS remaps accessors such as select() / world() to getters (RemapForJS), so scripts access them as properties
        const select = util.select
        const vec = util.vector
        const world = scene.world
        const overlay = scene.overlay
        const effects = scene.effects
        const warden = !!ritual.cornerEntity
        const hands = ritual.hands || arcane.RITUAL_DEFAULT_HANDS

        const CENTER = select.position(2, 1, 2)
        const PEDESTALS = [[2, 1, 0], [0, 1, 2], [4, 1, 2], [2, 1, 4]]
        const CORNER_POS = [[0, 1, 0], [4, 1, 0], [0, 1, 4], [4, 1, 4]]
        let ring = select.fromTo(1, 0, 1, 3, 0, 3).substract(select.position(2, 0, 2))
        let corners = select.position(0, 1, 0)
        CORNER_POS.slice(1).forEach(p => { corners = corners.add(select.position(p[0], p[1], p[2])) })
        const centerTop = vec.topOf(2, 1, 2)

        // Swap in the base plate blocks that "drop in" first and show the rest of the plate; never hideSection a shown plate (Ponder crashes on empty sections)
        const below = select.position(2, 0, 2)
        const whirlisprig = ritual.id === 'whirlisprig_charm'
        world.setBlocks(ring, stateOf('ars_nouveau:sourcestone'), false)
        if (whirlisprig) world.setBlocks(below, stateOf('minecraft:moss_block'), false)
        let plate = select.layer(0).substract(ring)
        if (whirlisprig) plate = plate.substract(below)
        world.showSection(plate, Direction.UP)
        scene.idle(10)

        if (ritual.ancientCity) {
            scene.text(70, T('ancient_city', 'This ritual only answers to the aura of an &5Ancient City&f. Move the whole circle into an Ancient City before starting. Yes, the four Wardens too.'), vec.topOf(2, 0, 2)).attachKeyFrame()
            scene.idle(80)
        }

        // 1. Sourcestone ring (drops in from above)
        world.showSection(ring, Direction.DOWN)
        scene.idle(15)
        overlay.showOutline(PonderPalette.GREEN, 'ring', ring, 70)
        scene.text(70, T('ring', 'The foundation of the circle is a ring of &aSourcestone&f: all 8 blocks around the spot below the center must be filled. Miss one, and the summoned creature stands you up.'), vec.topOf(1, 0, 1))
            .placeNearTarget().attachKeyFrame()
        scene.idle(80)

        if (whirlisprig) {
            world.showSection(below, Direction.DOWN)
            scene.idle(10)
            scene.text(70, T('azalea', '&aFlowering Azalea&f only takes root on dirt-like blocks, so the block right below the center is spared and need not be Sourcestone.'), vec.topOf(2, 0, 2))
                .placeNearTarget()
            scene.idle(80)
        }

        // 2. Arcane Pedestals
        PEDESTALS.forEach(p => {
            let s = select.position(p[0], p[1], p[2])
            world.setBlocks(s, stateOf('ars_nouveau:arcane_pedestal'), false)
            world.showSection(s, Direction.DOWN)
            scene.idle(5)
        })
        scene.text(60, T('pedestals', 'Place an &aArcane Pedestal&f at the middle of each side. They are only there for show and are returned intact after the ritual.'), vec.topOf(2, 1, 0))
            .placeNearTarget().attachKeyFrame()
        scene.idle(70)

        // 3. Corner blocks
        world.setBlocks(corners, stateOf(ritual.corner), false)
        if (warden) {
            world.modifyBlockEntityNBT(corners, nbt => {
                const entity = new $CompoundTag()
                entity.putString('id', ritual.cornerEntity)
                nbt.put('entityTag', entity)
            })
        }
        world.showSection(corners, Direction.DOWN)
        scene.idle(15)
        overlay.showOutline(PonderPalette.GREEN, 'corners', corners, 70)
        let cornerText
        if (warden) cornerText = T('corners.warden', 'Put a &aContainment Jar&f holding a &5Warden&f in each corner. Yes, four of them, not one fewer. The ritual takes the jars along with their guests.')
        else if (ritual.id === 'drygmy_charm') cornerText = T('corners.drygmy', 'Put a &aContainment Jar&f in each corner. Empty jars are fine; the Drygmy only wants to know there is somewhere to live. The ritual takes them.')
        else cornerText = T('corners', 'Put &a%s&f in each corner as a welcome gift for the summoned creature. The ritual takes them.', nameOf(ritual.corner))
        scene.text(70, cornerText, vec.topOf(0, 1, 0)).placeNearTarget().attachKeyFrame()
        scene.idle(80)

        // 4. Center block
        world.setBlocks(CENTER, stateOf(ritual.center), false)
        world.showSection(CENTER, Direction.DOWN)
        scene.idle(15)
        scene.text(60, T('center', 'Place &a%s&f in the center as the offering. The ritual consumes it.', nameOf(ritual.center)), centerTop)
            .placeNearTarget().attachKeyFrame()
        scene.idle(70)

        // 5. Right-click
        scene.showControls(60, centerTop, PonderPointing.DOWN).rightClick().withItem(Item.of(hands[0]))
        if (hands.length > 1) {
            scene.text(60, T('use.two_hands', 'Hold &a%s&f in your main hand and &a%s&f in your off hand, then right-click the center block. Please do not sneeze while doing so.', nameOf(hands[0]), nameOf(hands[1])), centerTop).placeNearTarget().attachKeyFrame()
        } else {
            scene.text(60, T('use.one_hand', 'Right-click the center block with &a%s&f to begin the summoning.', nameOf(hands[0])), centerTop).placeNearTarget().attachKeyFrame()
        }
        scene.idle(70)

        // 6. Done
        world.setBlocks(CENTER, stateOf('minecraft:air'), true)
        if (!ritual.keepCorners) world.setBlocks(corners, stateOf('minecraft:air'), true)
        const centerVec = vec.centerOf(2, 1, 2)
        if (warden) {
            effects.emitParticles(centerVec, effects.simpleParticleEmitter($ParticleTypes.SCULK_SOUL, vec.of(0, 0.05, 0)), 4, 10)
            effects.emitParticles(vec.of(2.5, 2, 2.5), effects.simpleParticleEmitter($ParticleTypes.SONIC_BOOM, vec.of(0, 0, 0)), 1, 1)
        } else {
            effects.emitParticles(centerVec, effects.simpleParticleEmitter($ParticleTypes.SOUL_FIRE_FLAME, vec.of(0, 0.05, 0)), 4, 10)
        }
        world.createItemEntity(centerVec, vec.of(0, 0.3, 0), Item.of(ritual.result))
        scene.idle(10)
        const done = warden
            ? T('done.warden', 'Ritual complete: the center and the four Wardens are gone, and in exchange you get &a%s&f. Keep the pedestals and Sourcestone for next time.', nameOf(ritual.result))
            : T('done', 'Ritual complete: the center and the corners are gone, and in exchange you get &a%s&f. Keep the pedestals and Sourcestone for next time.', nameOf(ritual.result))
        scene.text(80, done, centerTop).placeNearTarget().attachKeyFrame()
        scene.idle(90)
        scene.text(70, T(`quip.${ritual.id}`, `&c${QUIPS[ritual.id]}`), vec.topOf(2, 0, 4)).placeNearTarget()
        scene.idle(80)
    }

    Ponder.registry(event => {
        arcane.RITUALS.forEach(ritual => {
            // Both the result and Conjuration Essence get this scene: pressing W on Conjuration Essence shows every ritual
            event.create([ritual.result, ESSENCE])
                .scene(`summoning_circle_${ritual.id}`, `Summoning Circle: ${titleOf(ritual.result)}`, buildScene(ritual))
        })
    })

    Ponder.tags(event => {
        event.createTag(TAG_ID, ESSENCE, 'Summoning Circle', 'Rituals laid out with Sourcestone and Arcane Pedestals and guided by Conjuration Essence',
            arcane.RITUALS.map(r => r.result).concat([ESSENCE]))
    })
})()
