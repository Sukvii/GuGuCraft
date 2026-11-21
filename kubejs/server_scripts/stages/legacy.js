// Legacy stages -> new stages. When a player holding a legacy stage logs in, or a legacy stage was just added, the new stages are granted silently
// - arcane_mechanism (the old "chapter goal"): the Mythril and Arcane Ingot / Arcane Sheet recipes were open back then
// - theurgy_machines_1 (the old "before this"): the Theurgy machines
const LEGACY_STAGES = {
    arcane_mechanism: ['mythril', 'arcane_ingot'],
    theurgy_machines_1: ['liquid_source', 'hallowed_gold']
}

// Basic Research main line nodes (in order) and their reward stages. On login, start from the first node and complete the run of nodes whose stages the player holds
const BASIC_RESEARCH_QUEST = '1ADFEAFE92E08F24'
const MAINLINE_QUESTS = [
    ['0DDF1A6636380BF4', 'mythril'],
    ['6C940B32C97D8346', 'liquid_source'],
    ['2B6158DD8EC3B428', 'hallowed_gold'],
    ['682EA5AD7E10C382', 'arcane_ingot'],
    ['44B1E48CEE165775', 'arcane_mechanism']
]

const grantLegacyStages = (player, legacyStage) => {
    LEGACY_STAGES[legacyStage].forEach(stage => {
        if (!AStages.playerHasStage(player, stage)) {
            AStages.addStageToPlayer(player, stage, false, false, false)
        }
    })
}

const completeMainlineQuests = player => {
    const questData = FTBQuests.getServerDataFromPlayer(player)
    if (!questData || !questData.isCompleted(BASIC_RESEARCH_QUEST)) {
        return
    }
    MAINLINE_QUESTS.every(entry => {
        if (questData.isCompleted(entry[0])) {
            return true
        }
        if (!AStages.playerHasStage(player, entry[1])) {
            return false
        }
        questData.complete(entry[0])
        return true
    })
}

PlayerEvents.loggedIn(event => {
    Object.keys(LEGACY_STAGES).forEach(legacyStage => {
        if (AStages.playerHasStage(event.player, legacyStage)) {
            grantLegacyStages(event.player, legacyStage)
        }
    })
    completeMainlineQuests(event.player)
})

// AStages posts this event without a target, so listen without a target and filter by stage
AStageEvents.added(event => {
    const stage = String(event.stage)
    if (LEGACY_STAGES[stage]) {
        grantLegacyStages(event.player, stage)
    }
})
