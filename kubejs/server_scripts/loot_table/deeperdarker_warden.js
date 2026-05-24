LootJS.modifiers((event) => {
    event.removeGlobalModifiers("deeperdarker:warden_heart_from_warden");
    event.addTableModifier("minecraft:entities/warden")
        .removeLoot("deeperdarker:heart_of_the_deep");
});
