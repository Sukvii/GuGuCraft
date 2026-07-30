// Config + dish table + coin denominations are assigned on `global` by the
// startup scripts (startup/selling_game/00_config.js + 03_dishes.js) -- the only
// scope where `global` is writable in KubeJS 2101 -- and merely READ here. To
// edit the menu or tuning, change those startup files, not this one.
// The literal fallbacks below apply ONLY if those startup scripts failed to load.
const SELL = (typeof global !== 'undefined' && global.SELL) || {
  ORDER_SIZE_BASE: 1,
  ORDER_SIZE_MAX: 3,
  CATEGORY_PARTIAL: 0.5,
  WRONG_PENALTY: 0.0,
  ALLOW_DUP_ORDER: false,
  CUSTOMER_ENTITY: 'easy_npc:humanoid',
  CUSTOMER_SPAWN_MIN_SECONDS: 5,
  CUSTOMER_SPAWN_MAX_SECONDS: 10,
  EXTRA_SELL_CHANCE: 0.5,
  ORDER_TIME_VERY_HAPPY_SECONDS: 30,
  ORDER_TIME_HAPPY_SECONDS: 60,
  ORDER_TIME_NEUTRAL_SECONDS: 90,
  ORDER_TIME_ANGRY_SECONDS: 120,
  TREND_CATEGORIES: ['burger', 'soup', 'rice', 'noodle', 'plate', 'main', 'pastry', 'dumpling', 'pasta', 'breakfast', 'salad']
}

const DISHES = (typeof global !== 'undefined' && global.dishes && Object.keys(global.dishes).length > 0) ? global.dishes : {
  // Safety fallback only -- the real, editable menu is global.dishes in
  // startup/selling_game/03_dishes.js.
  'farmersdelight:hamburger': { price: 12, favor: 1.0, chapter: 1, category: 'burger' },
  'farmersdelight:beef_stew': { price: 12, favor: 0.9, chapter: 1, category: 'soup' },
  'farmersdelight:fried_rice': { price: 9, favor: 0.9, chapter: 1, category: 'rice' },
  'kaleidoscope_cookery:beef_noodle': { price: 14, favor: 0.9, chapter: 2, category: 'noodle' },
  'farmersdelight:apple_cider': { price: 5, favor: 0.9, chapter: 1, category: 'drink', extra: true }
}

const MAIN_DISH_IDS = Object.keys(DISHES).filter(id => !DISHES[id].extra)
const EXTRA_DISH_IDS = Object.keys(DISHES).filter(id => DISHES[id].extra)
const COIN_DENOMS = (typeof global !== 'undefined' && global.COIN_DENOMS) || [
  ['numismatics:sun', 4096],
  ['numismatics:crown', 512],
  ['numismatics:cog', 64],
  ['numismatics:sprocket', 16],
  ['numismatics:bevel', 8],
  ['numismatics:spur', 1]
]

const CreateDataComponents = Java.loadClass('com.simibubi.create.AllDataComponents')
const EntityType = Java.loadClass('net.minecraft.world.entity.EntityType')
const CUSTOMER_STATE = {}

function stackId(stack) {
  if (stack == null) return 'minecraft:air'
  if (stack.id != null) return stack.id.toString()
  try {
    return stack.getItem().kjs$getId()
  } catch (ignored) {
    return stack.toString()
  }
}

function customerEntityType() {
  try {
    let type = EntityType.byString(SELL.CUSTOMER_ENTITY)
    if (type && type.isPresent()) return type.get()
  } catch (error) {
    console.error('Selling game: failed to resolve customer entity type ' + SELL.CUSTOMER_ENTITY + ': ' + error)
  }

  try {
    let BuiltInRegistries = Java.loadClass('net.minecraft.core.registries.BuiltInRegistries')
    let ResourceLocation = Java.loadClass('net.minecraft.resources.ResourceLocation')
    let id = ResourceLocation.parse(SELL.CUSTOMER_ENTITY)
    let type = BuiltInRegistries.ENTITY_TYPE.get(id)
    if (type != null) return type
  } catch (error) {
    console.error('Selling game: failed to read entity registry for ' + SELL.CUSTOMER_ENTITY + ': ' + error)
  }

  return null
}

function failSpawn(reason, player) {
  let message = 'Selling game: customer spawn failed: ' + reason
  console.warn(message)
  if (player) player.tell(Text.of(message).color('red'))
  return false
}

// Counter state (menu / reputation / cooldowns) is kept in two layers:
//   1) COUNTER_STATE -- an in-memory, position-keyed cache. This is the source of
//      truth WITHIN a session and is what makes the shop behave reliably from one
//      tick to the next (a previous version relied solely on the block entity and
//      lost the menu between ticks, so customers were force-marked to leave).
//   2) KubeBlockEntity `data` (a CompoundTag) + save() -- the disk-persistent copy
//      so state survives a reload (block entities have NO persistentData in 2101).
// Reads prefer the cache and fall back to `data`; writes update both.
const COUNTER_STATE = {}

function counterKey(counter) {
  let pos = counter.getBlockPos()
  let dim = 'level'
  try {
    dim = counter.getLevel().getDimension().toString()
  } catch (ignored) {
  }
  return dim + ':' + pos.getX() + ',' + pos.getY() + ',' + pos.getZ()
}

function counterCache(counter) {
  let key = counterKey(counter)
  if (!COUNTER_STATE[key]) COUNTER_STATE[key] = {}
  return COUNTER_STATE[key]
}

function clearCounterCache(counter) {
  delete COUNTER_STATE[counterKey(counter)]
}

function counterData(counter) {
  try {
    if (counter.data != null) return counter.data
  } catch (ignored) {
  }
  return null
}

function saveCounter(counter) {
  try {
    counter.save()
  } catch (ignored) {
  }
}

function readCounterMenu(counter) {
  let cache = counterCache(counter)
  if (cache.menu != null) return cache.menu.slice()

  let menu = []
  let data = counterData(counter)
  if (data != null) {
    try {
      menu = splitSellList(data.getString('menu'))
    } catch (ignored) {
    }
  }
  cache.menu = menu.slice()
  return menu
}

function setCounterMenu(counter, menu) {
  counterCache(counter).menu = menu.slice()
  let data = counterData(counter)
  if (data != null) {
    try {
      data.putString('menu', menu.join(','))
      saveCounter(counter)
    } catch (error) {
      console.warn('Selling game: cannot persist counter menu: ' + error)
    }
  }
}

function getCounterInt(counter, key, fallback) {
  let cache = counterCache(counter)
  if (cache[key] != null) return cache[key]

  let value = fallback || 0
  let data = counterData(counter)
  if (data != null) {
    try {
      if (data.contains(key)) value = data.getInt(key)
    } catch (ignored) {
    }
  }
  cache[key] = value
  return value
}

function setCounterInt(counter, key, value) {
  counterCache(counter)[key] = value
  let data = counterData(counter)
  if (data != null) {
    try {
      data.putInt(key, value)
      saveCounter(counter)
    } catch (error) {
      console.warn('Selling game: cannot persist counter ' + key + ': ' + error)
    }
  }
}

function getCounterString(counter, key) {
  let cache = counterCache(counter)
  if (cache[key] != null) return cache[key]

  let value = ''
  let data = counterData(counter)
  if (data != null) {
    try {
      value = data.getString(key)
    } catch (ignored) {
    }
  }
  cache[key] = value
  return value
}

function setCounterString(counter, key, value) {
  counterCache(counter)[key] = value
  let data = counterData(counter)
  if (data != null) {
    try {
      data.putString(key, value)
      saveCounter(counter)
    } catch (error) {
      console.warn('Selling game: cannot persist counter ' + key + ': ' + error)
    }
  }
}

function customerKey(customer) {
  try {
    if (customer.uuid != null) return customer.uuid.toString()
  } catch (ignored) {
  }
  return null
}

