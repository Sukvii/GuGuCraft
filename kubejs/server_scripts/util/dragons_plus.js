// priority: 1000

ServerEvents.recipes(event => {
    // Inject createDragonsPlus into the event.recipes object
    event.recipes.createDragonsPlus = {
        ending: (results, input) => {
            let resultJson = []
            if (!Array.isArray(results)) results = [results]

            results.forEach(r => {
                if (typeof r === 'string') {
                    // Handle strings like '3x minecraft:stone'
                    let item = Item.of(r)
                    resultJson.push({ id: item.id, count: item.count })
                } else {
                    // Pass objects through as is
                    let resultItem = r.item ? r.item : r.id
                    let resultObj = {
                        id: resultItem,
                        count: r.count || 1
                    }
                    if (r.chance && r.chance < 1.0) resultObj.chance = r.chance
                    resultJson.push(resultObj)
                }
            })

            let ingredientJson = []
            if (typeof input === 'string') {
                ingredientJson.push(Ingredient.of(input).toJson())
            } else if (Array.isArray(input)) {
                input.forEach(i => ingredientJson.push(Ingredient.of(i).toJson()))
            } else {
                ingredientJson.push(input)
            }

            let recipe = {
                type: 'create_dragons_plus:ending',
                ingredients: ingredientJson,
                results: resultJson
            }

            return event.custom(recipe)
        }
    }
})
