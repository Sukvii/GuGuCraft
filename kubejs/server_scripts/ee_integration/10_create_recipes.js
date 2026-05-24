const EEI_NS = 'emendatusenigmatica'
const EEI_ORE = id => `${EEI_NS}:${id}_ore`
const EEI_DEEPSLATE_ORE = id => `${EEI_NS}:${id}_deepslate_ore`
const EEI_NETHERRACK_ORE = id => `${EEI_NS}:${id}_netherrack_ore`

const EEI = {
  vanillaMaterials: [
    {
      id: 'coal',
      base: 'minecraft:coal',
      dust: `${EEI_NS}:coal_dust`,
      oreDrop: { item: 'minecraft:coal', min: 1, max: 1 },
      ores: [EEI_ORE('coal'), EEI_DEEPSLATE_ORE('coal'), EEI_NETHERRACK_ORE('coal')]
    },
    {
      id: 'copper',
      base: 'minecraft:copper_ingot',
      dust: `${EEI_NS}:copper_dust`,
      plate: `${EEI_NS}:copper_plate`,
      gear: `${EEI_NS}:copper_gear`,
      oreDrop: { item: 'minecraft:raw_copper', min: 2, max: 5 },
      ores: [EEI_ORE('copper'), EEI_DEEPSLATE_ORE('copper'), EEI_NETHERRACK_ORE('copper')]
    },
    {
      id: 'diamond',
      base: 'minecraft:diamond',
      dust: `${EEI_NS}:diamond_dust`,
      gear: `${EEI_NS}:diamond_gear`,
      oreDrop: { item: 'minecraft:diamond', min: 1, max: 1 },
      ores: [EEI_ORE('diamond'), EEI_DEEPSLATE_ORE('diamond'), EEI_NETHERRACK_ORE('diamond')]
    },
    {
      id: 'emerald',
      base: 'minecraft:emerald',
      dust: `${EEI_NS}:emerald_dust`,
      gear: `${EEI_NS}:emerald_gear`,
      oreDrop: { item: 'minecraft:emerald', min: 1, max: 1 },
      ores: [EEI_ORE('emerald'), EEI_DEEPSLATE_ORE('emerald'), EEI_NETHERRACK_ORE('emerald')]
    },
    {
      id: 'gold',
      base: 'minecraft:gold_ingot',
      dust: `${EEI_NS}:gold_dust`,
      gear: `${EEI_NS}:gold_gear`,
      oreDrop: { item: 'minecraft:raw_gold', min: 1, max: 1 },
      ores: [EEI_ORE('gold'), EEI_DEEPSLATE_ORE('gold'), EEI_NETHERRACK_ORE('gold')]
    },
    {
      id: 'iron',
      base: 'minecraft:iron_ingot',
      dust: `${EEI_NS}:iron_dust`,
      gear: `${EEI_NS}:iron_gear`,
      oreDrop: { item: 'minecraft:raw_iron', min: 1, max: 1 },
      ores: [EEI_ORE('iron'), EEI_DEEPSLATE_ORE('iron'), EEI_NETHERRACK_ORE('iron')]
    },
    {
      id: 'lapis',
      base: 'minecraft:lapis_lazuli',
      dust: `${EEI_NS}:lapis_dust`,
      gear: `${EEI_NS}:lapis_gear`,
      oreDrop: { item: 'minecraft:lapis_lazuli', min: 4, max: 9 },
      ores: [EEI_ORE('lapis'), EEI_DEEPSLATE_ORE('lapis'), EEI_NETHERRACK_ORE('lapis')]
    },
    {
      id: 'quartz',
      base: 'minecraft:quartz',
      dust: `${EEI_NS}:quartz_dust`,
      gear: `${EEI_NS}:quartz_gear`,
      oreDrop: { item: 'minecraft:quartz', min: 1, max: 1 },
      ores: [EEI_ORE('quartz'), EEI_DEEPSLATE_ORE('quartz'), EEI_NETHERRACK_ORE('quartz')]
    },
    {
      id: 'redstone',
      base: 'minecraft:redstone',
      oreDrop: { item: 'minecraft:redstone', min: 4, max: 5 },
      ores: [EEI_ORE('redstone'), EEI_DEEPSLATE_ORE('redstone'), EEI_NETHERRACK_ORE('redstone')]
    }
  ],
  createMaterials: [
    {
      id: 'brass',
      base: 'create:brass_ingot',
      dust: `${EEI_NS}:brass_dust`,
      gear: `${EEI_NS}:brass_gear`
    },
    {
      id: 'zinc',
      base: 'create:zinc_ingot',
      dust: `${EEI_NS}:zinc_dust`,
      gear: `${EEI_NS}:zinc_gear`,
      rod: `${EEI_NS}:zinc_rod`,
      crushed: `${EEI_NS}:crushed_zinc_ore`,
      ores: [EEI_ORE('zinc'), EEI_DEEPSLATE_ORE('zinc'), EEI_NETHERRACK_ORE('zinc')],
      raw: 'create:raw_zinc',
      rawBlock: 'create:raw_zinc_block',
      smelted: 'create:zinc_ingot',
      washed: 'create:zinc_nugget'
    }
  ]
}

