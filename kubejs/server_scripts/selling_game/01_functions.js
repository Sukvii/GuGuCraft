// The helper/engine functions live in 02_counter.js. All files within one script
// type share a single scope in KubeJS 2101 (scripts evaluate against the same
// cx.topLevelScope), so `function` declarations there are already visible to any
// other server script -- they could be split back into this file if desired.
// Shared DATA they consume (global.dishes, global.SELL, global.COIN_DENOMS) comes
// from the startup scripts via `global` (the cross-script-type channel).
