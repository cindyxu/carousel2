gm.Game = function() {

	var X = gm.Constants.Dim.X;
	var Y = gm.Constants.Dim.Y;

	var Game = function() {
		this._activeLevel = undefined;
		this._levels = [];

		this._playing = false;
		this._lastRunTime = undefined;
		this._currentTime = undefined;

		this._width = gm.Settings.Game.WIDTH;
		this._height = gm.Settings.Game.HEIGHT;
		this._tickStep = gm.Settings.Game.TICKSTEP;
		this._maxTicks = gm.Settings.Game.MAX_TICKS;
		this._elapsed = 0;

		this._listeners = [];
		this._registeredEntities = {};
		this._entityLocations = {};
	};

	Game.prototype.init = function() {
		(new gm.Game.Observer(this));

		this._defaultCamera = this._camera = new gm.Camera({
			sizeX: this._width, 
			sizeY: this._height
		});

		this._elapsed = 0;
	};

	Game.prototype.play = function() {
		this._playing = true;
		this._elapsed = 0;
		if (LOGGING) console.log("Game is playing");
	};

	Game.prototype.pause = function() {
		this._playing = false;
		if (LOGGING) console.log("Game is paused");
	};

	Game.prototype.update = function(delta) {
		if (!this._playing) return;

		this._elapsed += delta;

		var targetTicks = Math.min(this._maxTicks, 
			Math.floor(this._elapsed / this._tickStep));

		var level = this._activeLevel;
		level.preUpdate();

		for (var i = 0; i < targetTicks; i++) {
			level.updateStep(this._tickStep, X);
			level.updateStep(this._tickStep, Y);
			this._elapsed -= this._tickStep;
		}

		level.postUpdate(delta);
	};

	Game.prototype.render = function(ctx) {
		this._camera.render(ctx);
	};

	Game.prototype.getEntityLevel = function(entity) {
		return this._entityLocations[entity._tag];
	};

	Game.prototype.addListener = function(listener) {
		if (this._listeners.indexOf(listener) < 0) {
			this._listeners.push(listener);
		}
	};

	Game.prototype.addNewEntity = function(className, name, level, layer, callback) {
		var game = this;
		var entity = gm.Entity.Model.createEntity(className, name, function(entity) {
			if (callback) callback(entity);
		});
		level.addEntity(entity, layer);
		game._registerEntity(entity);
		game._onEntityAddedToLevel(entity, level, layer);
		return entity;
	};

	Game.prototype.moveEntityToLevel = function(entity, level, layer) {
		var plevel = this._entityLocations[entity._tag];
		if (plevel) {
			var rlayer = plevel.getLayerForEntity(entity);
			plevel.removeEntity(entity);
			this._onEntityRemovedFromLevel(entity, level, rlayer);
		}
		level.addEntity(entity, layer);
		this._onEntityAddedToLevel(entity, level, layer);
	};

	Game.prototype._registerEntity = function(entity) {
		if (!this._registeredEntities[entity._tag]) {
			
			if (LOGGING) console.log("game - registering entity", entity._name);

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

	Game.prototype.addLevel = function(level) {
		if (LOGGING) console.log("game - adding level", level._name);

		if (this._levels.indexOf(level) < 0) {
			this._levels.push(level);
			level.addListener(this);
			for (var i = 0; i < this._listeners.length; i++) {
				if (this._listeners[i].onLevelAddedToGame) {
					this._listeners[i].onLevelAddedToGame(level);
				}
			}
			for (var l = 0; l < level._layers.length; l++) {
				var layer = level._layers[l];
				for (var e = 0; e < layer._entities.length; e++) {
					var entity = layer._entities[e];
					this._registerEntity(entity);
					this._onEntityAddedToLevel(entity, level, layer);
				}
			}
		}
	};

	Game.prototype.findLevelByName = function(name) {
		for (var i = 0; i < this._levels.length; i++) {
			if (this._levels[i]._name === name) return this._levels[i];
		}
	};

	Game.prototype.setActiveLevel = function(level) {
		if (LOGGING) console.log("game - set active level", level._name);

		this._activeLevel = level;
		this._camera.setLevel(level);
		for (var i = 0; i < this._listeners.length; i++) {
			if (this._listeners[i].onActiveLevelChanged) {
				this._listeners[i].onActiveLevelChanged(level);
			}
		}
	};

	Game.prototype._bindToPlayer = function(playerEntity) {
		this._camera = playerEntity._camera;
	};

	Game.prototype._onEntityAddedToLevel = function(entity, level, layer) {
		this._entityLocations[entity._tag] = level;
		for (var i = 0; i < this._listeners.length; i++) {
			if (this._listeners[i].onEntityAddedToLevel) {
				this._listeners[i].onEntityAddedToLevel(entity, level, layer);
			}
		}
	};

	Game.prototype._onEntityRemovedFromLevel = function(entity, level, layer) {
		this._entityLocations[entity._tag] = undefined;
		for (var i = 0; i < this._listeners.length; i++) {
			if (this._listeners[i].onEntityRemovedFromLevel) {
				this._listeners[i].onEntityRemovedFromLevel(entity, level, layer);
			}
		}
	};

	return Game;

}();