function customerState(customer) {
  let key = customerKey(customer)
  if (key == null) return null
  if (!CUSTOMER_STATE[key]) {
    CUSTOMER_STATE[key] = {
      order: null,
      delivered: null,
      phase: null,
      orderTakenTick: null
    }
  }
  return CUSTOMER_STATE[key]
}

function currentGameTime(level) {
  try {
    if (level && typeof level.getGameTime === 'function') return Number(level.getGameTime())
  } catch (ignored) {
  }
  return Math.floor(Date.now() / 50)
}

function readCustomerOrder(customer) {
  let key = customerKey(customer)
  let state = key == null ? null : CUSTOMER_STATE[key]
  if (state && state.order != null) return state.order.slice()

  let order = []
  try {
    order = splitSellList(customer.persistentData.getString('customerOrder'))
  } catch (ignored) {
  }

  if (order.length > 0) {
    state = customerState(customer)
    if (state) state.order = order.slice()
  }
  return order
}

function setCustomerOrder(customer, order) {
  let state = customerState(customer)
  if (state) state.order = order.slice()
  try {
    customer.persistentData.putString('customerOrder', order.join(','))
  } catch (ignored) {
  }
}

function readCustomerDelivered(customer) {
  let key = customerKey(customer)
  let state = key == null ? null : CUSTOMER_STATE[key]
  if (state && state.delivered != null) return state.delivered.slice()

  let delivered = []
  try {
    delivered = splitSellList(customer.persistentData.getString('delivered'))
  } catch (ignored) {
  }

  if (delivered.length > 0) {
    state = customerState(customer)
    if (state) state.delivered = delivered.slice()
  }
  return delivered
}

function setCustomerDelivered(customer, delivered) {
  let state = customerState(customer)
  if (state) state.delivered = delivered.slice()
  try {
    customer.persistentData.putString('delivered', delivered.join(','))
  } catch (ignored) {
  }
}

function readCustomerPhase(customer) {
  let key = customerKey(customer)
  let state = key == null ? null : CUSTOMER_STATE[key]
  if (state && state.phase != null) return state.phase

  let phase = 0
  try {
    phase = customer.persistentData.getInt('customerPhase')
  } catch (ignored) {
  }

  if (phase !== 0) {
    state = customerState(customer)
    if (state) state.phase = phase
  }
  return phase
}

function setCustomerPhase(customer, phase) {
  let state = customerState(customer)
  if (state) state.phase = phase
  try {
    customer.persistentData.putInt('customerPhase', phase)
  } catch (ignored) {
  }
}

function readCustomerOrderTakenTick(customer) {
  let key = customerKey(customer)
  let state = key == null ? null : CUSTOMER_STATE[key]
  if (state && state.orderTakenTick != null) return state.orderTakenTick

  let tick = 0
  try {
    tick = Number(customer.persistentData.getLong('customerOrderTakenTick'))
  } catch (ignored) {
  }

  if (tick > 0) {
    state = customerState(customer)
    if (state) state.orderTakenTick = tick
  }
  return tick
}

function setCustomerOrderTakenTick(customer, tick) {
  let state = customerState(customer)
  if (state) state.orderTakenTick = tick
  try {
    customer.persistentData.putLong('customerOrderTakenTick', tick)
  } catch (ignored) {
  }
}

function startCustomerOrderTimer(customer, level) {
  let tick = readCustomerOrderTakenTick(customer)
  if (tick > 0) return tick
  tick = currentGameTime(level)
  setCustomerOrderTakenTick(customer, tick)
  return tick
}

function customerOrderElapsedSeconds(customer, level) {
  let tick = readCustomerOrderTakenTick(customer)
  if (tick <= 0) return 0
  return Math.max(0, Math.floor((currentGameTime(level) - tick) / 20))
}

function clearCustomerState(customer) {
  let key = customerKey(customer)
  if (key != null) delete CUSTOMER_STATE[key]
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min)
}

function splitSellList(value) {
  if (value == null) return []
  let text = value.toString()
  if (text.length === 0) return []
  return text.split(',').filter(id => id.length > 0)
}

function reputationLevel(reputation) {
  for (let i = 1; i <= 100; i++) {
    if ((((50 + 50 * i) * i) / 2) > reputation) return i - 1
  }
  return 100
}

// Localized reputation readout built from the message.kubejs.repstr.* keys.
// Must stay a translatable COMPONENT (the client resolves its own locale); a
// server-side getString() would bake in the server language instead.
function reputationComponent(reputation) {
  let level = reputationLevel(reputation)
  let current = Math.floor(reputation - (((50 + 50 * level) * level) / 2))
  let next = Math.floor((level + 1) * 50)
  return Text.translate('message.kubejs.repstr.1')
    .append(Text.of('' + level))
    .append(Text.translate('message.kubejs.repstr.2'))
    .append(Text.of('' + current))
    .append(Text.translate('message.kubejs.repstr.3'))
    .append(Text.of('' + next))
    .append(Text.translate('message.kubejs.repstr.4'))
}

// Localized reaction status line: <reaction> <reputation-or-menu-hint> <delta +money spur>.
function reactionMessage(reactionKey, reputation, money, repDelta, showBadMenu) {
  let message = Text.translate(reactionKey).append(Text.of(' '))
  if (showBadMenu) {
    message.append(Text.translate('message.kubejs.customer.bad_menu')).append(Text.of(' '))
  } else {
    message.append(reputationComponent(reputation)).append(Text.of(' '))
  }
  let delta = ''
  if (repDelta > 0) delta = '+' + repDelta + ' rep '
  else if (repDelta < 0) delta = repDelta + ' rep '
  return message.append(Text.of(delta + '+' + Math.floor(money) + ' spur'))
}

function payMoney(player, spurs) {
  let left = Math.max(0, Math.floor(spurs))
  for (let i = 0; i < COIN_DENOMS.length; i++) {
    let id = COIN_DENOMS[i][0]
    let value = COIN_DENOMS[i][1]
    let count = Math.floor(left / value)
    while (count > 0) {
      let take = Math.min(64, count)
      player.give(Item.of(id, take))
      count -= take
      left -= take * value
    }
  }
}

function stackCount(stack) {
  if (stack == null) return 0
  try {
    if (stack.count != null) return Number(stack.count)
  } catch (ignored) {
  }
  try {
    return Number(stack.getCount())
  } catch (ignored) {
  }
  return 0
}

function isEmptyStack(stack) {
  if (stack == null) return true
  try {
    if (typeof stack.isEmpty === 'function') return stack.isEmpty()
  } catch (ignored) {
  }
  return stackId(stack) === 'minecraft:air' || stackCount(stack) <= 0
}

function blockInventory(block) {
  if (block == null) return null
  try {
    if (block.inventory != null) return block.inventory
  } catch (ignored) {
  }
  try {
    if (block.entity && block.entity.inventory != null) return block.entity.inventory
  } catch (ignored) {
  }
  return null
}

function inventorySlots(inventory) {
  if (inventory == null) return 0
  try {
    if (typeof inventory.slots === 'function') return Number(inventory.slots())
    if (inventory.slots != null) return Number(inventory.slots)
  } catch (ignored) {
  }
  try {
    if (typeof inventory.getSlots === 'function') return Number(inventory.getSlots())
  } catch (ignored) {
  }
  try {
    if (typeof inventory.getContainerSize === 'function') return Number(inventory.getContainerSize())
  } catch (ignored) {
  }
  try {
    if (typeof inventory.size === 'function') return Number(inventory.size())
    if (inventory.size != null) return Number(inventory.size)
  } catch (ignored) {
  }
  try {
    if (typeof inventory.length === 'function') return Number(inventory.length())
    if (inventory.length != null) return Number(inventory.length)
  } catch (ignored) {
  }
  return 0
}

