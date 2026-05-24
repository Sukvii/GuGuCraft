ServerEvents.recipes(event => {
    
    event.remove({id: 'kaleidoscope_cookery:tomato_seed'})
    event.replaceOutput({id: 'farmersdelight:rice_from_bag'}, 'farmersdelight:rice', 'kaleidoscope_cookery:rice')
    event.replaceOutput({id: 'farmersdelight:rice'}, 'farmersdelight:rice', 'kaleidoscope_cookery:rice')
    event.replaceOutput({id: 'create:milling/wild_tomatoes'}, 'farmersdelight:tomato_seeds', 'kaleidoscope_cookery:tomato_seed')
    event.replaceInput({id: 'farmersdelight:rice_bag'}, 'farmersdelight:rice', '#c:crops/rice')
})