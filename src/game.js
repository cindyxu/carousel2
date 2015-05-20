var LOGGING = gm.Settings.LOGGING;

var game = gm.Game = {
	_activeLevel: undefined,

	_playing: false,
	_lastRun: undefined,

	_width : gm.Settings.Game.WIDTH,
	_height : gm.Settings.Game.HEIGHT,
	_tickStep : gm.Settings.Game.TICKSTEP,
	_maxTicks : gm.Settings.Game.MAX_TICKS,
};

gm.Game.init = function() {
	this._camera = new gm.Camera({
		sizeX: this._width, 
		sizeY: this._height
	});
	this._activeLevel = new gm.Level();
	this._activeLevel.init();
};

gm.Game.play = function() {
	game._playing = true;
	game._lastRun = Date.now();
	if (LOGGING) console.log("game is playing");
};

gm.Game.pause = function() {
	this._playing = false;
	if (LOGGING) console.log("game is paused");
};

gm.Game.update = function() {
	if (!game._playing) return;

	var now = Date.now();

	var targetTicks = Math.min(game._maxTicks, 
		Math.floor((now - game._lastRun) / game._tickStep));

	var level = game._activeLevel;

	level.preUpdate();

	for (var i = 0; i < targetTicks; i++) {
		level.updateStep(game._tickStep, X);
		level.updateStep(game._tickStep, Y);
	}

	var deltaTime = targetTicks * game._tickStep;
	level.postUpdate(deltaTime);
	
	game._lastRun += deltaTime;
};

gm.Game.render = function(ctx) {
	gm.Level.Renderer.render(ctx, this._activeLevel, this._camera);
};