function inventoryStack(inventory, slot) {
  try {
    if (typeof inventory.getStackInSlot === 'function') return inventory.getStackInSlot(slot)
  } catch (ignored) {
  }
  try {
    if (typeof inventory.getStack === 'function') return inventory.getStack(slot)
  } catch (ignored) {
  }
  try {
    if (typeof inventory.getItem === 'function') return inventory.getItem(slot)
  } catch (ignored) {
  }
  try {
    if (typeof inventory.get === 'function') return inventory.get(slot)
  } catch (ignored) {
  }
  return null
}

function extractInventoryItem(inventory, slot, stack) {
  try {
    let extracted = inventory.extractItem(slot, 1, false)
    if (!isEmptyStack(extracted)) return true
  } catch (ignored) {
  }

  let before = stackCount(stack)
  if (before <= 0) return false
  try {
    stack.shrink(1)
    let after = stackCount(inventoryStack(inventory, slot))
    return after < before
  } catch (ignored) {
  }

  return false
}

// Insert a single stack into a container, returning the leftover that did not
// fit. Prefers the KubeJS InventoryKJS 2-arg convenience (auto-slot, verified in
// 2101 source); falls back to the raw 3-arg IItemHandler form per slot.
function insertItemStack(inventory, stack) {
  if (inventory == null) return stack
  try {
    return inventory.insertItem(stack, false)
  } catch (ignored) {
  }
  try {
    let slots = inventorySlots(inventory)
    let remaining = stack
    for (let s = 0; s < slots; s++) {
      remaining = inventory.insertItem(s, remaining, false)
      if (isEmptyStack(remaining)) return remaining
    }
    return remaining
  } catch (ignored) {
  }
  return stack
}

// Split a spur amount into the fewest coins and insert them into a container
// (employee output chest). Returns the spur value that could not be inserted.
function insertMoney(inventory, spurs) {
  let left = Math.max(0, Math.floor(spurs))
  if (inventory == null) return left
  for (let i = 0; i < COIN_DENOMS.length; i++) {
    let id = COIN_DENOMS[i][0]
    let value = COIN_DENOMS[i][1]
    let count = Math.floor(left / value)
    while (count > 0) {
      let take = Math.min(64, count)
      let leftover = insertItemStack(inventory, Item.of(id, take))
      let leftCount = stackCount(leftover)
      left -= (take - leftCount) * value
      count -= take
      if (leftCount > 0) return left
    }
  }
  return left
}

function inventoryEmptySlots(inventory) {
  let slots = inventorySlots(inventory)
  let empty = 0
  for (let s = 0; s < slots; s++) {
    if (isEmptyStack(inventoryStack(inventory, s))) empty++
  }
  return empty
}

// Phase-2 extra-product upsell: scan nearby Create table cloths (create:table_cloth)
// for manually added display items, randomly pick one food and one drink (with an
// "empty" placeholder to allow no upsell), remove them from the cloth, spawn particles,
// and return multiplicative priceMod/repMod modifiers + the sold item IDs for feedback.
// Cloth scanning range: Y = counterY + SNACK_SCAN.Y_OFFSET, X/Z = counter +/- SNACK_SCAN.RADIUS.
function lookForSnacks(counter) {
  let SNACKS = global.snacks
  if (!SNACKS || Object.keys(SNACKS).length === 0) return null

  let scanCfg = SELL.SNACK_SCAN || { RADIUS: 3, Y_OFFSET: 1 }
  let level = counter.getLevel()
  let pos = counter.getBlockPos()
  let cx = pos.getX(), cy = pos.getY(), cz = pos.getZ()
  let scanY = cy + scanCfg.Y_OFFSET
  let rad = scanCfg.RADIUS

  // Collect all displayed snacks from table cloths, grouped by snackType (1=food, 2=drink).
  // Each entry: { id, snackType, priceMod, repMod, blockEntity, slot }.
  let snacksByType = { 1: [], 2: [] }

  for (let dx = -rad; dx <= rad; dx++) {
    for (let dz = -rad; dz <= rad; dz++) {
      let block = level.getBlock(cx + dx, scanY, cz + dz)
      if (!block.hasTag('create:table_cloths')) continue
      let be = block.entity
      if (!be) continue

      // Skip cloths marked as shop (the example pack's isShop() check).
      // In KubeJS 2101 / NeoForge 21.1 the field may be a Java boolean or
      // a persistentData flag; try both. If no such field exists, treat as false.
      let isShop = false
      try {
        if (be.isShop && typeof be.isShop === 'function') {
          isShop = be.isShop()
        } else if (be.isShop != null) {
          isShop = Boolean(be.isShop)
        } else if (be.persistentData && be.persistentData.getBoolean) {
          isShop = be.persistentData.getBoolean('isShop')
        }
      } catch (ignored) {}
      if (isShop) continue

      // The example pack reads be.manuallyAddedItems, a Java ArrayList of ItemStack.
      // In KubeJS 2101 this may appear as an array-like or a Java List. Try both paths.
      let manualItems = null
      try {
        manualItems = be.manuallyAddedItems
      } catch (ignored) {}
      if (!manualItems) continue

      // Iterate the manual items. Each entry is an ItemStack (or similar).
      let itemCount = 0
      try {
        itemCount = manualItems.size ? manualItems.size() : (manualItems.length || 0)
      } catch (ignored) {
        itemCount = manualItems.length || 0
      }

      for (let slot = 0; slot < itemCount; slot++) {
        let stack = null
        try {
          stack = manualItems.get ? manualItems.get(slot) : manualItems[slot]
        } catch (ignored) {
          continue
        }
        if (!stack || isEmptyStack(stack)) continue

        let id = stackId(stack)
        let snackData = SNACKS[id]
        if (!snackData) continue

        snacksByType[snackData.snackType].push({
          id: id,
          snackType: snackData.snackType,
          priceMod: snackData.priceMod,
          repMod: snackData.repMod,
          blockEntity: be,
          slot: slot
        })
      }
    }
  }

  // Draw at most one food and one drink. The chance to sell scales with how
  // many snacks of that category are on display, so a sparse stand rarely sells
  // and a rich one approaches (but never exceeds) the cap:
  //   chance = min(SELL_CHANCE_CAP, count * SELL_CHANCE_PER)
  // With the defaults (PER=0.15, CAP=0.5): 1 item -> 15%, 2 -> 30%, 3 -> 45%,
  // 4+ -> 50%. Food and drink roll independently. Tune both knobs in 00_config.js.
  let perItem = scanCfg.SELL_CHANCE_PER == null ? 0.15 : scanCfg.SELL_CHANCE_PER
  let capChance = scanCfg.SELL_CHANCE_CAP == null ? 0.5 : scanCfg.SELL_CHANCE_CAP

  let soldSnacks = []
  let totalPriceMod = 1.0
  let totalRepMod = 1.0

  for (let type = 1; type <= 2; type++) {
    let pool = snacksByType[type]
    if (!pool || pool.length === 0) continue

    let sellChance = Math.min(capChance, pool.length * perItem)
    if (Math.random() >= sellChance) continue

    let pick = pool[randomInt(0, pool.length - 1)]

    // Remove the picked item from the cloth. The example pack does:
    //   be.manuallyAddedItems.remove(slot)
    //   be.notifyUpdate()
    // Try that; if it fails, treat the upsell as failed for this type.
    try {
      let be = pick.blockEntity
      if (be.manuallyAddedItems && be.manuallyAddedItems.remove) {
        be.manuallyAddedItems.remove(pick.slot)
      } else if (be.manuallyAddedItems && be.manuallyAddedItems.splice) {
        be.manuallyAddedItems.splice(pick.slot, 1)
      } else {
        continue
      }
      if (be.notifyUpdate && typeof be.notifyUpdate === 'function') {
        be.notifyUpdate()
      }

      // Spawn a small particle puff to show the snack was taken.
      let bPos = be.getBlockPos()
      level.spawnParticles('minecraft:poof', true, bPos.getX() + 0.5, bPos.getY() + 0.5, bPos.getZ() + 0.5, 0.2, 0.2, 0.2, 5, 0.02)

      soldSnacks.push(pick.id)
      totalPriceMod *= pick.priceMod
      totalRepMod *= pick.repMod
    } catch (err) {
      console.error('[SellingGame] Failed to remove snack ' + pick.id + ' from table cloth: ' + err)
    }
  }

  if (soldSnacks.length === 0) return null
  return { soldIds: soldSnacks, priceMod: totalPriceMod, repMod: totalRepMod }
}

