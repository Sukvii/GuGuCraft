// priority: 10000
// THE EDITABLE MENU. Every sellable dish lives here, shared via `global.dishes`
// (assigned in startup -- the only scope where `global` is writable in KubeJS
// 2101 -- and read by the server scripts). Add/remove a dish by editing one line.
//
// Fields: price (base sale price in spur); favor (0-1 weight when an order is
// rolled); chapter (unlock tier, 1 = from the start); category (used for the
// "same category near-miss" partial credit and for the price/reputation trend);
// extra:true marks an upsell snack/drink sold alongside a main dish (Phase 2).
global.dishes = {
  // ===== Farmer's Delight mains / burgers (chapter 1) =====
  'farmersdelight:hamburger': { price: 12, favor: 1.0, chapter: 1, category: 'burger' },
  'farmersdelight:chicken_sandwich': { price: 10, favor: 0.9, chapter: 1, category: 'burger' },
  'farmersdelight:bacon_sandwich': { price: 10, favor: 0.9, chapter: 1, category: 'burger' },
  'farmersdelight:egg_sandwich': { price: 8, favor: 0.8, chapter: 1, category: 'burger' },
  'farmersdelight:mutton_wrap': { price: 11, favor: 0.7, chapter: 1, category: 'burger' },
  'farmersdelight:bacon_and_eggs': { price: 9, favor: 0.8, chapter: 1, category: 'breakfast' },

  // ===== Farmer's Delight soups / stews (chapter 1-2) =====
  'farmersdelight:beef_stew': { price: 12, favor: 0.9, chapter: 1, category: 'soup' },
  'farmersdelight:chicken_soup': { price: 9, favor: 0.8, chapter: 1, category: 'soup' },
  'farmersdelight:vegetable_soup': { price: 7, favor: 0.7, chapter: 1, category: 'soup' },
  'farmersdelight:pumpkin_soup': { price: 8, favor: 0.7, chapter: 1, category: 'soup' },
  'farmersdelight:fish_stew': { price: 10, favor: 0.7, chapter: 2, category: 'soup' },
  'farmersdelight:baked_cod_stew': { price: 11, favor: 0.7, chapter: 2, category: 'soup' },

  // ===== Farmer's Delight rice / noodles / pasta (chapter 1-2) =====
  'farmersdelight:fried_rice': { price: 9, favor: 0.9, chapter: 1, category: 'rice' },
  'farmersdelight:mushroom_rice': { price: 8, favor: 0.8, chapter: 1, category: 'rice' },
  'farmersdelight:noodle_soup': { price: 9, favor: 0.8, chapter: 1, category: 'noodle' },
  'farmersdelight:vegetable_noodles': { price: 8, favor: 0.7, chapter: 1, category: 'noodle' },
  'farmersdelight:pasta_with_meatballs': { price: 13, favor: 0.8, chapter: 2, category: 'pasta' },
  'farmersdelight:pasta_with_mutton_chop': { price: 13, favor: 0.7, chapter: 2, category: 'pasta' },
  'farmersdelight:squid_ink_pasta': { price: 14, favor: 0.6, chapter: 2, category: 'pasta' },

  // ===== Farmer's Delight plated meals (chapter 2, higher price) =====
  'farmersdelight:roast_chicken': { price: 18, favor: 0.7, chapter: 2, category: 'plate' },
  'farmersdelight:honey_glazed_ham': { price: 20, favor: 0.7, chapter: 2, category: 'plate' },
  'farmersdelight:shepherds_pie': { price: 16, favor: 0.7, chapter: 2, category: 'plate' },
  'farmersdelight:stuffed_pumpkin': { price: 15, favor: 0.6, chapter: 2, category: 'plate' },
  'farmersdelight:steak_and_potatoes': { price: 16, favor: 0.8, chapter: 2, category: 'plate' },
  'farmersdelight:grilled_salmon': { price: 14, favor: 0.7, chapter: 2, category: 'plate' },
  'farmersdelight:ratatouille': { price: 12, favor: 0.6, chapter: 2, category: 'plate' },
  'farmersdelight:cabbage_rolls': { price: 10, favor: 0.6, chapter: 2, category: 'main' },
  'farmersdelight:stuffed_potato': { price: 8, favor: 0.7, chapter: 1, category: 'main' },
  'farmersdelight:dumplings': { price: 9, favor: 0.8, chapter: 1, category: 'dumpling' },

  // ===== Kaleidoscope Cookery Chinese dishes (namespace has an underscore!) =====
  'kaleidoscope_cookery:egg_fried_rice': { price: 9, favor: 0.9, chapter: 1, category: 'rice' },
  'kaleidoscope_cookery:scramble_egg_with_tomatoes': { price: 8, favor: 0.9, chapter: 1, category: 'main' },
  'kaleidoscope_cookery:mantou': { price: 4, favor: 0.7, chapter: 1, category: 'pastry' },
  'kaleidoscope_cookery:baozi': { price: 6, favor: 0.8, chapter: 1, category: 'pastry' },
  'kaleidoscope_cookery:dumpling': { price: 8, favor: 0.8, chapter: 1, category: 'dumpling' },
  'kaleidoscope_cookery:cooked_rice': { price: 3, favor: 0.6, chapter: 1, category: 'rice' },
  'kaleidoscope_cookery:braised_beef': { price: 16, favor: 0.8, chapter: 2, category: 'plate' },
  'kaleidoscope_cookery:braised_beef_rice_bowl': { price: 17, favor: 0.9, chapter: 2, category: 'rice' },
  'kaleidoscope_cookery:braised_beef_with_potatoes': { price: 18, favor: 0.7, chapter: 2, category: 'plate' },
  'kaleidoscope_cookery:beef_noodle': { price: 14, favor: 0.9, chapter: 2, category: 'noodle' },
  'kaleidoscope_cookery:hot_dry_noodles': { price: 12, favor: 0.8, chapter: 2, category: 'noodle' },
  'kaleidoscope_cookery:hui_noodle': { price: 13, favor: 0.7, chapter: 2, category: 'noodle' },
  'kaleidoscope_cookery:udon_noodle': { price: 12, favor: 0.7, chapter: 2, category: 'noodle' },
  'kaleidoscope_cookery:fish_flavored_shredded_pork': { price: 14, favor: 0.8, chapter: 2, category: 'main' },
  'kaleidoscope_cookery:stir_fried_pork_with_peppers': { price: 13, favor: 0.8, chapter: 2, category: 'main' },
  'kaleidoscope_cookery:sweet_and_sour_pork': { price: 15, favor: 0.8, chapter: 2, category: 'main' },
  'kaleidoscope_cookery:beef_meatball_soup': { price: 13, favor: 0.7, chapter: 2, category: 'soup' },
  'kaleidoscope_cookery:borscht': { price: 12, favor: 0.6, chapter: 2, category: 'soup' },
  'kaleidoscope_cookery:pork_bone_soup': { price: 13, favor: 0.7, chapter: 2, category: 'soup' },
  'kaleidoscope_cookery:lamb_and_radish_soup': { price: 14, favor: 0.6, chapter: 2, category: 'soup' },
  'kaleidoscope_cookery:chicken_and_mushroom_stew': { price: 15, favor: 0.7, chapter: 2, category: 'soup' },
  'kaleidoscope_cookery:sashimi': { price: 18, favor: 0.6, chapter: 3, category: 'plate' },
  'kaleidoscope_cookery:donkey_burger': { price: 11, favor: 0.8, chapter: 2, category: 'burger' },
  'kaleidoscope_cookery:meat_pie': { price: 10, favor: 0.7, chapter: 2, category: 'pastry' },

  // ===== Higher-chapter exotic dishes (chapter 3-4, high price) =====
  'ends_delight:end_mixed_salad': { price: 16, favor: 0.6, chapter: 3, category: 'salad' },
  'ends_delight:dragon_meat_stew': { price: 30, favor: 0.5, chapter: 4, category: 'plate' },
  'ends_delight:ender_noodle': { price: 22, favor: 0.6, chapter: 3, category: 'noodle' },
  'ends_delight:shulker_soup': { price: 20, favor: 0.5, chapter: 3, category: 'soup' },
  'mynethersdelight:nether_burger': { price: 18, favor: 0.7, chapter: 3, category: 'burger' },
  'mynethersdelight:hotdog': { price: 12, favor: 0.7, chapter: 2, category: 'burger' },
  'mynethersdelight:spicy_curry': { price: 16, favor: 0.6, chapter: 3, category: 'main' },
  'mynethersdelight:crimson_stroganoff': { price: 19, favor: 0.6, chapter: 3, category: 'plate' },
  'mynethersdelight:sausage_and_potatoes': { price: 13, favor: 0.7, chapter: 2, category: 'plate' },

  // ===== Extra upsell snacks / drinks (extra:true, Phase 2) =====
  // These are NOT placed in a chest -- they are DISPLAYED on Create table cloths
  // (create:table_cloth) set up near the counter, and a customer may grab one
  // along with their main dish. Unlike main dishes, an extra does NOT add its
  // own price; instead it MULTIPLIES the order's income (priceMod) and the
  // reputation gain (repMod). snackType groups them: 1 = food, 2 = drink. At
  // most one food and one drink are upsold per order, so a varied display sells
  // more. price/favor/category are kept for reference but unused at settlement.
  'farmersdelight:barbecue_stick': { price: 6, favor: 1.0, chapter: 1, category: 'snack', extra: true, snackType: 1, priceMod: 1.1, repMod: 0.8 },
  'farmersdelight:fruit_salad': { price: 7, favor: 0.9, chapter: 1, category: 'snack', extra: true, snackType: 1, priceMod: 1.25, repMod: 0.8 },
  'farmersdelight:mixed_salad': { price: 6, favor: 0.9, chapter: 1, category: 'snack', extra: true, snackType: 1, priceMod: 1.05, repMod: 0.9 },
  'farmersdelight:glow_berry_custard': { price: 8, favor: 0.8, chapter: 2, category: 'dessert', extra: true, snackType: 1, priceMod: 0.8, repMod: 1.5 },
  'farmersdelight:apple_pie_slice': { price: 7, favor: 0.8, chapter: 1, category: 'dessert', extra: true, snackType: 1, priceMod: 1.2, repMod: 0.9 },
  'farmersdelight:apple_cider': { price: 5, favor: 0.9, chapter: 1, category: 'drink', extra: true, snackType: 2, priceMod: 0.75, repMod: 1.2 },
  'farmersdelight:melon_juice': { price: 5, favor: 0.9, chapter: 1, category: 'drink', extra: true, snackType: 2, priceMod: 0.9, repMod: 1.2 },
  'farmersdelight:hot_cocoa': { price: 5, favor: 0.8, chapter: 1, category: 'drink', extra: true, snackType: 2, priceMod: 0.85, repMod: 1.3 }
}

// Convenience views (also shared, read by server scripts).
global.mainDishIds = Object.keys(global.dishes).filter(id => !global.dishes[id].extra)
global.extraDishIds = Object.keys(global.dishes).filter(id => global.dishes[id].extra)

// Snack view: id -> { snackType, priceMod, repMod } for every extra:true dish.
// The table-cloth upsell scan (server_scripts/selling_game/02_counter.js) reads
// this to recognise a displayed item as a sellable snack/drink.
global.snacks = {}
global.extraDishIds.forEach(id => {
  let d = global.dishes[id]
  global.snacks[id] = { snackType: d.snackType || 1, priceMod: d.priceMod == null ? 1 : d.priceMod, repMod: d.repMod == null ? 1 : d.repMod }
})
