ServerEvents.recipes(event => {
    
    const concrete_colors = ['white', 'orange', 'magenta', 'light_blue', 'yellow', 'lime', 'pink', 'gray', 'light_gray', 'cyan', 'purple', 'blue', 'brown', 'green', 'red', 'black']
    
    concrete_colors.forEach(color =>{
        
        event.custom({
            "type": "createdieselgenerators:casting",
            "ingredients": [
            {
                "type": "fluid_stack",
                "fluid": `createdieselgenerators:${color}_cement`,
                "amount": 500
            }
            ],
            "mold": "createdieselgenerators:lines",
            "results": [
            {
                "id": `minecraft:${color}_concrete`,
                "count": 2
            }
            ]
        }).id(`kubejs:casting/${color}_concrete`)
        
        event.shapeless(`minecraft:${color}_concrete_powder`, [`minecraft:${color}_dye`, '#c:concrete_powders']).id(`kubejs:crafting/dye_${color}_concrete_powder`)

        event.shapeless(`minecraft:${color}_concrete`, [`minecraft:${color}_dye`, '#c:concretes']).id(`kubejs:crafting/dye_${color}_concrete`)

        event.custom({
            "type": "create:milling",
            "ingredients": [
            {
                "item": `minecraft:${color}_concrete`
            }
            ],
            "processingTime": 5,
            "results": [
            {
                "count": 1,
                "id": `minecraft:${color}_concrete_powder`
            }
            ]
        }).id(`kubejs:milling/${color}_concrete_to_concrete_powder`)
    
    })

})