// Localized feedback: ">> Also sold: <item1>, <item2> (×A.B price, ×C.D reputation)"
// using message.kubejs.extra_product_* keys (phase 4: update those lang keys to match).
function extraProductText(snackResult) {
  if (!snackResult || !snackResult.soldIds || snackResult.soldIds.length === 0) {
    return Text.of('')
  }

  let component = Text.translate('message.kubejs.extra_product_1').append(Text.of(' '))

  for (let i = 0; i < snackResult.soldIds.length; i++) {
    if (i > 0) component.append(Text.of(', '))
    let name
    try {
      name = Item.of(snackResult.soldIds[i]).getDisplayName()
    } catch (ignored) {
      name = Text.of(snackResult.soldIds[i])
    }
    component.append(name)
  }

  component.append(Text.of(' (×'))
    .append(Text.of(snackResult.priceMod.toFixed(2)))
    .append(Text.of(' '))
    .append(Text.translate('message.kubejs.extra_product_3'))
    .append(Text.of(', ×'))
    .append(Text.of(snackResult.repMod.toFixed(2)))
    .append(Text.of(' '))
    .append(Text.translate('message.kubejs.extra_product_2'))
    .append(Text.of(')'))

  return component
}

// Build the order as a translatable component so dish names resolve in each
// client's locale (Item.getDisplayName() is translatable). A server-side
// getString() would bake in the server language for everyone.
function orderComponent(ids) {
  let counts = {}
  ids.forEach(id => {
    counts[id] = (counts[id] || 0) + 1
  })
  let keys = Object.keys(counts)
  let component = Text.of('')
  for (let i = 0; i < keys.length; i++) {
    let id = keys[i]
    if (i > 0) component.append(Text.of(', '))
    let name
    try {
      name = Item.of(id).getDisplayName()
    } catch (error) {
      name = Text.of(id)
    }
    component.append(name)
    if (counts[id] > 1) component.append(Text.of(' x' + counts[id]))
  }
  return component
}

function setCustomerOrderName(customer) {
  let order = readCustomerOrder(customer)
  if (order.length > 0) customer.setCustomName(orderComponent(order))
}

function getTrend() {
  let categories = SELL.TREND_CATEGORIES
  let slot = Math.floor(Date.now() / (1000 * 3600 * 6))
  let hot = categories[slot % categories.length]
  let cold = categories[(slot * 7 + 3) % categories.length]
  if (hot === cold) cold = categories[(slot + 1) % categories.length]
  return [hot, cold]
}

function menuFromShopLevel(shopLevel) {
  let chapterCap = Math.max(1, Math.floor(shopLevel / 5) + 1)
  return MAIN_DISH_IDS.filter(id => DISHES[id].chapter <= chapterCap)
}

function filterToMenu(items) {
  let result = []
  if (items == null) return result
  for (let i = 0; i < items.length; i++) {
    let entry = items[i]
    if (entry == null) continue
    let id = stackId(entry)
    if (id === 'create:filter') {
      let nested = null
      if (entry.tag && entry.tag.Items && entry.tag.Items.Items) nested = entry.tag.Items.Items
      let nestedMenu = filterToMenu(nested)
      nestedMenu.forEach(nestedId => {
        if (!result.includes(nestedId)) result.push(nestedId)
      })
      continue
    }
    if (DISHES[id] && !DISHES[id].extra && !result.includes(id)) result.push(id)
  }
  return result
}

function isFilterBlacklist(stack) {
  if (stack == null || stackId(stack) !== 'create:filter') return false

  try {
    if (stack.getOrDefault(CreateDataComponents.FILTER_ITEMS_BLACKLIST, false)) return true
  } catch (ignored) {
  }

  try {
    let components = ''
    if (typeof stack.getComponentString === 'function') components = stack.getComponentString()
    else if (stack.componentString != null) components = stack.componentString.toString()
    if (components && components.indexOf('create:filter_items_blacklist=true') >= 0) return true
    if (components && components.indexOf('filter_items_blacklist') >= 0 && components.indexOf('false') < 0) return true
  } catch (ignored) {
  }

  return !!(stack.nbt && stack.nbt.Blacklist == 1)
}

function filterComponentMenu(stack) {
  let result = []

  // Preferred (Create 1.21.1): the configured slots live in the FILTER_ITEMS data
  // component as an ItemContainerContents. (1.20.1 stored them in nbt.Items.Items,
  // which no longer exists -- that path is only kept as a last-resort fallback.)
  try {
    let ItemContainerContents = Java.loadClass('net.minecraft.world.item.component.ItemContainerContents')
    let contents = stack.getOrDefault(CreateDataComponents.FILTER_ITEMS, ItemContainerContents.EMPTY)
    if (contents != null) {
      let list = contents.stream().toList()
      for (let i = 0; i < list.size(); i++) {
        let entry = list.get(i)
        if (entry == null || entry.isEmpty()) continue
        let id = stackId(entry)
        if (DISHES[id] && !DISHES[id].extra && !result.includes(id)) result.push(id)
      }
    }
  } catch (ignored) {
  }
  if (result.length > 0) return result

  // Fallback: FilterItem.getFilterItems(stack) (note: empty for blacklist filters).
  try {
    let filterItems = stack.getItem().getFilterItems(stack)
    for (let i = 0; i < filterItems.length; i++) {
      let id = stackId(filterItems[i])
      if (DISHES[id] && !DISHES[id].extra && !result.includes(id)) result.push(id)
    }
  } catch (ignored) {
  }
  return result
}

function readFilterMenu(stack, reputation) {
  if (stack == null || stackId(stack) !== 'create:filter') return null
  if (isFilterBlacklist(stack)) return []

  let componentMenu = filterComponentMenu(stack)
  if (componentMenu.length > 0) return componentMenu

  let items = null
  if (stack.nbt && stack.nbt.Items && stack.nbt.Items.Items) items = stack.nbt.Items.Items
  let menu = filterToMenu(items)
  if (menu.length > 0) return menu
  return menuFromShopLevel(reputationLevel(reputation))
}

function validMenu(menu) {
  if (menu == null) return false
  return menu.filter(id => DISHES[id] && !DISHES[id].extra).length >= 1
}

function createRandomOrder(menu, reputation) {
  let pool = menu.filter(id => DISHES[id] && !DISHES[id].extra)
  let level = reputationLevel(reputation || 0)
  let size = Math.min(SELL.ORDER_SIZE_MAX, SELL.ORDER_SIZE_BASE + Math.floor(level / 2))
  if (!SELL.ALLOW_DUP_ORDER) size = Math.min(size, pool.length)

  let order = []
  for (let k = 0; k < size && pool.length > 0; k++) {
    let total = pool.reduce((sum, id) => sum + (DISHES[id].favor || 0.5), 0)
    let roll = Math.random() * total
    let acc = 0
    let pick = pool[0]
    for (let i = 0; i < pool.length; i++) {
      let id = pool[i]
      acc += DISHES[id].favor || 0.5
      if (roll <= acc) {
        pick = id
        break
      }
    }
    order.push(pick)
    if (!SELL.ALLOW_DUP_ORDER) pool = pool.filter(id => id !== pick)
  }
  return order
}

