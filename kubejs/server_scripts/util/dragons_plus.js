// priority: 1000

ServerEvents.recipes(event => {
    // 注入 createDragonsPlus 到 event.recipes 对象中
    event.recipes.createDragonsPlus = {
        ending: (results, input) => {
            let resultJson = []
            if (!Array.isArray(results)) results = [results]

            results.forEach(r => {
                if (typeof r === 'string') {
                    // 处理 '3x minecraft:stone' 这种字符串
                    let item = Item.of(r)
                    resultJson.push({ id: item.id, count: item.count })
                } else {
                    // 直接传递对象
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
