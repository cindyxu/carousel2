gm.Game.Ai = function() {
	
	var Game = gm.Game;
	var GameAi = {};

	Game.addListener(GameAi);

	GameAi.onEntityRegistered = function(entity) {
		if (entity._agent) {
			entity._agent.initWithGame(Game);
		}
	};

}();