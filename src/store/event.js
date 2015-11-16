gm.Store.Event = function() {

	var EventStore = {};

	/*
	{
		eventNodes: [
			{
				delay: 0,
				instruction: {
					type: "entity",
					targetEntity: "hello",
					behavior: "nothing",
					spriteMapping: "shakeHead"
					endState: {
						type: "animation"
					}
				},
			},
			{
				delay: 500,
				instruction: {
					type: "dialogue",
					dialogue: [dialogue Object????]
				}
			},
			{
				delay: 500,
				instruction: {
					type: "changeLevel",
					level: "antichamber",
					moveEntities: [
						"player", 100, 500,
						"partner", 100, 500
					]
				}
			}
		],
		mapping: [[], [0], [1]]
	}

	*/

	EventStore.fromJSON = function(name, callback) {
		
	};

	return EventStore;

}();