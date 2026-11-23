// Sculk Acoustics M10: runtime logic of the Warden Resonance Chamber (machine registration in startup_scripts/sculk_acoustics/warden_chamber.js)
// - Bands: a redstone signal of 1-7 at the controller is the low band (Warden Carapace), 8-15 the high band (Resonance Nucleus), told apart by the recipe redstone condition;
//   decided only when a batch starts: a signal change midway lets the batch finish, and the next batch picks its band from the signal at that time
//   (GuGuAddons makes the redstone condition also read the signals at the bottom-layer ports, taking the strongest; comparators can read agitation from the ports too)
// - Before a batch: formed, not cooling down, in the Otherside, the jar holds a Warden, block light 0 above the jar (inside the structure); a batch that would push agitation over the threshold is voided
// - Yield from the agitation at the start of a batch (the fraction rounds up by chance): low band x (1 + agitation / 50);
//   high band (agitation - 35) / 15, nothing at or below 35 (the batch still consumes its inputs); after a batch the low band gives -5, the high band +15
// - Agitation decays by 1 every 10 seconds (slow; wool and the low band are the main ways down); one wool per second is taken from the wool slot for -10; comparator output = agitation / 100 x 15
// - Voiding: the batch's Sculk Niter Powder is consumed, agitation drops to 20, the machine cools down for 60 seconds, and the Warden in the jar roars
// - Agitation and roar time are stored in the machine custom data (synced to the client to render the Warden in the jar)
(() => {
    const cfg = global.SCULK_ACOUSTICS.WARDEN_CHAMBER
    const $ContentModifier = Java.loadClass('com.lowdragmc.mbd2.api.recipe.content.ContentModifier')
    const $MBDRecipe = Java.loadClass('com.lowdragmc.mbd2.api.recipe.MBDRecipe')
    const $ArrayList = Java.loadClass('java.util.ArrayList')
    const $HashMap = Java.loadClass('java.util.HashMap')
    const $IO = Java.loadClass('com.lowdragmc.mbd2.api.capability.recipe.IO')
    const $Direction = Java.loadClass('net.minecraft.core.Direction')
    const $LightLayer = Java.loadClass('net.minecraft.world.level.LightLayer')
    const $SoundEvents = Java.loadClass('net.minecraft.sounds.SoundEvents')
    const $SoundSource = Java.loadClass('net.minecraft.sounds.SoundSource')
    const $BuiltInRegistries = Java.loadClass('net.minecraft.core.registries.BuiltInRegistries')
    const $ProxyPartBlockEntity = Java.loadClass('com.lowdragmc.mbd2.api.blockentity.ProxyPartBlockEntity')
    const $MobJarData = Java.loadClass('com.hollingsworth.arsnouveau.common.items.data.MobJarData')
    const $JarComponent = Java.loadClass('com.hollingsworth.arsnouveau.setup.registry.DataComponentRegistry').MOB_JAR.get()
    const PLAY_SOUND = 'playSound(net.minecraft.world.entity.player.Player,net.minecraft.core.BlockPos,net.minecraft.sounds.SoundEvent,net.minecraft.sounds.SoundSource,float,float)'
    const OTHERSIDE = global.SCULK_ACOUSTICS.DIMENSION
    const WOOL = Ingredient.of('#minecraft:wool')

    const recipeId = recipe => recipe == null ? '' : String(recipe.id)
    const isChamberRecipe = recipe => {
        const id = recipeId(recipe)
        return id === cfg.LOW_RECIPE_ID || id === cfg.HIGH_RECIPE_ID
    }
    const deltaOf = recipe => recipeId(recipe) === cfg.HIGH_RECIPE_ID ? cfg.HIGH_DELTA : cfg.LOW_DELTA
    const clamp = value => Math.max(0, Math.min(100, value))

    // The jar is one block behind and one above the controller; the light check reads the block right above it (the Calibrated Sculk Sensor, an invisible proxy block once formed, which lets light through)
    const jarPosOf = machine => {
        const front = machine.getFrontFacing().orElse($Direction.NORTH)
        return machine.getPos().relative(front.getOpposite()).above()
    }

    // The recipe that actually runs has its conditions stripped: MBD2 checks conditions every tick while working, so a redstone signal leaving the band gets stuck on "condition failed" instead of switching recipes.
    // Without them a signal change midway does not affect the batch; when it finishes, MBD2 re-modifies from the original recipe (alwaysModifyRecipe), and a band mismatch goes back to idle to find a recipe for the current signal.
    // EMI shows the registered original recipe, with its redstone condition as usual
    const withoutConditions = r => new $MBDRecipe(r.recipeType, r.id, r.inputs, r.outputs, new $ArrayList(), r.data, r.duration, r.isXEIHidden, r.priority)
    // A batch that yields nothing (high band below the output window) keeps its inputs and stress but has no outputs, so it also runs with a full output buffer
    const withoutOutputs = r => new $MBDRecipe(r.recipeType, r.id, r.inputs, new $HashMap(), r.conditions, r.data, r.duration, r.isXEIHidden, r.priority)

    // Expected yield of a batch started at this agitation: the low band scales the base output, the high band only yields above a floor
    const yieldOf = (recipe, agitation) => recipeId(recipe) === cfg.HIGH_RECIPE_ID
        ? Math.max(0, (agitation - cfg.HIGH_YIELD_FLOOR) / cfg.HIGH_YIELD_DIVISOR)
        : 1 + agitation / cfg.LOW_YIELD_DIVISOR

    const getAgitation = machine => machine.getCustomData().getInt(cfg.AGITATION_KEY)
    const setAgitation = (machine, value) => {
        const next = clamp(Math.round(value))
        const data = machine.getCustomData()
        if (data.getInt(cfg.AGITATION_KEY) !== next) {
            data.putInt(cfg.AGITATION_KEY, next)
            machine.markDirty()
        }
        machine.setAnalogOutputSignal(Math.floor(next / 100 * 15))
    }

    const isFormed = machine => typeof machine.isFormed === 'function' ? machine.isFormed() : true

    // Whether the jar holds a Warden: once formed the jar position is a proxy block, so read the original block entity data it saved; unformed, read the jar itself
    const hasWarden = machine => {
        const level = machine.getLevel()
        const be = level.getBlockEntity(jarPosOf(machine))
        if (be == null) return false
        const data = be instanceof $ProxyPartBlockEntity
            ? be.getOriginalData()
            : be.saveWithoutMetadata(level.registryAccess())
        return data != null && String(data.getCompound('entityTag').getString('id')) === cfg.JAR_ENTITY
    }

    const canWork = machine => {
        const level = machine.getLevel()
        // KubeJS renames Level.dimension() to getDimensionKey() (@RemapForJS in LevelMixin); use LevelKJS.getDimension() (a ResourceLocation) instead
        if (String(level.getDimension()) !== OTHERSIDE) return false
        if (!hasWarden(machine)) return false
        const inside = jarPosOf(machine).above()
        return level.getBrightness($LightLayer.BLOCK, inside) === 0
    }

    // Takes items from the given input slot (matched by registry ID) and returns how many were taken
    const extract = (machine, traitName, matches, amount) => {
        const trait = machine.getTraitByName(traitName)
        if (trait == null) return 0
        const storage = trait.storage
        let left = amount
        for (let slot = 0; slot < storage.getSlots() && left > 0; slot++) {
            let stack = storage.getStackInSlot(slot)
            if (stack.isEmpty() || !matches(String($BuiltInRegistries.ITEM.getKey(stack.getItem())), stack)) continue
            let taken = storage.extractItem(slot, left, false)
            left -= taken.getCount()
        }
        return amount - left
    }

    // Voids the batch: consume the Sculk Niter Powder, drop agitation to RESET, cool down, and make the Warden in the jar roar
    const voidBatch = (machine, now) => {
        extract(machine, cfg.ITEM_INPUT_TRAIT, id => id === cfg.POWDER, cfg.POWDER_PER_BATCH)
        const data = machine.getCustomData()
        data.putLong(cfg.COOLDOWN_KEY, now + cfg.COOLDOWN_TICKS)
        data.putLong(cfg.ROAR_KEY, now + cfg.ROAR_TICKS)
        setAgitation(machine, cfg.RESET)
        machine.markDirty()
        machine.getLevel()[PLAY_SOUND](null, jarPosOf(machine), $SoundEvents.WARDEN_ROAR, $SoundSource.BLOCKS, 1.5, 1.0)
    }

    MBDMachineEvents.onLoad(cfg.MACHINE_ID, event => {
        const machine = event.event.machine
        if (machine.isRemote()) return
        machine.getCustomData().remove(cfg.NEXT_CHECK_KEY)
        setAgitation(machine, getAgitation(machine))
        const logic = machine.getRecipeLogic()
        if (logic.isIdle()) logic.markLastRecipeDirty()
    })

    MBDMachineEvents.onAfterRecipeModify(cfg.MACHINE_ID, event => {
        const nativeEvent = event.event
        const recipe = nativeEvent.recipe
        if (!isChamberRecipe(recipe)) return
        // Reject first and put the recipe back once the checks pass (a script error never starts a batch by mistake)
        nativeEvent.setRecipe(null)
        const machine = nativeEvent.machine
        // The band (redstone condition) is only decided at the start: MBD2 modifies the recipe before checking conditions, so check the original conditions here on its behalf
        if (!recipe.checkConditions(machine.getRecipeLogic()).isSuccess()) return
        const data = machine.getCustomData()
        const now = machine.getLevel().getTime()
        // MBD2 retries over and over while idle; check each recipe at most once per second
        const key = `${cfg.NEXT_CHECK_KEY}/${recipeId(recipe)}`
        if (data.getLong(key) > now) return
        data.putLong(key, now + cfg.CHECK_RETRY_TICKS)
        machine.markDirty()
        if (!isFormed(machine) || data.getLong(cfg.COOLDOWN_KEY) > now || !canWork(machine)) return

        const agitation = getAgitation(machine)
        if (agitation + deltaOf(recipe) > cfg.THRESHOLD) {
            // On repeat batches MBD2 calls this hook before checking supplies, power and output space.
            if (!recipe.matchRecipe(machine).isSuccess() || !recipe.matchTickRecipe(machine).isSuccess()) return
            voidBatch(machine, now)
            return
        }
        // The base recipe outputs one item; the fraction of the expected yield rounds up by chance
        const expected = yieldOf(recipe, agitation)
        let count = Math.floor(expected)
        if (Math.random() < expected - count) count++
        // MBD2 re-modifies from the original recipe every batch (RecipeLogic.lastOriginRecipe), so multipliers never stack
        let result = recipe
        if (count === 0) result = withoutOutputs(recipe)
        else if (count > 1) result = recipe.copy($ContentModifier.of(count, 0), false, $IO.OUT)
        nativeEvent.setRecipe(withoutConditions(result))
    })

    MBDMachineEvents.onBeforeRecipeWorking(cfg.MACHINE_ID, event => {
        const machine = event.event.machine
        if (machine.isRemote()) return
        const data = machine.getCustomData()
        data.remove(`${cfg.NEXT_CHECK_KEY}/${cfg.LOW_RECIPE_ID}`)
        data.remove(`${cfg.NEXT_CHECK_KEY}/${cfg.HIGH_RECIPE_ID}`)
        machine.markDirty()
    })

    MBDMachineEvents.onRecipeFinish(cfg.MACHINE_ID, event => {
        const nativeEvent = event.event
        if (!isChamberRecipe(nativeEvent.recipe)) return
        const machine = nativeEvent.machine
        if (machine.isRemote()) return
        setAgitation(machine, getAgitation(machine) + deltaOf(nativeEvent.recipe))
    })

    // Flag for "the jar holds a Warden" (the client uses it to decide whether to draw the Warden in the jar)
    const syncHasWarden = machine => {
        const value = isFormed(machine) && hasWarden(machine)
        const data = machine.getCustomData()
        if (data.getBoolean(cfg.HAS_WARDEN_KEY) !== value) {
            data.putBoolean(cfg.HAS_WARDEN_KEY, value)
            machine.markDirty()
        }
    }

    MBDMachineEvents.onTick(cfg.MACHINE_ID, event => {
        const machine = event.event.machine
        if (machine.isRemote() || machine.getOffsetTimer() % 20 !== 0) return
        syncHasWarden(machine)
        let agitation = getAgitation(machine)
        if (agitation <= 0) return
        if (machine.getOffsetTimer() % cfg.DECAY_INTERVAL_TICKS === 0) agitation -= 1
        // Soothing with wool: take at most one per second
        if (agitation > 0 && extract(machine, cfg.WOOL_INPUT_TRAIT, (id, stack) => WOOL.test(stack), 1) > 0) {
            agitation -= cfg.WOOL_RELIEF
        }
        setAgitation(machine, agitation)
    })

    MBDMachineEvents.onRecipeStatusChanged(cfg.MACHINE_ID, event => {
        const nativeEvent = event.event
        const machine = nativeEvent.machine
        // Back to idle, run the recipe modification again (rechecking cooldown, agitation and environment)
        if (!machine.isRemote() && String(nativeEvent.getNewStatus().name()) === 'IDLE') {
            machine.getRecipeLogic().markLastRecipeDirty()
        }
    })

    // MBD2 uses the jar's loot table but passes the proxy as its block entity. Fill in the missing Ars component on the actual drop.
    BlockEvents.drops('mbd2:proxy_part_block', event => {
        const proxy = event.block.entity
        if (!(proxy instanceof $ProxyPartBlockEntity)) return
        const original = proxy.getOriginalState()
        if (original == null || String($BuiltInRegistries.BLOCK.getKey(original.getBlock())) !== cfg.JAR) return
        const data = proxy.getOriginalData()
        if (data == null || (!data.contains('entityTag') && !data.contains('extraMobData'))) return
        event.getItems().forEach(stack => {
            if (String(stack.getId()) === cfg.JAR) {
                stack.set($JarComponent, new $MobJarData(data.get('entityTag'), data.get('extraMobData')))
            }
        })
    })
})()
