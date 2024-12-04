import { system, world} from "@minecraft/server"


world.afterEvents.worldInitialize.subscribe(() => {
	['overworld', 'nether', 'the_end'].forEach(dimension => 
		world.getDimension(dimension)
		.getEntities({type: "yasser444:biome_detector"})
		.forEach(entity => entity.remove())
	)
})

system.runInterval(() => {
	world.getAllPlayers().forEach(async player => {
		if (player.getDynamicProperty('yasser444:disable_biome_detector')) return
		const biome = await player.getBiome()
		player.onScreenDisplay.setActionBar(`Biome: ${biome.name ?? "§0The Void"}`)
	})
}, 1)

world.beforeEvents.playerInteractWithBlock.subscribe(async ({itemStack:item, player, block, isFirstEvent}) => {
	if (!isFirstEvent) return
	if (item?.typeId != 'minecraft:feather') return
	system.run(async () => {
		player.sendMessage(`Biome: ${(await block.getBiome()).id	}`)
	})
})

world.beforeEvents.playerInteractWithEntity.subscribe(async ({itemStack:item, player, target}) => {
	if (item?.typeId != 'minecraft:feather') return
	system.run(async () => {
		player.sendMessage(`Biome: ${(await target.getBiome()).id	}`)
	})
})

system.afterEvents.scriptEventReceive.subscribe(({id, message, sourceEntity:player}) => {
	if (id != "biome:read") return
	if (player.typeId != "minecraft:player") return
	const state = player.getDynamicProperty('yasser444:disable_biome_detector') == 1 ? 'in' : ''
	if (["true", "false"].includes(message)) {
		player.setDynamicProperty('yasser444:disable_biome_detector', message == "false" ? 1 : undefined)
		if (!state) system.runTimeout(() => {player.onScreenDisplay.setActionBar('§.')}, 2)
	} else player.sendMessage(`The biome detector is currently ${state}active`)
})