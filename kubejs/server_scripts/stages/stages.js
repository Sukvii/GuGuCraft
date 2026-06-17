const $Component = Java.loadClass('net.minecraft.network.chat.Component')

AStageEvents.added(event => {
    event.server.runCommandSilent(`execute as ${event.player.username} at @s run playsound minecraft:entity.player.levelup player @s ~ ~ ~ 0.8 1.2`)
})

AStages.customizeStage('lock')

AStages.addRestrictionForMod('astages/mod/ae2', 'lock', 'ae2')

AStages.customizeStage('practice_phase1')
    .setAddTitle('科技已解锁！')

AStages.addRestrictionForItem('astages/item/deduction_casing', 'practice_phase1', 'guguaddons:deduction_casing')
AStages.addRestrictionForRecipe('astages/recipe/deduction_casing', 'practice_phase1', 'create:sequenced_assembly', 'kubejs:sequenced_assembly/deduction_casing')

AStages.customizeStage('practice_phase2')
    .setAddTitle('科技已解锁！')

AStages.addRestrictionForItem('astages/item/quest_submission', 'practice_phase2', 'guguaddons:quest_submission')
AStages.addRestrictionForItem('astages/item/quest_input', 'practice_phase2', 'guguaddons:quest_input')
AStages.addRestrictionForRecipe('astages/recipe/quest_submission', 'practice_phase2', 'minecraft:crafting', 'kubejs:crafting/quest_submission')
AStages.addRestrictionForRecipe('astages/recipe/quest_input', 'practice_phase2', 'minecraft:crafting', 'kubejs:crafting/quest_input')

AStages.customizeStage('interface_upgrade_1')
    .setAddTitle('科技已解锁！')

AStages.addRestrictionForItem('astages/item/interface_upgrade_1', 'interface_upgrade_1', 'guguaddons:interface_upgrade_1')

AStages.customizeStage('interface_upgrade_2')
    .setAddTitle('科技已解锁！')

AStages.addRestrictionForItem('astages/item/interface_upgrade_2', 'interface_upgrade_2', 'guguaddons:interface_upgrade_2')

AStages.customizeStage('interface_upgrade_3')
    .setAddTitle('科技已解锁！')

AStages.addRestrictionForItem('astages/item/interface_upgrade_3', 'interface_upgrade_3', 'guguaddons:interface_upgrade_3')

AStages.customizeStage('slash_back_terminal')
    .setAddTitle('科技已解锁！')

AStages.addRestrictionForItem('astages/item/slash_back_terminal', 'slash_back_terminal', 'guguaddons:slash_back_terminal')

AStages.customizeStage('fluid_drill')
    .setAddTitle('科技已解锁！')

AStages.addRestrictionForItem('astages/item/fluid_drill', 'fluid_drill', 'createoreexcavation:extractor')

AStages.customizeStage('arcane_mechanism')
    .setAddTitle('科技已解锁！')

AStages.addRestrictionForItem('astages/item/arcane_mechanism', 'arcane_mechanism', 'kubejs:arcane_mechanism')

AStages.customizeStage('theurgy_machines_1')
    .setAddTitle('科技已解锁！')

AStages.addRestrictionForItem('astages/item/sal_ammoniac_accumulator', 'theurgy_machines_1', 'theurgy:sal_ammoniac_accumulator')
AStages.addRestrictionForItem('astages/item/calcination_oven', 'theurgy_machines_1', 'theurgy:calcination_oven')
AStages.addRestrictionForItem('astages/item/pyromantic_brazier', 'theurgy_machines_1', 'theurgy:pyromantic_brazier')
AStages.addRestrictionForItem('astages/item/sal_ammoniac_tank', 'theurgy_machines_1', 'theurgy:sal_ammoniac_tank')
AStages.addRestrictionForItem('astages/item/liquefaction_cauldron', 'theurgy_machines_1', 'theurgy:liquefaction_cauldron')

GuGuMachineStageEvents.register(event => {
    event.addRecipes('lychee:block_interacting', [
        'guguaddons:lychee/block_interacting/calcination_oven',
        'guguaddons:lychee/block_interacting/pyromantic_brazier',
        'guguaddons:lychee/block_interacting/sal_ammoniac_tank',
        'guguaddons:lychee/block_interacting/liquefaction_cauldron'
    ], 'theurgy_machines_1')
    event.addRecipe('create:mechanical_crafting', 'createoreexcavation:extractor', 'fluid_drill')
})

AStages.customizeStage('torchmaster_1')
    .setAddTitle('科技已解锁！')

AStages.addRestrictionForItem('astages/item/megatorch', 'torchmaster_1', 'torchmaster:megatorch')
AStages.addRestrictionForRecipe('astages/recipe/megatorch', 'torchmaster_1', 'minecraft:crafting', 'torchmaster:megatorch')

AStages.customizeStage('torchmaster_2')
    .setAddTitle('科技已解锁！')

AStages.addRestrictionForItem('astages/item/dreadlamp', 'torchmaster_2', 'torchmaster:dreadlamp')
AStages.addRestrictionForRecipe('astages/recipe/dreadlamp', 'torchmaster_2', 'minecraft:crafting', 'torchmaster:dreadlamp')

AStages.customizeStage('torchmaster_3')
    .setAddTitle('科技已解锁！')

AStages.addRestrictionForItem('astages/item/feral_flare_lantern', 'torchmaster_3', 'torchmaster:feral_flare_lantern')
AStages.addRestrictionForRecipe('astages/recipe/feral_flare_lantern', 'torchmaster_3', 'minecraft:crafting', 'torchmaster:feral_flare_lantern')

AStages.customizeStage('jetpack_1')
    .setAddTitle('科技已解锁！')

AStages.addRestrictionForItem('astages/item/jetpack', 'jetpack_1', 'create_jetpack:jetpack')

AStages.customizeStage('jetpack_2')
    .setAddTitle('科技已解锁！')

AStages.addRestrictionForItem('astages/item/netherite_jetpack', 'jetpack_2', 'create_jetpack:netherite_jetpack')
