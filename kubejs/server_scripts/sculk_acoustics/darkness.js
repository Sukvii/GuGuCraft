// Sculk Acoustics (F5) darkness mechanic: players in the Otherside with block light < 10 at their feet keep getting Darkness, which fades out naturally once they step into light
// - ServerEvents.tick runs every 20 ticks and only iterates players in the Otherside (not PlayerEvents.tick, which calls JS per player per tick)
// - Wearing the Warden Helmet -> skip (the helmet clears Darkness every tick, so applying it anyway would flicker the screen every second)
// - Enough light -> skip without removing it; plenty of time left -> skip; otherwise apply about 3 seconds of Darkness (particles and icon hidden)
(() => {
    const cfg = global.SCULK_ACOUSTICS
    const dark = cfg.DARKNESS
    const $ResourceKey = Java.loadClass('net.minecraft.resources.ResourceKey')
    const $Registries = Java.loadClass('net.minecraft.core.registries.Registries')
    const $ResourceLocation = Java.loadClass('net.minecraft.resources.ResourceLocation')
    const $LightLayer = Java.loadClass('net.minecraft.world.level.LightLayer')
    const $MobEffects = Java.loadClass('net.minecraft.world.effect.MobEffects')
    const $MobEffectInstance = Java.loadClass('net.minecraft.world.effect.MobEffectInstance')
    const $EquipmentSlot = Java.loadClass('net.minecraft.world.entity.EquipmentSlot')
    const $BuiltInRegistries = Java.loadClass('net.minecraft.core.registries.BuiltInRegistries')

    const OTHERSIDE = $ResourceKey.create($Registries.DIMENSION, $ResourceLocation.parse(cfg.DIMENSION))
    const DARKNESS = $MobEffects.DARKNESS

    const wearsImmuneHelmet = player => {
        const head = player.getItemBySlot($EquipmentSlot.HEAD)
        return !head.isEmpty() && String($BuiltInRegistries.ITEM.getKey(head.getItem())) === dark.IMMUNE_HELMET
    }

    ServerEvents.tick(event => {
        const server = event.server
        if (server.getTickCount() % dark.INTERVAL !== 0) return
        // MinecraftServer.getLevel has ResourceKey and KubeJS ResourceLocation overloads; pick one explicitly
        const level = server['getLevel(net.minecraft.resources.ResourceKey)'](OTHERSIDE)
        if (!level) return
        // KubeJS maps ServerLevel.players() to a property, so use KubeJS's own getPlayers() (EntityArrayList)
        const players = level.getPlayers()
        if (players.isEmpty()) return

        players.forEach(player => {
            if (player.isSpectator() || wearsImmuneHelmet(player)) return
            if (level.getBrightness($LightLayer.BLOCK, player.blockPosition()) >= dark.LIGHT_THRESHOLD) return
            const current = player.getEffect(DARKNESS)
            if (current && current.getDuration() > dark.REFRESH_BELOW) return
            player.addEffect(new $MobEffectInstance(DARKNESS, dark.DURATION, 0, false, false, false))
        })
    })
})()