function compareDishes(delivered, order) {
  if (order.length === 0) return 0
  let pool = delivered.slice()
  let score = 0
  for (let i = 0; i < order.length; i++) {
    let want = order[i]
    let exact = pool.indexOf(want)
    if (exact >= 0) {
      score += 1
      pool.splice(exact, 1)
      continue
    }

    let wantCategory = DISHES[want] ? DISHES[want].category : null
    let similar = pool.findIndex(id => DISHES[id] && DISHES[id].category === wantCategory)
    if (similar >= 0) {
      score += SELL.CATEGORY_PARTIAL
      pool.splice(similar, 1)
      continue
    }

    score += SELL.WRONG_PENALTY
  }
  return Math.max(0, Math.min(1, score / order.length))
}

function orderTimeScore(seconds) {
  let veryHappy = SELL.ORDER_TIME_VERY_HAPPY_SECONDS || 30
  let happy = SELL.ORDER_TIME_HAPPY_SECONDS || 60
  let neutral = SELL.ORDER_TIME_NEUTRAL_SECONDS || 90
  let angry = SELL.ORDER_TIME_ANGRY_SECONDS || 120

  if (seconds <= veryHappy) return 100
  if (seconds <= happy) return 75
  if (seconds <= neutral) return 50
  if (seconds <= angry) return 25
  return 0
}

function orderFinalScore(delivered, order, customer, level) {
  let dishScore = Math.round(100 * compareDishes(delivered, order))
  let elapsed = customerOrderElapsedSeconds(customer, level)
  let timeScore = orderTimeScore(elapsed)
  return Math.min(dishScore, timeScore)
}

function dishPrice(ids) {
  let trend = getTrend()
  return ids.reduce((sum, id) => {
    let dish = DISHES[id]
    if (!dish) return sum
    let trendMod = dish.category === trend[0] ? 2 : 1
    return sum + dish.price * trendMod
  }, 0)
}

function genReputation(ids, _reputation) {
  let trend = getTrend()
  let rep = 0
  ids.forEach(id => {
    let dish = DISHES[id]
    if (!dish) return
    if (dish.category === trend[1]) return
    let value = 1 + Math.floor((dish.chapter || 1) / 2)
    if (dish.category === trend[0]) rep += value
    rep += value
  })
  return Math.max(1, rep)
}

function customerReaction(score, player, level, counter, customer, repValue, money) {
  let reputation = getCounterInt(counter, 'reputation', 0)
  let repLevel = reputationLevel(reputation)
  let menu = readCounterMenu(counter)
  let menuRequired = repLevel < 25
  if (menuRequired) {
    let count = 0
    for (let i = 0; i < menu.length; i++) {
      let dish = DISHES[menu[i]]
      if (dish && repLevel < dish.chapter * 5) count++
    }
    menuRequired = count < 3
  }

  let combo = player.persistentData.getInt('combos')
  if (score === 100) {
    player.persistentData.putLong('comboTimeStamp', Date.now())
    player.persistentData.putInt('combos', combo + 1)
  } else {
    player.persistentData.putLong('comboTimeStamp', 0)
    player.persistentData.putInt('combos', 0)
  }

  let reactionKey
  let particle
  let particleCount = 50
  let repDelta = 0

  if (score === 100) {
    reactionKey = 'message.kubejs.customer.very_happy'
    particle = 'minecraft:happy_villager'
    if (!menuRequired) {
      repDelta = Math.floor(repValue * (1 + 0.1 * combo))
      reputation += repDelta
    }
  } else if (score >= 75) {
    reactionKey = 'message.kubejs.customer.happy'
    particle = 'minecraft:wax_off'
    if (!menuRequired) {
      repDelta = repValue
      reputation += repDelta
    }
  } else if (score >= 50) {
    reactionKey = 'message.kubejs.customer.neutral'
    particle = 'minecraft:smoke'
  } else if (score > 0) {
    reactionKey = 'message.kubejs.customer.mad'
    particle = 'minecraft:smoke'
    repDelta = -repValue
    reputation = Math.max(reputation - repValue, 0)
  } else {
    reactionKey = 'message.kubejs.customer.very_mad'
    particle = 'minecraft:angry_villager'
    particleCount = 20
    repDelta = -(repValue * 2)
    reputation = Math.max(reputation - repValue * 2, 0)
  }

  player.setStatusMessage(reactionMessage(reactionKey, reputation, money, repDelta, menuRequired && score >= 75))
  level.spawnParticles(particle, false, customer.x, customer.y + 1, customer.z, 0.3, 1, 0.3, particleCount, 0)

  setCounterInt(counter, 'reputation', Math.floor(reputation))
}

function closeCounterForNow(counter) {
  setCounterMenu(counter, [])
  setCounterInt(counter, 'cd', 0)

  let level = counter.getLevel()
  let customers = counterCustomers(counter, 3)
  for (let i = 0; i < customers.length; i++) {
    let customer = customers[i]
    if (readCustomerPhase(customer) === 4) continue
    setCustomerPhase(customer, 4)
    customer.setPositionAndRotation(customer.x, customer.y, customer.z, 90, 0)
    level.getServer().runCommandSilent('/execute as ' + customer.uuid.toString() + ' at @s run tp @s ~ ~ ~ ~ ~')
  }
}

function spawnCustomer(counter, menuOverride, player) {
  let pos = counter.getBlockPos()
  let level = counter.getLevel()
  let menu = menuOverride == null ? readCounterMenu(counter) : menuOverride
  if (!validMenu(menu)) {
    return failSpawn('invalid menu "' + menu.join(',') + '"', player)
  }

  let customerType = customerEntityType()
  if (customerType == null) {
    return failSpawn('unknown entity type "' + SELL.CUSTOMER_ENTITY + '"', player)
  }

  let customer = null
  try {
    customer = level.createEntity(customerType)
  } catch (error) {
    return failSpawn('createEntity threw for "' + SELL.CUSTOMER_ENTITY + '": ' + error, player)
  }

  if (customer == null) {
    return failSpawn('createEntity returned null for "' + SELL.CUSTOMER_ENTITY + '"', player)
  }

  let order = createRandomOrder(menu, getCounterInt(counter, 'reputation', 0))
  customer.setPositionAndRotation(pos.getX() + 8, pos.getY(), pos.getZ() + 1.5, 90.0, 0.0)
  setCustomerOrder(customer, order)
  setCustomerDelivered(customer, [])
  setCustomerPhase(customer, 1)
  setCustomerOrderTakenTick(customer, 0)
  try {
    customer.setNoAi(true)
  } catch (error) {
    console.warn('Selling game: setNoAi failed for customer: ' + error)
  }

  try {
    customer.spawn()
  } catch (error) {
    return failSpawn('customer.spawn threw for "' + SELL.CUSTOMER_ENTITY + '": ' + error, player)
  }

  setCustomerOrder(customer, order)
  setCustomerDelivered(customer, [])
  setCustomerPhase(customer, 1)
  setCustomerOrderTakenTick(customer, 0)

  try {
    // Randomize customer skin using Easy NPC's default-skin variant system.
    // Renderer reads the top-level "VariantType" synched field (default STEVE) --
    // NOT SkinData.Name -- so SkinHandler.setSkin() sets BOTH for a DEFAULT skin
    // (verified in 1.21.1 source: SkinHandler#setSkin + VariantDataCapable). We
    // mirror that here: write SkinData{Type:DEFAULT,Name:X} AND VariantType:X.
    let skinVariants = ['STEVE', 'ALEX', 'NOOR', 'SUNNY', 'ARI', 'EFE', 'KAI', 'MAKENA', 'ZURI']
    let variantName = skinVariants[randomInt(0, skinVariants.length - 1)]

    let CompoundTag = Java.loadClass('net.minecraft.nbt.CompoundTag')
    let skinDataTag = new CompoundTag()
    skinDataTag.putString('Name', variantName)
    skinDataTag.putString('Type', 'DEFAULT')
    skinDataTag.putString('URL', '')
    skinDataTag.putUUID('UUID', Java.loadClass('java.util.UUID').randomUUID())
    skinDataTag.putBoolean('DisableLayers', false)
    skinDataTag.putString('Content', '')
    skinDataTag.putLong('Timestamp', Date.now())

    let entityTag = new CompoundTag()
    entityTag.put('SkinData', skinDataTag)
    // The field the renderer actually reads for a DEFAULT skin.
    entityTag.putString('VariantType', variantName)
    customer.mergeNbt(entityTag)
  } catch (error) {
    console.warn('Selling game: cannot set customer skin variant: ' + error)
  }

  try {
    setCustomerOrderName(customer)
  } catch (error) {
    console.warn('Selling game: cannot set spawned customer order name: ' + error)
  }

  level.spawnParticles('minecraft:poof', false, pos.getX() + 8, pos.getY() + 1, pos.getZ() + 1.5, 0.5, 1, 0.5, 50, 0)
  return true
}

