gm.Game = function() {

	var X = gm.Constants.Dim.X;
	var Y = gm.Constants.Dim.Y;

	var Game = {
		_activeLevel: undefined,
		_levels: [],

		_playing: false,
		_lastRunTime: undefined,
		_currentTime: undefined,

		_width : gm.Settings.Game.WIDTH,
		_height : gm.Settings.Game.HEIGHT,
		_tickStep : gm.Settings.Game.TICKSTEP,
		_maxTicks : gm.Settings.Game.MAX_TICKS,

		_listeners: [],
		_registeredEntities: {},
		_entityLocations: {}
	};

	Game.init = function() {
		Game._defaultCamera = Game._camera = new gm.Camera({
			sizeX: Game._width, 
			sizeY: Game._height
		});

		Game._activeLevel = new gm.Level();
		Game._addLevel(Game._activeLevel);

		Game._lastRunTime = Game._currentTime = Date.now();
	};

	Game.play = function() {
		Game._playing = true;
		Game._lastRunTime = Game._currentTime = Date.now();
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
			Math.floor((now - Game._lastRunTime) / Game._tickStep));

		var level = Game._activeLevel;

		level.preUpdate();

		for (var i = 0; i < targetTicks; i++) {
			level.updateStep(Game._tickStep, X);
			level.updateStep(Game._tickStep, Y);
			Game._currentTime += Game._tickStep;
		}

		var deltaTime = Game._currentTime - Game._lastRunTime;
		level.postUpdate(deltaTime);
		
		Game._lastRunTime = Game._currentTime;
	};

	Game.render = function(ctx) {
		gm.Level.Renderer.render(ctx, Game._activeLevel, Game._camera);
	};

	Game.getEntityLevel = function(entity) {
		return this._entityLocations[entity._tag];
	};

	Game.addListener = function(listener) {
		if (this._listeners.indexOf(listener) < 0) {
			this._listeners.push(listener);
		}
	};

	Game._registerEntity = function(entity) {
		this._registeredEntities[entity._tag] = true;
		if (entity._agent) {
			entity._agent.initWithGame(this);
		}
		if (entity._name === "player") {
			this._bindToPlayer(entity);
		}
	};

	Game._addLevel = function(level) {
		if (this._levels.indexOf(level) < 0) {
			this._levels.push(level);
			level.addListener(this);
			for (var i = 0; i < this._listeners.length; i++) {
				if (this._listeners[i].onLevelAddedToGame) {
					this._listeners[i].onLevelAddedToGame(level);
				}
			}
		}
	};

	Game._bindToPlayer = function(playerEntity) {
		this._camera = playerEntity._camera;
	};

	Game.onEntityAddedToLevel = function(entity, level) {
		if (!this._registeredEntities[entity._tag]) {
			this._registerEntity(entity);
		}
		this._entityLocations[entity._tag] = level;
		for (var i = 0; i < this._listeners.length; i++) {
			this._listeners[i].onEntityAddedToLevel(entity, level);
		}
	};

	Game.onEntityRemovedFromLevel = function(entity, level) {
		this._entityLocations[entity._tag] = undefined;
		for (var i = 0; i < this._listeners.length; i++) {
			this._listeners[i].onEntityRemovedFromLevel(entity, level);
		}
	};

	return Game;

}();