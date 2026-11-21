const $Component = Java.loadClass('net.minecraft.network.chat.Component')

// Title shown when a stage is unlocked; translated on the client (kubejs.stage.unlocked in kubejs/assets/kubejs/lang)
const unlockedTitle = () => Text.translatableWithFallback('kubejs.stage.unlocked', 'Technology unlocked!')

AStageEvents.added(event => {
    event.server.runCommandSilent(`execute as ${event.player.username} at @s run playsound minecraft:entity.player.levelup player @s ~ ~ ~ 0.8 1.2`)
})

AStages.customizeStage('lock')

AStages.addRestrictionForMod('astages/mod/ae2', 'lock', 'ae2')

AStages.customizeStage('practice_phase1')
    .setAddTitle(unlockedTitle())

AStages.addRestrictionForItem('astages/item/deduction_casing', 'practice_phase1', 'guguaddons:deduction_casing')
AStages.addRestrictionForRecipe('astages/recipe/deduction_casing', 'practice_phase1', 'create:sequenced_assembly', 'kubejs:sequenced_assembly/deduction_casing')

AStages.customizeStage('practice_phase2')
    .setAddTitle(unlockedTitle())

AStages.addRestrictionForItem('astages/item/quest_submission', 'practice_phase2', 'guguaddons:quest_submission')
AStages.addRestrictionForItem('astages/item/quest_input', 'practice_phase2', 'guguaddons:quest_input')
AStages.addRestrictionForRecipe('astages/recipe/quest_submission', 'practice_phase2', 'minecraft:crafting', 'kubejs:crafting/quest_submission')
AStages.addRestrictionForRecipe('astages/recipe/quest_input', 'practice_phase2', 'minecraft:crafting', 'kubejs:crafting/quest_input')

AStages.customizeStage('interface_upgrade_1')
    .setAddTitle(unlockedTitle())

AStages.addRestrictionForItem('astages/item/interface_upgrade_1', 'interface_upgrade_1', 'guguaddons:interface_upgrade_1')

AStages.customizeStage('interface_upgrade_2')
    .setAddTitle(unlockedTitle())

AStages.addRestrictionForItem('astages/item/interface_upgrade_2', 'interface_upgrade_2', 'guguaddons:interface_upgrade_2')

AStages.customizeStage('interface_upgrade_3')
    .setAddTitle(unlockedTitle())

AStages.addRestrictionForItem('astages/item/interface_upgrade_3', 'interface_upgrade_3', 'guguaddons:interface_upgrade_3')

AStages.customizeStage('slash_back_terminal')
    .setAddTitle(unlockedTitle())

AStages.addRestrictionForItem('astages/item/slash_back_terminal', 'slash_back_terminal', 'guguaddons:slash_back_terminal')

AStages.customizeStage('fluid_drill')
    .setAddTitle(unlockedTitle())

AStages.addRestrictionForItem('astages/item/fluid_drill', 'fluid_drill', 'createoreexcavation:extractor')

// Basic Research main line: Mythril -> Liquid Source -> Hallowed Gold -> Arcane Ingot / Arcane Sheet -> Arcane Mechanism, one stage per node
AStages.customizeStage('mythril')
    .setAddTitle(unlockedTitle())

AStages.customizeStage('liquid_source')
    .setAddTitle(unlockedTitle())

AStages.addRestrictionForItem('astages/item/sal_ammoniac_accumulator', 'liquid_source', 'theurgy:sal_ammoniac_accumulator')
AStages.addRestrictionForItem('astages/item/sal_ammoniac_tank', 'liquid_source', 'theurgy:sal_ammoniac_tank')

AStages.customizeStage('hallowed_gold')
    .setAddTitle(unlockedTitle())

AStages.addRestrictionForItem('astages/item/liquefaction_cauldron', 'hallowed_gold', 'theurgy:liquefaction_cauldron')
AStages.addRestrictionForItem('astages/item/pyromantic_brazier', 'hallowed_gold', 'theurgy:pyromantic_brazier')
AStages.addRestrictionForItem('astages/item/calcination_oven', 'hallowed_gold', 'theurgy:calcination_oven')

AStages.customizeStage('arcane_ingot')
    .setAddTitle(unlockedTitle())

AStages.customizeStage('arcane_mechanism')
    .setAddTitle(unlockedTitle())

AStages.addRestrictionForItem('astages/item/arcane_mechanism', 'arcane_mechanism', 'kubejs:arcane_mechanism')

// Legacy stages: they no longer lock anything; stages/legacy.js maps them to the new stages
AStages.customizeStage('theurgy_machines_1')
    .setAddTitle(unlockedTitle())

GuGuMachineStageEvents.register(event => {
    event.addRecipes('create:mixing', [
        'kubejs:mixing/mythril_mixture',
        'guguaddons:mixing/mythril_solvent'
    ], 'mythril')
    event.addRecipe('create:compacting', 'guguaddons:compating/mythril_ingot', 'mythril')

    event.addRecipe('lychee:block_interacting', 'guguaddons:lychee/block_interacting/sal_ammoniac_tank', 'liquid_source')

    event.addRecipes('lychee:block_interacting', [
        'guguaddons:lychee/block_interacting/liquefaction_cauldron',
        'guguaddons:lychee/block_interacting/pyromantic_brazier',
        'guguaddons:lychee/block_interacting/calcination_oven',
        'guguaddons:lychee/block_interacting/imbuement_chamber',
        'guguaddons:lychee/block_interacting/arcane_pedestal'
    ], 'hallowed_gold')

    event.addRecipe('create:mixing', 'guguaddons:mixing/arcane_ingot', 'arcane_ingot')
    event.addRecipe('create:pressing', 'guguaddons:pressing/arcane_sheet', 'arcane_ingot')

    event.addRecipe('create:sequenced_assembly', 'guguaddons:sequenced_assembly/arcane_mechanism', 'arcane_mechanism')

    event.addRecipe('create:mechanical_crafting', 'guguaddons:mechanical_crafting/extractor', 'fluid_drill')
})

AStages.customizeStage('torchmaster_1')
    .setAddTitle(unlockedTitle())

AStages.addRestrictionForItem('astages/item/megatorch', 'torchmaster_1', 'torchmaster:megatorch')
AStages.addRestrictionForRecipe('astages/recipe/megatorch', 'torchmaster_1', 'minecraft:crafting', 'torchmaster:megatorch')

AStages.customizeStage('torchmaster_2')
    .setAddTitle(unlockedTitle())

AStages.addRestrictionForItem('astages/item/dreadlamp', 'torchmaster_2', 'torchmaster:dreadlamp')
AStages.addRestrictionForRecipe('astages/recipe/dreadlamp', 'torchmaster_2', 'minecraft:crafting', 'torchmaster:dreadlamp')

AStages.customizeStage('torchmaster_3')
    .setAddTitle(unlockedTitle())

AStages.addRestrictionForItem('astages/item/feral_flare_lantern', 'torchmaster_3', 'torchmaster:feral_flare_lantern')
AStages.addRestrictionForRecipe('astages/recipe/feral_flare_lantern', 'torchmaster_3', 'minecraft:crafting', 'torchmaster:feral_flare_lantern')

AStages.customizeStage('jetpack_1')
    .setAddTitle(unlockedTitle())

AStages.addRestrictionForItem('astages/item/jetpack', 'jetpack_1', 'create_jetpack:jetpack')

AStages.customizeStage('jetpack_2')
    .setAddTitle(unlockedTitle())

AStages.addRestrictionForItem('astages/item/netherite_jetpack', 'jetpack_2', 'create_jetpack:netherite_jetpack')