function counterCustomers(counter, zMax) {
  let level = counter.getLevel()
  let pos = counter.getBlockPos()
  let rng = AABB.of(pos.getX() - 12, pos.getY(), pos.getZ() + 1, pos.getX() + 12, pos.getY() + 1, pos.getZ() + zMax)
  let entities = level.getEntitiesWithin(rng)
  let customers = []
  for (let i = 0; i < entities.length; i++) {
    let entity = entities[i]
    if (readCustomerPhase(entity) !== 0) customers.push(entity)
  }
  return customers
}

function findWaitingCustomer(counter) {
  let customers = counterCustomers(counter, 2)
    .filter(customer => {
      let phase = readCustomerPhase(customer)
      return phase === 2 || phase === 3
    })
    .sort((a, b) => a.x - b.x)
  return customers.length > 0 ? customers[0] : null
}

function playCounterSound(server, sound, pos) {
  server.runCommandSilent('playsound ' + sound + ' block @a ' + pos.getX() + ' ' + pos.getY() + ' ' + pos.getZ())
}

function customerAI(customer, xList, counter, menu) {
  let phase = readCustomerPhase(customer)
  let level = customer.getLevel()

  if ((!validMenu(menu) || level.getDayTime() % 24000 > 14400) && phase !== 4) {
    setCustomerPhase(customer, 4)
    phase = 4
    customer.setPositionAndRotation(customer.x, customer.y, customer.z, 90, 0)
    level.getServer().runCommandSilent('/execute as ' + customer.uuid.toString() + ' at @s run tp @s ~ ~ ~ ~ ~')
  }

  switch (phase) {
    case 1:
      for (let i = 0; i < xList.length; i++) {
        if (xList[i] < customer.x) {
          if ((customer.x - xList[i]) < 1.3) return
          break
        }
      }
      customer.setPositionAndRotation(customer.x - 0.1, customer.y, customer.z, 90, 0)
      if (customer.x <= counter.getBlockPos().getX() + 0.5) {
        customer.setPositionAndRotation(customer.x, customer.y, customer.z, 180, 0)
        level.getServer().runCommandSilent('/execute as ' + customer.uuid.toString() + ' at @s run tp @s ~ ~ ~ ~ ~')
        setCustomerPhase(customer, 2)
      }
      return
    case 4:
      customer.setPositionAndRotation(customer.x - 0.1, customer.y, customer.z, 90, 0)
      if (customer.x <= counter.getBlockPos().getX() - 10) {
        level.spawnParticles('minecraft:poof', false, customer.x, customer.y + 1, customer.z, 0.5, 1, 0.5, 50, 0)
        clearCustomerState(customer)
        customer.discard()
      }
      return
  }
}

function isPlayerEntity(entity) {
  if (entity == null) return false
  try {
    if (typeof entity.isPlayer === 'function') return entity.isPlayer()
  } catch (ignored) {
  }
  try {
    if (entity.player != null) return !!entity.player
  } catch (ignored) {
  }
  return false
}

function isLivingEntity(entity) {
  if (entity == null) return false
  try {
    if (typeof entity.isLiving === 'function') return entity.isLiving()
  } catch (ignored) {
  }
  try {
    if (entity.living != null) return !!entity.living
  } catch (ignored) {
  }
  try {
    if (typeof entity.isAlive === 'function') return entity.isAlive()
  } catch (ignored) {
  }
  return true
}

// Employees stand directly behind the counter (z - 1). Input chest sits at
// (x+1, z-1), output chest at (x-1, z-1) -- mirrors the example pack layout but
// uses absolute offsets to match this port's fixed +x/+z customer side.
function findEmployeeEntity(counter) {
  let level = counter.getLevel()
  let pos = counter.getBlockPos()
  let x = pos.getX()
  let y = pos.getY()
  let z = pos.getZ()
  let rng = AABB.of(x - 1, y, z - 2, x + 2, y + 2, z)
  let entities = level.getEntitiesWithin(rng)
  let fallback = null
  for (let i = 0; i < entities.length; i++) {
    let value = 0
    try {
      value = entities[i].persistentData.getInt('employee')
    } catch (ignored) {
    }
    if (value === 0) continue
    if (value % 10 === 0) return entities[i]  // prefer a working (mode 0) employee
    if (fallback == null) fallback = entities[i]
  }
  return fallback
}

// All-or-nothing multiset match of an order against an input container. Returns
// the list of slots to pull one dish from, or null if any order item is missing.
function planDishExtraction(inventory, order) {
  let slots = inventorySlots(inventory)
  if (slots <= 0) return null

  let available = []
  for (let s = 0; s < slots; s++) {
    let stack = inventoryStack(inventory, s)
    if (isEmptyStack(stack)) continue
    available.push({ slot: s, id: stackId(stack), count: stackCount(stack) })
  }

  let plan = []
  for (let i = 0; i < order.length; i++) {
    let want = order[i]
    let entry = null
    for (let a = 0; a < available.length; a++) {
      if (available[a].id === want && available[a].count > 0) {
        entry = available[a]
        break
      }
    }
    if (entry == null) return null
    entry.count -= 1
    plan.push(entry.slot)
  }
  return plan
}

