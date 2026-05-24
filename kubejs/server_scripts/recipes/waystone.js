ServerEvents.recipes(event => {
  event.remove({output: 'waystones:return_scroll'})
  event.remove({output: 'waystones:bound_scroll'})
  event.remove({output: 'waystones:warp_scroll'})
  event.remove({output: 'waystones:warp_stone'})
  event.remove({output: 'waystones:warp_dust'})
  event.custom({
    "type": "create:sequenced_assembly",
    "ingredient": {
      "item": "minecraft:emerald"
    },
    "loops": 3,
    "results": [
      {
        "chance": 90.0,
        "id": "waystones:warp_stone"
      },
      {
        "chance": 5.0,
        "id": "minecraft:emerald"
      },
      {
        "chance": 3.0,
        "id": "minecraft:amethyst_shard"
      },
      {
        "chance": 2.0,
        "id": "minecraft:ender_pearl"
      }
    ],
    "sequence": [
      {
        "type": "create:deploying",
        "ingredients": [
          {
            "item": "kubejs:incomplete_warp_stone"
          },
          {
            "item": "minecraft:amethyst_shard"
          }
        ],
        "results": [
          {
            "id": "kubejs:incomplete_warp_stone"
          }
        ]
      },
      {
        "type": "create:deploying",
        "ingredients": [
          {
            "item": "kubejs:incomplete_warp_stone"
          },
          {
            "item": "minecraft:ender_pearl"
          }
        ],
        "results": [
          {
            "id": "kubejs:incomplete_warp_stone"
          }
        ]
      }
    ],
    "transitional_item": {
      "id": "kubejs:incomplete_warp_stone"
    }
  }).id('kubejs:sequenced_assembly/warp_stone')
  event.custom({
    "type": "create:milling",
    "ingredients": [
      {
        "item": "waystones:warp_stone"
      }
    ],
    "processingTime": 1000,
    "results": [
      {
        "id": "waystones:warp_dust"
      }
    ]
  }).id('kubejs:milling/warp_dust')
})