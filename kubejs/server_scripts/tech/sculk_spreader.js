// Runtime logic of the M6 Sculk Spreader (machine registration in startup_scripts/arcane_industry/sculk_spreader.js)
// - Before a batch: the block directly below must be an Activated Sculk Catalyst with Deepslate around it on its layer, or the batch is rejected (no ingredients consumed)
// - On finish: up to CONVERT_PER_BATCH random Deepslate blocks turn into Sculk; with air above, a Sensor / Shrieker may grow by chance
// - Sculk Seal (M12): the dedicated recipe also needs Sculk >= AWAKEN_SCULK_REQUIRED on the catalyst layer, sky light 0 and Y < AWAKEN_MAX_Y
(() => {
    const cfg = global.ARCANE_INDUSTRY.SCULK_SPREADER
    const $Blocks = Java.loadClass('net.minecraft.world.level.block.Blocks')
    const $SoundEvents = Java.loadClass('net.minecraft.sounds.SoundEvents')
    const $SoundSource = Java.loadClass('net.minecraft.sounds.SoundSource')
    const $ContentModifier = Java.loadClass('com.lowdragmc.mbd2.api.recipe.content.ContentModifier')
    const $IO = Java.loadClass('com.lowdragmc.mbd2.api.capability.recipe.IO')
    // Sculk Acoustics side quest "Sculk Spreader Upgrade": level 2 widens the spread area and the per-batch cap, Source and Experience Nuggets x INPUT_MULTIPLIER
    const mk2 = global.SCULK_ACOUSTICS.SCULK_SPREADER_MK2
    const isMk2 = machine => machine.getCustomData().getInt(mk2.LEVEL_KEY) >= 2
    const radiusOf = machine => isMk2(machine) ? mk2.RADIUS : cfg.RADIUS
    const convertPerBatchOf = machine => isMk2(machine) ? mk2.CONVERT_PER_BATCH : cfg.CONVERT_PER_BATCH

    // Vanilla effects (1.21.1 SculkSpreader / SculkBlock / LevelRenderer):
    // - Conversion: the server plays block.sculk.spread
    // - Level event 3006: data = strength << 6 spawns sculk charge particles along the block faces with a random charge sound; data = 0 is the depleted-charge burst particles + charge sound
    // - Growing a Sensor / Shrieker: play that block's place sound
    const SCULK_CHARGE_EVENT = 3006
    const CHARGE_FLOW = 1 << 6
    const CHARGE_POP = 0
    // Level.playSound with a null first argument cannot tell the Entity / Player overloads apart, so spell out the signature
    const PLAY_SOUND = 'playSound(net.minecraft.world.entity.player.Player,net.minecraft.core.BlockPos,net.minecraft.sounds.SoundEvent,net.minecraft.sounds.SoundSource,float,float)'
    const playSound = (level, pos, sound) => level[PLAY_SOUND](null, pos, sound, $SoundSource.BLOCKS, 1.0, 1.0)
    const $BuiltInRegistries = Java.loadClass('net.minecraft.core.registries.BuiltInRegistries')

    // KubeJS does not let scripts call equals on block objects, so compare registry IDs
    const blockId = state => String($BuiltInRegistries.BLOCK.getKey(state.getBlock()))

    const hasCore = machine => blockId(machine.getLevel().getBlockState(machine.getPos().below())) === cfg.CORE_BLOCK

    // Deepslate in the square of radius RADIUS (mk2.RADIUS at level 2) on the catalyst layer (excluding the catalyst itself)
    const findTargets = machine => {
        const level = machine.getLevel()
        const center = machine.getPos().below()
        const radius = radiusOf(machine)
        const targets = []
        for (let dx = -radius; dx <= radius; dx++) {
            for (let dz = -radius; dz <= radius; dz++) {
                if (dx === 0 && dz === 0) continue
                let pos = center.offset(dx, 0, dz)
                if (level.hasChunkAt(pos) && blockId(level.getBlockState(pos)) === 'minecraft:deepslate') {
                    targets.push(pos)
                }
            }
        }
        return targets
    }

    // Number of Sculk blocks within radius RADIUS on the catalyst layer
    const countSculk = machine => {
        const level = machine.getLevel()
        const center = machine.getPos().below()
        let count = 0
        for (let dx = -cfg.RADIUS; dx <= cfg.RADIUS; dx++) {
            for (let dz = -cfg.RADIUS; dz <= cfg.RADIUS; dz++) {
                if (dx === 0 && dz === 0) continue
                let pos = center.offset(dx, 0, dz)
                if (level.hasChunkAt(pos) && blockId(level.getBlockState(pos)) === 'minecraft:sculk') count++
            }
        }
        return count
    }

    const $LightLayer = Java.loadClass('net.minecraft.world.level.LightLayer')
    const canAwaken = machine => {
        const level = machine.getLevel()
        const pos = machine.getPos()
        return pos.getY() < cfg.AWAKEN_MAX_Y
            && level.getBrightness($LightLayer.SKY, pos) === 0
            && countSculk(machine) >= cfg.AWAKEN_SCULK_REQUIRED
    }

    const recipeId = recipe => recipe == null ? '' : String(recipe.id)
    const isSpreadRecipe = recipe => recipeId(recipe) === cfg.SPREAD_RECIPE_ID
    const isAwakenRecipe = recipe => recipeId(recipe) === cfg.AWAKEN_RECIPE_ID
    // Rate-limit each recipe separately: MBD2 tries matching recipes in turn while searching, and a shared timer would let one recipe block the next
    const nextCheckKey = recipe => `${cfg.NEXT_CHECK_KEY}/${recipeId(recipe)}`
    const clearNextChecks = machine => {
        const data = machine.getCustomData()
        data.remove(cfg.NEXT_CHECK_KEY)
        data.remove(nextCheckKey({ id: cfg.SPREAD_RECIPE_ID }))
        data.remove(nextCheckKey({ id: cfg.AWAKEN_RECIPE_ID }))
    }

    MBDMachineEvents.onLoad(cfg.MACHINE_ID, event => {
        const machine = event.event.machine
        if (machine.isRemote()) return
        clearNextChecks(machine)
        const logic = machine.getRecipeLogic()
        if (logic.isIdle()) logic.markLastRecipeDirty()
        machine.markDirty()
    })

    MBDMachineEvents.onAfterRecipeModify(cfg.MACHINE_ID, event => {
        const nativeEvent = event.event
        const recipe = nativeEvent.recipe
        const spread = isSpreadRecipe(recipe)
        if (!spread && !isAwakenRecipe(recipe)) return
        // Reject first and put the original recipe back once the checks pass, so a script error never starts a batch by mistake
        nativeEvent.setRecipe(null)
        const machine = nativeEvent.machine
        const data = machine.getCustomData()
        // KubeJS LevelMixin renames getGameTime to getTime; MBD2 retries over and over while idle, so check at most once per second
        const now = machine.getLevel().getTime()
        const key = nextCheckKey(recipe)
        if (data.getLong(key) > now) return
        data.putLong(key, now + cfg.CHECK_RETRY_TICKS)
        machine.markDirty()
        if (!hasCore(machine)) return
        if (spread ? findTargets(machine).length === 0 : !canAwaken(machine)) return
        // MBD2 re-modifies from the original recipe every batch (RecipeLogic.lastOriginRecipe), so multipliers never stack
        nativeEvent.setRecipe(spread && isMk2(machine)
            ? recipe.copy($ContentModifier.of(mk2.INPUT_MULTIPLIER, 0), false, $IO.IN)
            : recipe)
    })

    MBDMachineEvents.onBeforeRecipeWorking(cfg.MACHINE_ID, event => {
        const machine = event.event.machine
        if (machine.isRemote()) return
        clearNextChecks(machine)
        machine.markDirty()
    })

    MBDMachineEvents.onRecipeFinish(cfg.MACHINE_ID, event => {
        const nativeEvent = event.event
        if (!isSpreadRecipe(nativeEvent.recipe)) return
        const machine = nativeEvent.machine
        if (machine.isRemote()) return
        const level = machine.getLevel()
        const targets = findTargets(machine)
        // Random pick: the first N steps of Fisher-Yates
        const count = Math.min(convertPerBatchOf(machine), targets.length)
        for (let i = 0; i < count; i++) {
            let j = i + Math.floor(Math.random() * (targets.length - i))
            let pos = targets[j]
            targets[j] = targets[i]
            targets[i] = pos
            level.setBlockAndUpdate(pos, $Blocks.SCULK.defaultBlockState())
            playSound(level, pos, $SoundEvents.SCULK_BLOCK_SPREAD)
            level.levelEvent(SCULK_CHARGE_EVENT, pos, CHARGE_FLOW)
            let above = pos.above()
            if (level.getBlockState(above).isAir()) {
                let roll = Math.random()
                let growth = null
                if (roll < cfg.SHRIEKER_CHANCE) {
                    // Default state can_summon=false, so it never summons a Warden
                    growth = $Blocks.SCULK_SHRIEKER.defaultBlockState()
                } else if (roll < cfg.SHRIEKER_CHANCE + cfg.SENSOR_CHANCE) {
                    growth = $Blocks.SCULK_SENSOR.defaultBlockState()
                }
                if (growth != null) {
                    level.setBlockAndUpdate(above, growth)
                    playSound(level, pos, growth.getSoundType().getPlaceSound())
                }
            }
            // Each block depletes its charge in place
            level.levelEvent(SCULK_CHARGE_EVENT, pos, CHARGE_POP)
        }
    })

    MBDMachineEvents.onRecipeStatusChanged(cfg.MACHINE_ID, event => {
        const nativeEvent = event.event
        const machine = nativeEvent.machine
        // Back to idle, let MBD2 run the recipe modification again, rechecking the core and the Deepslate
        if (!machine.isRemote() && String(nativeEvent.getNewStatus().name()) === 'IDLE') {
            machine.getRecipeLogic().markLastRecipeDirty()
        }
    })
})()