// Step 7: an employee behind the counter auto-serves one waiting customer per
// cooldown by pulling the ordered finished dishes from the input chest and
// paying spur coins into the output chest. No layered crafting (finished-dish
// port), so the sale is always "correct" -- score is implicitly 100.
function employeeTick(counter, customers) {
  let employee = findEmployeeEntity(counter)
  if (employee == null) return

  let value = 0
  try {
    value = employee.persistentData.getInt('employee')
  } catch (ignored) {
  }
  // tens digit = level (1/2/3), units digit = mode (0 sells, 1/2 idle).
  if (value <= 0 || value % 10 !== 0) return

  let pcd = getCounterInt(counter, 'pcd', 0)
  if (pcd > 0) {
    setCounterInt(counter, 'pcd', pcd - 1)
    return
  }

  let employeeLevel = Math.floor(value / 10)
  if (employeeLevel < 1) return
  // iron=5s, gold=3s, diamond=1s between sales.
  setCounterInt(counter, 'pcd', 2 * (4 - employeeLevel) - 1)

  let waiting = customers
    .filter(customer => {
      let phase = readCustomerPhase(customer)
      return phase === 2 || phase === 3
    })
    .sort((a, b) => a.x - b.x)
  if (waiting.length === 0) return

  let customer = waiting[0]
  if (readCustomerPhase(customer) === 2) setCustomerPhase(customer, 3)
  let order = readCustomerOrder(customer)
  if (order.length === 0) return

  let level = counter.getLevel()
  // Prefer chests manually bound to this counter with the station linker
  // (stored as "x,y,z" on the counter). If unbound, fall back to the default
  // layout relative to the EMPLOYEE: input (employeeX+1, employeeZ-1),
  // output (employeeX-1, employeeZ-1).
  let ex = Math.floor(employee.x)
  let ey = Math.floor(employee.y)
  let ez = Math.floor(employee.z)
  let inputPos = parsePos(getCounterString(counter, 'inputPos')) || { x: ex + 1, y: ey, z: ez - 1 }
  let outputPos = parsePos(getCounterString(counter, 'outputPos')) || { x: ex - 1, y: ey, z: ez - 1 }
  let inputInventory = blockInventory(level.getBlock(inputPos.x, inputPos.y, inputPos.z))
  let outputInventory = blockInventory(level.getBlock(outputPos.x, outputPos.y, outputPos.z))
  if (inputInventory == null) return
  if (outputInventory == null || inventoryEmptySlots(outputInventory) === 0) return

  let plan = planDishExtraction(inputInventory, order)
  if (plan == null) return

  for (let i = 0; i < plan.length; i++) {
    extractInventoryItem(inputInventory, plan[i], inventoryStack(inputInventory, plan[i]))
  }

  // iron=0.5, gold=0.75, diamond=1.0 efficiency on income and reputation.
  let percent = 1 - 0.25 * (3 - employeeLevel)
  let reputation = getCounterInt(counter, 'reputation', 0)
  let repLevel = reputationLevel(reputation)
  let snacks = lookForSnacks(counter)
  let priceMod = snacks ? snacks.priceMod : 1
  let repMod = snacks ? snacks.repMod : 1
  let money = Math.round(dishPrice(order) * (1 + 0.2 * repLevel) * percent * priceMod)
  let repValue = Math.round(genReputation(order, reputation) * repMod * percent)

  let unpaid = insertMoney(outputInventory, money)
  if (unpaid > 0) {
    console.warn('Selling game: output container full, ' + unpaid + ' spur could not be paid')
  }

  setCounterInt(counter, 'reputation', Math.floor(reputation + repValue))
  setCustomerPhase(customer, 4)
  customer.setPositionAndRotation(customer.x, customer.y, customer.z, 90, 0)
  level.getServer().runCommandSilent('/execute as ' + customer.uuid.toString() + ' at @s run tp @s ~ ~ ~ ~ ~')
  level.spawnParticles('minecraft:happy_villager', false, customer.x, customer.y + 1, customer.z, 0.3, 1, 0.3, 30, 0)
}

function tableTick(counter) {
  let level = counter.getLevel()
  let pos = counter.getBlockPos()
  let menu = readCounterMenu(counter)

  let customers = counterCustomers(counter, 3)
  let xList = []
  for (let i = 0; i < customers.length; i++) xList.push(customers[i].x)
  xList.sort((a, b) => b - a)

  for (let i = 0; i < customers.length; i++) {
    if (readCustomerPhase(customers[i]) <= 4) {
      customerAI(customers[i], xList, counter, menu)
    }
  }

  if (currentGameTime(level) % 20 !== 0) return

  let cd = getCounterInt(counter, 'cd', 0)
  if (cd <= 0) {
    if (validMenu(menu) && level.getDayTime() % 24000 < 12000) {
      if (xList.length === 0 || xList[0] < pos.getX() + 7) {
        spawnCustomer(counter, menu, null)
      }
      cd = randomInt(SELL.CUSTOMER_SPAWN_MIN_SECONDS, SELL.CUSTOMER_SPAWN_MAX_SECONDS)
    }
  }
  cd -= 1
  setCounterInt(counter, 'cd', Math.max(cd, 0))

  employeeTick(counter, customers)
}

// The counter block entity ticks itself every tick (serverTicking + tickFrequency
// enabled in 01_counter_block.js), so there is no per-tick block scanning. This
// replaces a PlayerEvents.tick handler that scanned a ~5400-block cube around
// every player each tick, and it lets counters run whenever the chunk is loaded.
BlockEvents.blockEntityTick('kubejs:counter', event => {
  let counter = event.block.entity
  if (counter != null) tableTick(counter)
})

BlockEvents.rightClicked('kubejs:counter', event => {
  let player = event.player
  let item = event.item
  let itemId = stackId(item)
  let counter = event.block.entity
  let pos = counter.getBlockPos()
  let level = event.level
  let currentMenu = readCounterMenu(counter)

  if (!item || itemId === 'minecraft:air') return

  if (itemId === 'create:filter') {
    let blacklist = isFilterBlacklist(item)
    if (blacklist) {
      closeCounterForNow(counter)
      player.setStatusMessage(Text.translate('message.kubejs.counter.closed_for_now'))
      playCounterSound(event.server, 'minecraft:entity.player.levelup', pos)
      event.cancel()
      return
    }

    if (validMenu(currentMenu)) {
      player.setStatusMessage(Text.translate('message.kubejs.counter.cant_change_menu'))
      playCounterSound(event.server, 'minecraft:block.anvil.land', pos)
      event.cancel()
      return
    }

    let newMenu = readFilterMenu(item, getCounterInt(counter, 'reputation', 0))
    if (!validMenu(newMenu)) {
      player.setStatusMessage(Text.translate('message.kubejs.counter.bad_menu'))
      playCounterSound(event.server, 'minecraft:block.anvil.land', pos)
      event.cancel()
      return
    }

    setCounterMenu(counter, newMenu)
    setCounterInt(counter, 'cd', 0)
    if (level.getDayTime() % 24000 < 12000 && counterCustomers(counter, 3).length === 0) spawnCustomer(counter, newMenu, player)
    player.setStatusMessage(Text.translate('message.kubejs.counter.set_menu'))
    player.tell(Text.translate('message.kubejs.counter.menu_size', newMenu.length))
    playCounterSound(event.server, 'minecraft:entity.player.levelup', pos)
    event.cancel()
    return
  }

  if (itemId === 'minecraft:book') {
    player.setStatusMessage(reputationComponent(getCounterInt(counter, 'reputation', 0)))
    event.cancel()
    return
  }

  let customers = counterCustomers(counter, 2)
  if (itemId === 'minecraft:feather') {
    let customer = findWaitingCustomer(counter)
    if (customer == null) {
      player.setStatusMessage(Text.translate('message.kubejs.counter.new_order'))
      event.cancel()
      return
    }

    let phase = readCustomerPhase(customer)
    if (phase !== 2 && phase !== 3) {
      player.setStatusMessage(Text.translate('message.kubejs.counter.new_order'))
      event.cancel()
      return
    }

    let order = readCustomerOrder(customer)
    if (order.length === 0) {
      setCustomerPhase(customer, 4)
      customer.setPositionAndRotation(customer.x, customer.y, customer.z, 90, 0)
      level.getServer().runCommandSilent('/execute as ' + customer.uuid.toString() + ' at @s run tp @s ~ ~ ~ ~ ~')
      player.setStatusMessage(Text.of('Order data missing. Customer dismissed.'))
      event.cancel()
      return
    }

    startCustomerOrderTimer(customer, level)
    setCustomerPhase(customer, 3)
    setCustomerOrderName(customer)
    player.tell(Text.translate('message.kubejs.counter.order').append(orderComponent(order)))
    playCounterSound(event.server, 'minecraft:item.book.page_turn', pos)
    event.cancel()
    return
  }

  if (DISHES[itemId] && !DISHES[itemId].extra) {
    let customer = findWaitingCustomer(counter)
    if (customer == null) {
      player.setStatusMessage(Text.translate('message.kubejs.counter.new_order'))
      event.cancel()
      return
    }

    let phase = readCustomerPhase(customer)
    if (phase === 2) {
      player.setStatusMessage(Text.translate('message.kubejs.counter.new_order'))
      event.cancel()
      return
    }
    if (phase !== 3) {
      event.cancel()
      return
    }

    let order = readCustomerOrder(customer)
    if (order.length === 0) {
      setCustomerPhase(customer, 4)
      customer.setPositionAndRotation(customer.x, customer.y, customer.z, 90, 0)
      level.getServer().runCommandSilent('/execute as ' + customer.uuid.toString() + ' at @s run tp @s ~ ~ ~ ~ ~')
      player.setStatusMessage(Text.of('Order data missing. Customer dismissed.'))
      event.cancel()
      return
    }

    let delivered = readCustomerDelivered(customer)
    delivered.push(itemId)
    item.shrink(1)
    setCustomerDelivered(customer, delivered)

    if (delivered.length < order.length) {
      player.setStatusMessage(Text.translate('message.kubejs.counter.delivered_progress', delivered.length, order.length))
      playCounterSound(event.server, 'minecraft:entity.item.pickup', pos)
      event.cancel()
      return
    }

    let score = orderFinalScore(delivered, order, customer, level)
    let reputation = getCounterInt(counter, 'reputation', 0)
    let priceMod = 1
    let repMod = 1
    let snacks = score > 0 ? lookForSnacks(counter) : null
    if (snacks != null) {
      priceMod *= snacks.priceMod
      repMod *= snacks.repMod
      player.tell(extraProductText(snacks))
    }

    let repValue = Math.round(genReputation(order, reputation) * repMod)
    let money = Math.round(
      Math.min(dishPrice(order), dishPrice(delivered))
      * (score / 100.0)
      * (1 + 0.2 * reputationLevel(reputation))
      * priceMod
    )

    payMoney(player, money)
    customerReaction(score, player, level, counter, customer, repValue, money)
    setCustomerPhase(customer, 4)
    customer.setPositionAndRotation(customer.x, customer.y, customer.z, 90, 0)
    level.getServer().runCommandSilent('/execute as ' + customer.uuid.toString() + ' at @s run tp @s ~ ~ ~ ~ ~')
    event.cancel()
    return
  }

  if (itemId === 'kubejs:crowbar') {
    if (customers.length !== 0) {
      player.setStatusMessage(Text.translate('message.kubejs.counter.wait_for_leaving'))
      event.cancel()
      return
    }

    clearCounterCache(counter)
    player.give(Item.of('kubejs:counter'))
    item.shrink(1)
    event.block.set('minecraft:air')
    event.cancel()
  }
})