ServerEvents.recipes(event => {
  const MAX_CRUSHING_OUTPUTS = 7
  const hasItem = id => !!id && Item.exists(id)
  const hasAll = ids => ids.every(hasItem)
  const sanitize = id => id.replace(':', '/')
  const allMaterials = EEI.vanillaMaterials.concat(EEI.createMaterials)
  const removedEeOutputs = [
    `${EEI_NS}:copper_rod`,
    `${EEI_NS}:iron_rod`,
    `${EEI_NS}:gold_rod`,
    `${EEI_NS}:brass_rod`,
    `${EEI_NS}:iron_plate`,
    `${EEI_NS}:gold_plate`,
    `${EEI_NS}:zinc_plate`
  ]

  const guaranteedOutput = (item, count) => {
    if (!count || count === 1) {
      return item
    }

    return Item.of(item, count)
  }

  const chanceOutput = (item, chance, count) => {
    if (!count || count === 1) {
      return CreateItem.of(item, chance)
    }

    return CreateItem.of(Item.of(item, count), chance)
  }

  const oreByproduct = input => {
    if (input.includes('_deepslate_ore')) {
      return 'minecraft:cobbled_deepslate'
    }

    if (input.includes('_netherrack_ore')) {
      return 'minecraft:netherrack'
    }

    return 'minecraft:cobblestone'
  }

  const splitBonusOutputs = (item, totalCount, chance, maxSlots) => {
    if (totalCount <= 0 || maxSlots <= 0) {
      return []
    }

    const slots = Math.min(totalCount, maxSlots)
    const baseSize = Math.floor(totalCount / slots)
    const remainder = totalCount % slots
    const results = []

    for (let i = 0; i < slots; i++) {
      const stackCount = baseSize + (i < remainder ? 1 : 0)
      results.push(chanceOutput(item, chance, stackCount))
    }

    return results
  }

  const oreCrushingOutputs = (input, oreDrop) => {
    const results = [guaranteedOutput(oreDrop.item, oreDrop.min)]
    const hasExp = hasItem('create:experience_nugget')
    const byproduct = hasItem(oreByproduct(input)) ? oreByproduct(input) : null
    const freeBonusSlots = MAX_CRUSHING_OUTPUTS - 1 - (hasExp ? 1 : 0) - (byproduct ? 1 : 0)
    const bonusCount = Math.max(0, oreDrop.max - oreDrop.min)

    splitBonusOutputs(oreDrop.item, bonusCount, 0.5, freeBonusSlots).forEach(output => results.push(output))

    if (hasExp) {
      results.push(chanceOutput('create:experience_nugget', 0.75, 1))
    }

    if (byproduct) {
      results.push(chanceOutput(byproduct, 0.125, 1))
    }

    return results
  }

  const zincOreOutputs = input => {
    const results = []
    const byproduct = hasItem(oreByproduct(input)) ? oreByproduct(input) : null
    const deep = input.includes('_deepslate_ore')

    results.push(guaranteedOutput(`${EEI_NS}:crushed_zinc_ore`, deep ? 2 : 1))
    results.push(chanceOutput(`${EEI_NS}:crushed_zinc_ore`, deep ? 0.25 : 0.75, 1))

    if (hasItem('create:experience_nugget')) {
      results.push(chanceOutput('create:experience_nugget', 0.75, 1))
    }

    if (byproduct) {
      results.push(chanceOutput(byproduct, 0.125, 1))
    }

    return results
  }

  allMaterials.forEach(material => {
    if (hasItem(material.gear)) {
      event.remove({ output: material.gear })
    }

    if (material.dust && hasItem('emendatusenigmatica:enigmatic_hammer')) {
      event.remove({ input: 'emendatusenigmatica:enigmatic_hammer', output: material.dust })
    }
  })

  removedEeOutputs.forEach(output => {
    if (hasItem(output)) {
      event.remove({ output: output })
    }
  })

  const addMillingDust = material => {
    if (!hasAll([material.base, material.dust])) {
      return
    }

    event.recipes.create.milling(material.dust, material.base)
      .processingTime(200)
      .id(`kubejs:ee_integration/create/milling/${material.id}_dust`)
  }

  const addCrushingDust = material => {
    if (!hasAll([material.base, material.dust])) {
      return
    }

    event.recipes.create.crushing(material.dust, material.base)
      .processingTime(250)
      .id(`kubejs:ee_integration/create/crushing/${material.id}_dust`)
  }

  const addPressingPlate = material => {
    if (!hasAll([material.base, material.plate])) {
      return
    }

    event.recipes.create.pressing(material.plate, material.base)
      .id(`kubejs:ee_integration/create/pressing/${material.id}_plate`)
  }

  const addCuttingRod = material => {
    if (!hasAll([material.base, material.rod])) {
      return
    }

    event.recipes.create.cutting(Item.of(material.rod, 2), material.base)
      .processingTime(50)
      .id(`kubejs:ee_integration/create/cutting/${material.id}_rod`)
  }

  const addCraftingGear = material => {
    if (!hasAll([material.base, material.gear, 'create:shaft'])) {
      return
    }

    event.shaped(material.gear, [
      ' A ',
      'ASA',
      ' A '
    ], {
      A: material.base,
      S: 'create:shaft'
    }).id(`kubejs:ee_integration/crafting/${material.id}_gear`)
  }

  const addOreCrushing = material => {
    if (!material.ores || !material.oreDrop || !hasItem(material.oreDrop.item)) {
      return
    }

    material.ores.forEach(input => {
      if (!hasItem(input)) {
        return
      }

      event.recipes.create.crushing(oreCrushingOutputs(input, material.oreDrop), input)
        .processingTime(input.includes('_deepslate_ore') ? 350 : 250)
        .id(`kubejs:ee_integration/create/crushing/${sanitize(input)}`)
    })
  }

  const addZincOreProcessing = material => {
    if (!material.crushed || !material.ores || !hasItem(material.crushed)) {
      return
    }

    material.ores.forEach(input => {
      if (!hasItem(input)) {
        return
      }

      event.recipes.create.crushing(zincOreOutputs(input), input)
        .processingTime(input.includes('_deepslate_ore') ? 350 : 250)
        .id(`kubejs:ee_integration/create/crushing/${sanitize(input)}_to_crushed`)
    })

    if (hasAll([material.raw, material.crushed])) {
      const outputs = [material.crushed]
      if (hasItem('create:experience_nugget')) {
        outputs.push(chanceOutput('create:experience_nugget', 0.75, 1))
      }

      event.recipes.create.crushing(outputs, material.raw)
        .processingTime(400)
        .id('kubejs:ee_integration/create/crushing/raw_zinc')
    }

    if (hasAll([material.rawBlock, material.crushed])) {
      const outputs = [Item.of(material.crushed, 9)]
      if (hasItem('create:experience_nugget')) {
        outputs.push(chanceOutput('create:experience_nugget', 0.75, 9))
      }

      event.recipes.create.crushing(outputs, material.rawBlock)
        .processingTime(400)
        .id('kubejs:ee_integration/create/crushing/raw_zinc_block')
    }

    if (hasAll([material.crushed, material.washed])) {
      const outputs = [Item.of(material.washed, 9)]
      if (hasItem('minecraft:gunpowder')) {
        outputs.push(chanceOutput('minecraft:gunpowder', 0.25, 1))
      }

      event.recipes.create.splashing(outputs, material.crushed)
        .id('kubejs:ee_integration/create/splashing/crushed_zinc')
    }

    if (hasAll([material.crushed, material.smelted])) {
      event.smelting(material.smelted, material.crushed)
        .xp(0.1)
        .id('kubejs:ee_integration/create/smelting/zinc_ingot_from_crushed')

      event.blasting(material.smelted, material.crushed)
        .xp(0.1)
        .id('kubejs:ee_integration/create/blasting/zinc_ingot_from_crushed')
    }
  }

  EEI.vanillaMaterials.forEach(material => {
    addMillingDust(material)
    addCrushingDust(material)
    addPressingPlate(material)
    addCuttingRod(material)
    addCraftingGear(material)
    addOreCrushing(material)
  })

  EEI.createMaterials.forEach(material => {
    addMillingDust(material)
    addCrushingDust(material)
    addPressingPlate(material)
    addCuttingRod(material)
    addCraftingGear(material)
  })

  const zinc = EEI.createMaterials.find(material => material.id === 'zinc')
  if (zinc) {
    addZincOreProcessing(zinc)
  }
})

