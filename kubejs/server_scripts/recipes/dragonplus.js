ServerEvents.recipes(event => {
    
    const colors = ['white', 'orange', 'magenta', 'light_blue', 'yellow', 'lime', 'pink', 'gray', 'light_gray', 'cyan', 'purple', 'blue', 'brown', 'green', 'red', 'black']
    
    event.recipes.create.compacting([Fluid.of('kubejs:reactive_dye', 10), 'ecologics:coconut_husk'], ['ecologics:coconut_slice', Fluid.of('createdieselgenerators:plant_oil', 100)]).heated().id('kubejs:compacting/reactive_dye')
    
    colors.forEach(color =>{
    
        event.remove({id: `create_dragons_plus:mixing/${color}_dye_from_item`})
        
        event.custom({
            
            "type": "lychee:item_inside",
            "item_in": `minecraft:${color}_dye`,
            "block_in": "kubejs:reactive_dye",
            "post": [
                {
                    "type": "place",
                    "block": `create_dragons_plus:${color}_dye`
                }
            ]
        
        }).id(`kubejs:item_inside/${color}_dye_fluid`)
    
    })

})