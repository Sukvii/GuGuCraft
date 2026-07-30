// priority: 1000
// Selling-game gameplay constants + coin denominations.
//
// KubeJS 2101: `global` is the cross-script-type sharing mechanism, but it is
// WRITABLE ONLY in startup scripts (server/client scripts get a read-only view
// that throws on assignment). So all shared config is assigned here in startup
// and merely READ by the server scripts (02_counter.js). Edit values here.
global.SELL = {
  ORDER_SIZE_BASE: 1,        // dishes per order at reputation 0
  ORDER_SIZE_MAX: 3,         // cap as reputation grows
  CATEGORY_PARTIAL: 0.5,     // credit for a same-category near-miss dish
  WRONG_PENALTY: 0.0,        // credit for a completely wrong dish
  ALLOW_DUP_ORDER: false,    // may one order list the same dish twice
  CUSTOMER_ENTITY: 'easy_npc:humanoid',
  CUSTOMER_SPAWN_MIN_SECONDS: 5,
  CUSTOMER_SPAWN_MAX_SECONDS: 10,
  // Extra-product upsell: snacks/drinks are DISPLAYED on Create table cloths
  // (create:table_cloth) around the counter, and a customer may grab one with
  // their order. SNACK_SCAN bounds the search box: cloths at (counterY+Y_OFFSET)
  // within +/-RADIUS on both horizontal axes are inspected.
  //
  // The chance to upsell scales with how many snacks of a category are on
  // display, capped so it never gets too likely:
  //   chance = min(SELL_CHANCE_CAP, count * SELL_CHANCE_PER)
  // With the defaults below: 1 item -> 15%, 2 -> 30%, 3 -> 45%, 4+ -> 50%.
  // Food and drink roll independently, so a varied stand sells more.
  // (EXTRA_SELL_CHANCE was the old adjacent-chest design.)
  SNACK_SCAN: { RADIUS: 3, Y_OFFSET: 1, SELL_CHANCE_PER: 0.15, SELL_CHANCE_CAP: 0.5 },
  ORDER_TIME_VERY_HAPPY_SECONDS: 30,  // deliver within -> up to score 100
  ORDER_TIME_HAPPY_SECONDS: 60,       // -> up to 75
  ORDER_TIME_NEUTRAL_SECONDS: 90,     // -> up to 50
  ORDER_TIME_ANGRY_SECONDS: 120,      // -> up to 25; later -> 0
  TREND_CATEGORIES: [
    'burger',
    'soup',
    'rice',
    'noodle',
    'plate',
    'main',
    'pastry',
    'dumpling',
    'pasta',
    'breakfast',
    'salad'
  ]
}

// Create: Numismatics coin denominations (spur is the base unit), largest first.
// Settlement splits a spur amount into the fewest coins using this table.
global.COIN_DENOMS = [
  ['numismatics:sun', 4096],
  ['numismatics:crown', 512],
  ['numismatics:cog', 64],
  ['numismatics:sprocket', 16],
  ['numismatics:bevel', 8],
  ['numismatics:spur', 1]
]