BlockEvents.placed('kubejs:counter', event => {
  let pos = event.block.pos
  let level = event.level

  for (let x = -15; x <= 15; x++) {
    for (let y = -1; y <= 1; y++) {
      for (let z = -2; z <= 2; z++) {
        if (x === 0 && y === 0 && z === 0) continue
        if (level.getBlock(pos.x + x, pos.y + y, pos.z + z) == 'kubejs:counter') {
          if (event.player) {
            event.player.setStatusMessage(Text.translate('message.kubejs.counter_too_close'))
            event.player.give(Item.of('kubejs:counter'))
          }
          playCounterSound(event.server, 'minecraft:block.anvil.land', pos)
          event.block.set('minecraft:air')
          return
        }
      }
    }
  }
})

function employeeModeMessageKey(employee) {
  let mode = employee % 10
  if (mode === 0) return 'message.kubejs.employee.mode_working'
  if (mode === 1) return 'message.kubejs.employee.mode_paused'
  return 'message.kubejs.employee.mode_off'
}

// NOTE (KubeJS 2101): in ItemEvents.entityInteracted, event.entity is the PLAYER
// and event.target is the clicked entity (verified against KubeJS source).
function hireEmployee(event, value, messageKey) {
  let target = event.target
  if (target == null) return
  if (isPlayerEntity(target)) return
  if (!isLivingEntity(target)) return

  try {
    target.persistentData.putInt('employee', value)
  } catch (error) {
    console.warn('Selling game: cannot mark employee: ' + error)
    return
  }

  // Mutate the held item before cancel() -- cancel() throws immediately.
  try {
    if (event.item) event.item.shrink(1)
  } catch (ignored) {
  }

  try {
    if (event.entity) event.entity.setStatusMessage(Text.translate(messageKey))
  } catch (ignored) {
  }

  event.cancel()
}

ItemEvents.entityInteracted('kubejs:iron_contract', event => {
  hireEmployee(event, 10, 'message.kubejs.employee.hired_iron')
})

ItemEvents.entityInteracted('kubejs:gold_contract', event => {
  hireEmployee(event, 20, 'message.kubejs.employee.hired_gold')
})

ItemEvents.entityInteracted('kubejs:diamond_contract', event => {
  hireEmployee(event, 30, 'message.kubejs.employee.hired_diamond')
})

// Brass hand cycles the units digit 0 -> 1 -> 2 -> 0 (working / paused / off).
ItemEvents.entityInteracted('create:brass_hand', event => {
  let target = event.target
  if (target == null) return

  let employee = 0
  try {
    employee = target.persistentData.getInt('employee')
  } catch (ignored) {
  }
  if (employee === 0) return

  employee += 1
  if (employee % 10 > 2) employee -= employee % 10

  try {
    target.persistentData.putInt('employee', employee)
  } catch (error) {
    console.warn('Selling game: cannot switch employee mode: ' + error)
    return
  }

  try {
    if (event.entity) event.entity.setStatusMessage(Text.translate(employeeModeMessageKey(employee)))
  } catch (ignored) {
  }

  event.cancel()
})

// ---- Station linker: manually bind input/output chests to a counter ----

function isSneaking(player) {
  if (player == null) return false
  try {
    if (typeof player.isCrouching === 'function') return player.isCrouching()
  } catch (ignored) {
  }
  try {
    if (typeof player.isShiftKeyDown === 'function') return player.isShiftKeyDown()
  } catch (ignored) {
  }
  try {
    if (player.crouching != null) return !!player.crouching
  } catch (ignored) {
  }
  return false
}

function parsePos(value) {
  if (value == null) return null
  let text = value.toString()
  if (text.length === 0) return null
  let parts = text.split(',')
  if (parts.length !== 3) return null
  let x = parseInt(parts[0], 10)
  let y = parseInt(parts[1], 10)
  let z = parseInt(parts[2], 10)
  if (isNaN(x) || isNaN(y) || isNaN(z)) return null
  return { x: x, y: y, z: z }
}

function findNearestCounter(level, x, y, z, radius) {
  let best = null
  let bestDist = Infinity
  for (let dx = -radius; dx <= radius; dx++) {
    for (let dy = -3; dy <= 3; dy++) {
      for (let dz = -radius; dz <= radius; dz++) {
        let block = level.getBlock(x + dx, y + dy, z + dz)
        if (block != 'kubejs:counter') continue
        let dist = dx * dx + dy * dy + dz * dz
        if (dist < bestDist) {
          bestDist = dist
          best = block.entity
        }
      }
    }
  }
  return best
}

// Right-click a container with the station linker to bind it as the INPUT chest
// of the nearest counter; sneak + right-click binds it as the OUTPUT chest.
BlockEvents.rightClicked(event => {
  let item = event.item
  if (stackId(item) !== 'kubejs:station_linker') return

  let player = event.player
  let block = event.block
  let pos = block.pos

  let inventory = blockInventory(block)
  if (inventory == null) {
    if (player) player.setStatusMessage(Text.translate('message.kubejs.linker.not_container'))
    event.cancel()
    return
  }

  let counter = findNearestCounter(event.level, pos.x, pos.y, pos.z, 8)
  if (counter == null) {
    if (player) player.setStatusMessage(Text.translate('message.kubejs.linker.no_counter'))
    event.cancel()
    return
  }

  let posString = pos.x + ',' + pos.y + ',' + pos.z
  if (isSneaking(player)) {
    setCounterString(counter, 'outputPos', posString)
    if (player) player.setStatusMessage(Text.translate('message.kubejs.linker.bound_output'))
  } else {
    setCounterString(counter, 'inputPos', posString)
    if (player) player.setStatusMessage(Text.translate('message.kubejs.linker.bound_input'))
  }
  event.cancel()
})
