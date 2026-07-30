// Config moved to startup: KubeJS 2101 only lets startup scripts WRITE `global`
// (server scripts get a read-only view). So global.SELL and global.COIN_DENOMS
// are assigned in startup_scripts/selling_game/00_config.js and read here.
// 02_counter.js reads them via `global.SELL` / `global.COIN_DENOMS`.
