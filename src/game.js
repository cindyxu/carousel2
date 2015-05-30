gm.Game = function() {

	var X = gm.Constants.Dim.X;
	var Y = gm.Constants.Dim.Y;

	var Game = {
		_activeLevel: undefined,

		_playing: false,
		_lastRun: undefined,

		_width : gm.Settings.Game.WIDTH,
		_height : gm.Settings.Game.HEIGHT,
		_tickStep : gm.Settings.Game.TICKSTEP,
		_maxTicks : gm.Settings.Game.MAX_TICKS,
	};

	Game.init = function() {
		Game._camera = new gm.Camera({
			sizeX: Game._width, 
			sizeY: Game._height
		});
		Game._activeLevel = new gm.Level();
		Game._activeLevel.init();
	};

	Game.play = function() {
		Game._playing = true;
		Game._lastRun = Date.now();
		if (LOGGING) console.log("Game is playing");
	};

	Game.pause = function() {
		Game._playing = false;
		if (LOGGING) console.log("Game is paused");
	};

	Game.update = function() {
		if (!Game._playing) return;

		var now = Date.now();

		var targetTicks = Math.min(Game._maxTicks, 
			Math.floor((now - Game._lastRun) / Game._tickStep));

		var level = Game._activeLevel;

		level.preUpdate();

		for (var i = 0; i < targetTicks; i++) {
			level.updateStep(Game._tickStep, X);
			level.updateStep(Game._tickStep, Y);
		}

		var deltaTime = targetTicks * Game._tickStep;
		level.postUpdate(deltaTime);
		
		Game._lastRun += deltaTime;
	};

	Game.render = function(ctx) {
		gm.Level.Renderer.render(ctx, Game._activeLevel, Game._camera);
	};

	return Game;

}();