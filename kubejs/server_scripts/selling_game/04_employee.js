// Step 7 (employee automation) is implemented inside 02_counter.js so it shares
// scope with the dish table, pricing/reputation helpers, and tableTick. It adds:
//   - ItemEvents.entityInteracted for iron/gold/diamond contracts -> employee 10/20/30
//   - create:brass_hand -> cycles work mode (0 working / 1 paused / 2 off)
//   - employeeTick(): auto-sells one waiting customer's order per cooldown,
//     pulling finished dishes from the input chest and paying spur coins into the
//     output chest via insertMoney().
//   - kubejs:station_linker: right-click a container to bind it as the INPUT chest
//     of the nearest counter; sneak + right-click binds OUTPUT. Bound positions are
//     stored on the counter (inputPos/outputPos in counter state). If a counter has
//     no bound chests, employeeTick falls back to the employee-relative default:
//     input = (employeeX + 1, employeeZ - 1), output = (employeeX - 1, employeeZ - 1).
