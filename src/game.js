gm.Game = function() {

	var X = gm.Constants.Dim.X;
	var Y = gm.Constants.Dim.Y;

	var Game = {
		_activeLevels: [],
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

		var level = new gm.Level();
		Game._addLevel(level);
		Game._addActiveLevel(level);

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

		var currentTime = Game._currentTime;

		for (var l = 0; l < Game._activeLevels.length; l++) {
			var level = Game._activeLevels[l];
			level.preUpdate();

			for (var i = 0; i < targetTicks; i++) {
				level.updateStep(Game._tickStep, X);
				level.updateStep(Game._tickStep, Y);
				currentTime += Game._tickStep;
			}

			var deltaTime = currentTime - Game._lastRunTime;
			level.postUpdate(deltaTime);
		}

		Game._currentTime += Game._tickStep * targetTicks;
		Game._lastRunTime = Game._currentTime;
	};

	Game.render = function(ctx) {
		// TODO figure out which level to render
		gm.Level.Renderer.render(ctx, Game._activeLevels[0], Game._camera);
	};

	Game.getEntityLevel = function(entity) {
		return this._entityLocations[entity._tag];
	};

	Game.addListener = function(listener) {
		if (this._listeners.indexOf(listener) < 0) {
			this._listeners.push(listener);
		}
	};

	Game.addNewEntity = function(className, name, level, layer, callback) {
		gm.Entity.Model.createEntity(className, name, function(entity) {
			Game._registerEntity(entity);
			level.addEntity(entity, layer);
			if (callback) callback(entity);
			Game._onEntityAddedToLevel(entity, level);
		});
	};

	Game.moveEntityToLevel = function(entity, level, layer) {
		var plevel = this._entityLocations[entity._tag];
		if (plevel) {
			plevel.removeEntity(entity);
			Game._onEntityRemovedFromLevel(entity, level);
		}
		level.addEntity(entity, layer);
		Game._onEntityAddedToLevel(entity, level);
	};

	Game._registerEntity = function(entity) {
		if (!this._registeredEntities[entity._tag]) {
			
			if (LOGGING) {
				console.log("game - registering entity", entity.name);
			}

			this._registeredEntities[entity._tag] = true;

			if (entity._name === "player") {
				this._bindToPlayer(entity);
			}
			for (var i = 0; i < this._listeners.length; i++) {
				if (this._listeners[i].onEntityRegistered) {
					this._listeners[i].onEntityRegistered(entity);
				}
			}
		}
	};

	Game._addLevel = function(level) {
		if (LOGGING) console.log("game - adding level", level.name);
		if (this._levels.indexOf(level) < 0) {
			this._levels.push(level);
			for (var e = 0; e < level._entities.length; e++) {
				this.onEntityAddedToLevel(level._entities[e]);
			}
			level.addListener(this);
			for (var i = 0; i < this._listeners.length; i++) {
				if (this._listeners[i].onLevelAddedToGame) {
					this._listeners[i].onLevelAddedToGame(level);
				}
			}
		}
	};

	Game._addActiveLevel = function(level) {
		if (this._activeLevels.indexOf(level) < 0) {
			this._activeLevels.push(level);
		}
	};

	Game._removeActiveLevel = function(level) {
		if (this._activeLevels.indexOf(level) < 0) {
			this._activeLevels.push(level);
		}
	};

	Game._bindToPlayer = function(playerEntity) {
		this._camera = playerEntity._camera;
	};

	Game._onEntityAddedToLevel = function(entity, level) {
		this._entityLocations[entity._tag] = level;
		for (var i = 0; i < this._listeners.length; i++) {
			if (this._listeners[i].onEntityAddedToLevel) {
				this._listeners[i].onEntityAddedToLevel(entity, level);
			}
		}
	};

	Game._onEntityRemovedFromLevel = function(entity, level) {
		this._entityLocations[entity._tag] = undefined;
		for (var i = 0; i < this._listeners.length; i++) {
			if (this._listeners[i].onEntityRemovedFromLevel) {
				this._listeners[i].onEntityRemovedFromLevel(entity, level);
			}
		}
	};

	return Game;

}();