(() => {
var IllegalItemCleanerItemStack = Java.loadClass('net.minecraft.world.item.ItemStack')
var IllegalItemCleanerItemHandlerCapabilities = Java.loadClass('net.neoforged.neoforge.capabilities.Capabilities$ItemHandler')

var ILLEGAL_ITEM_SCAN_INTERVAL = 200
var ILLEGAL_ITEM_MAX_NESTED_DEPTH = 5
var ILLEGAL_ITEM_BYPASS_PERMISSION_LEVEL = 2

// Keep the denylist explicit so every scan is a fast string lookup.
var ILLEGAL_ITEM_IDS = [
    'minecraft:bedrock',
    'minecraft:barrier',
    'minecraft:command_block',
    'minecraft:chain_command_block',
    'minecraft:repeating_command_block',
    'minecraft:command_block_minecart',
    'minecraft:structure_block',
    'minecraft:structure_void',
    'minecraft:jigsaw',
    'minecraft:debug_stick',
    'minecraft:light',
    'minecraft:spawner',
    'minecraft:trial_spawner',
    'minecraft:vault',
    'minecraft:end_portal_frame',
    'minecraft:reinforced_deepslate',
    'create:creative_motor',
    'create:creative_fluid_tank',
    'create:creative_crate',
    'create:creative_blaze_cake',
    'create:handheld_worldshaper',
    'create:wand_of_symmetry'
]

var ILLEGAL_ITEM_SET = Object.create(null)
for (var illegalItemIndex = 0; illegalItemIndex < ILLEGAL_ITEM_IDS.length; illegalItemIndex++) {
    ILLEGAL_ITEM_SET[ILLEGAL_ITEM_IDS[illegalItemIndex]] = true
}

function newIllegalItemStats() {
    return {
        removedStacks: 0,
        removedItems: 0,
        scannedNestedInventories: 0
    }
}

function isIllegalItem(stack) {
    return stack != null && !stack.isEmpty() && ILLEGAL_ITEM_SET[String(stack.getId())] === true
}

function hasIllegalItemBypassPermission(player) {
    if (player == null) {
        return false
    }

    try {
        if (player.hasPermissions(ILLEGAL_ITEM_BYPASS_PERMISSION_LEVEL)) {
            return true
        }
    } catch (ignored) {
    }

    return false
}

function isCreativeModePlayer(player) {
    if (player == null) {
        return false
    }

    try {
        if (player.isCreative()) {
            return true
        }
    } catch (ignored) {
    }

    try {
        var gameMode = player.gameMode.getGameModeForPlayer()
        if (gameMode != null && gameMode.isCreative()) {
            return true
        }
    } catch (ignored) {
    }

    try {
        var abilities = player.getAbilities()
        if (abilities != null && abilities.instabuild) {
            return true
        }
    } catch (ignored) {
    }

    return false
}

function shouldSkipIllegalItemScan(player) {
    return hasIllegalItemBypassPermission(player) || isCreativeModePlayer(player)
}

function countRemoved(stack) {
    return stack == null || stack.isEmpty() ? 0 : stack.getCount()
}

function markChanged(target) {
    if (target == null) {
        return
    }

    try {
        target.setChanged()
    } catch (ignored) {
    }
}

function noteRemoved(stack, stats) {
    stats.removedStacks++
    stats.removedItems += countRemoved(stack)
}

function scanItemList(itemList, stats, depth) {
    if (itemList == null) {
        return false
    }

    var changed = false
    for (var listIndex = 0; listIndex < itemList.size(); listIndex++) {
        var listStack = itemList.get(listIndex)
        if (listStack == null || listStack.isEmpty()) {
            continue
        }

        if (isIllegalItem(listStack)) {
            noteRemoved(listStack, stats)
            itemList.set(listIndex, IllegalItemCleanerItemStack.EMPTY)
            changed = true
            continue
        }

        changed = scanNestedItemInventory(listStack, stats, depth + 1) || changed
    }

    return changed
}

function scanPlayerInventory(player, stats) {
    if (player == null) {
        return false
    }

    var inventory = player.getInventory()
    var changed = false

    changed = scanItemList(inventory.items, stats, 0) || changed
    changed = scanItemList(inventory.armor, stats, 0) || changed
    changed = scanItemList(inventory.offhand, stats, 0) || changed

    if (changed) {
        markChanged(inventory)
    }

    return changed
}

function scanContainer(container, stats, depth) {
    if (container == null) {
        return false
    }

    var changed = false
    var size = 0

    try {
        size = container.getContainerSize()
    } catch (ignored) {
        return false
    }

    for (var containerSlot = 0; containerSlot < size; containerSlot++) {
        var containerStack = container.getItem(containerSlot)
        if (containerStack == null || containerStack.isEmpty()) {
            continue
        }

        if (isIllegalItem(containerStack)) {
            noteRemoved(containerStack, stats)
            container.setItem(containerSlot, IllegalItemCleanerItemStack.EMPTY)
            changed = true
            continue
        }

        changed = scanNestedItemInventory(containerStack, stats, depth + 1) || changed
    }

    if (changed) {
        markChanged(container)
    }

    return changed
}

function clearItemHandlerSlot(handler, handlerSlot, stack, stats) {
    noteRemoved(stack, stats)

    try {
        handler.setStackInSlot(handlerSlot, IllegalItemCleanerItemStack.EMPTY)
        markChanged(handler)
        return true
    } catch (ignored) {
    }

    try {
        handler.extractItem(handlerSlot, stack.getCount(), false)
        markChanged(handler)
        return true
    } catch (ignored) {
    }

    return false
}

function scanItemHandler(handler, stats, depth) {
    if (handler == null) {
        return false
    }

    var changed = false
    var slots = 0

    try {
        slots = handler.getSlots()
    } catch (ignored) {
        return false
    }

    for (var handlerSlot = 0; handlerSlot < slots; handlerSlot++) {
        var handlerStack = handler.getStackInSlot(handlerSlot)
        if (handlerStack == null || handlerStack.isEmpty()) {
            continue
        }

        if (isIllegalItem(handlerStack)) {
            changed = clearItemHandlerSlot(handler, handlerSlot, handlerStack, stats) || changed
            continue
        }

        changed = scanNestedItemInventory(handlerStack, stats, depth + 1) || changed
    }

    return changed
}

function scanNestedItemInventory(stack, stats, depth) {
    if (stack == null || stack.isEmpty() || depth > ILLEGAL_ITEM_MAX_NESTED_DEPTH) {
        return false
    }

    var handler = null
    try {
        handler = stack.getCapability(IllegalItemCleanerItemHandlerCapabilities.ITEM)
    } catch (ignored) {
        return false
    }

    if (handler == null) {
        return false
    }

    stats.scannedNestedInventories++
    return scanItemHandler(handler, stats, depth)
}

function scanMenu(menu, stats) {
    if (menu == null) {
        return false
    }

    var changed = false

    try {
        var carried = menu.getCarried()
        if (isIllegalItem(carried)) {
            noteRemoved(carried, stats)
            menu.setCarried(IllegalItemCleanerItemStack.EMPTY)
            changed = true
        } else {
            changed = scanNestedItemInventory(carried, stats, 1) || changed
        }
    } catch (ignored) {
    }

    var slots = null
    try {
        slots = menu.slots
    } catch (ignored) {
        slots = null
    }

    if (slots != null) {
        for (var menuSlotIndex = 0; menuSlotIndex < slots.size(); menuSlotIndex++) {
            var menuSlot = slots.get(menuSlotIndex)
            if (menuSlot == null) {
                continue
            }

            try {
                if (menuSlot.isFake()) {
                    continue
                }
            } catch (ignored) {
            }

            var menuStack = menuSlot.getItem()
            if (menuStack == null || menuStack.isEmpty()) {
                continue
            }

            if (isIllegalItem(menuStack)) {
                noteRemoved(menuStack, stats)
                menuSlot.set(IllegalItemCleanerItemStack.EMPTY)
                try {
                    menuSlot.setChanged()
                } catch (ignored) {
                }
                changed = true
                continue
            }

            changed = scanNestedItemInventory(menuStack, stats, 1) || changed
        }
    }

    if (changed) {
        try {
            menu.broadcastChanges()
        } catch (ignored) {
        }
    }

    return changed
}

function finishPlayerScan(player, stats, changed, reason) {
    if (!changed || stats.removedItems <= 0) {
        return
    }

    try {
        player.sendInventoryUpdate()
    } catch (ignored) {
    }

    var name = String(player.getUsername())
    console.info(`[illegal_item_cleaner] Removed ${stats.removedItems} illegal item(s) in ${stats.removedStacks} stack(s) from ${name}; reason=${reason}; nested=${stats.scannedNestedInventories}`)
}

function scanPlayerIllegalItems(player, reason) {
    if (player == null || player.isFake()) {
        return
    }

    if (shouldSkipIllegalItemScan(player)) {
        return
    }

    var stats = newIllegalItemStats()
    var changed = false

    changed = scanPlayerInventory(player, stats) || changed

    var mouseItem = player.getMouseItem()
    if (isIllegalItem(mouseItem)) {
        noteRemoved(mouseItem, stats)
        player.setMouseItem(IllegalItemCleanerItemStack.EMPTY)
        changed = true
    } else {
        changed = scanNestedItemInventory(mouseItem, stats, 1) || changed
    }

    try {
        changed = scanMenu(player.getOpenInventory(), stats) || changed
    } catch (ignored) {
    }

    finishPlayerScan(player, stats, changed, reason)
}

PlayerEvents.inventoryChanged(event => {
    scanPlayerIllegalItems(event.player, 'inventory_changed')
})

PlayerEvents.chestOpened(event => {
    if (shouldSkipIllegalItemScan(event.player)) {
        return
    }

    var stats = newIllegalItemStats()
    var changed = false
    changed = scanContainer(event.inventory, stats, 0) || changed
    changed = scanPlayerInventory(event.player, stats) || changed
    finishPlayerScan(event.player, stats, changed, 'chest_opened')
})

PlayerEvents.inventoryOpened(event => {
    if (shouldSkipIllegalItemScan(event.player)) {
        return
    }

    var stats = newIllegalItemStats()
    var changed = false
    changed = scanMenu(event.inventoryContainer, stats) || changed
    changed = scanPlayerInventory(event.player, stats) || changed
    finishPlayerScan(event.player, stats, changed, 'inventory_opened')
})

PlayerEvents.inventoryClosed(event => {
    if (shouldSkipIllegalItemScan(event.player)) {
        return
    }

    var stats = newIllegalItemStats()
    var changed = false
    changed = scanMenu(event.inventoryContainer, stats) || changed
    changed = scanPlayerInventory(event.player, stats) || changed
    finishPlayerScan(event.player, stats, changed, 'inventory_closed')
})

PlayerEvents.tick(event => {
    var player = event.player
    if (player == null || player.tickCount % ILLEGAL_ITEM_SCAN_INTERVAL !== 0) {
        return
    }

    scanPlayerIllegalItems(player, 'periodic_player_scan')
})
})()
