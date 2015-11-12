gm.Game.Observer = function() {
	
	var LevelObserver = function(level) {
		this._level = level;
		level.addListener(this);
		this._listeners = [];
	};

	LevelObserver.prototype.addListener = function(listener) {
		if (this._listeners.indexOf(listener) < 0) {
			this._listeners.push(listener);
		}
	};

	LevelObserver.prototype.removeListener = function(listener) {
		var i = this._listeners.indexOf(listener);
		if (i >= 0) {
			this._listeners.splice(i, 1);
		}
	};

	LevelObserver.prototype.onLevelChanged = function(level) {
		for (var i = 0; i < this._listeners.length; i++) {
			this._listeners[i].onLevelChanged(level);
		}
	};

	LevelObserver.prototype.findEntityByName = function(name) {
		return this._level.findEntityByName(name);
	};

	var GameObserver = function(game) {
		this._levelManagerMap = {};
		this._listeners = [];
		game.addListener(this);
	};

	GameObserver.prototype.onEntityRegistered = function(entity) {
		if (entity._controller) {
			entity._controller.initWithGame(this);
		}
	};

	GameObserver.prototype.onLevelAddedToGame = function(level) {
		console.log("on level added to game?");
		this._levelManagerMap[level._tag] = new LevelObserver(level);
	};

	GameObserver.prototype.onEntityAddedToLevel = function(entity, level) {
		console.log("on entity added to level?");
		for (var i = 0; i < this._listeners.length; i++) {
			if (this._listeners[i].onEntityAddedToLevel) {
				this._listeners[i].onEntityAddedToLevel(entity, level, this._levelManagerMap[level._tag]);
			}
		}
	};

	GameObserver.prototype.onEntityRemovedFromLevel = function(entity, level) {
		for (var i = 0; i < this._listeners.length; i++) {
			if (this._listeners[i].onEntityRemovedFromLevel) {
				this._listeners[i].onEntityRemovedFromLevel(entity, level, this._levelManagerMap[level._tag]);
			}
		}
	};

	GameObserver.prototype.addListener = function(listener) {
		if (this._listeners.indexOf(listener) < 0) {
			this._listeners.push(listener);
		}
	};

	GameObserver.prototype.removeListener = function(listener) {
		var i = this._listeners.indexOf(listener);
		if (i >= 0) {
			this._listeners.splice(i, 1);
		}
	};

	GameObserver.prototype.addLevelListener = function(listener, level) {
		if (LOGGING) {
			if (!listener) {
				console.log("!!! gameAi - addLevelListener - listener undefined");
			} if (!level) {
				console.log("!!! gameAi - addLevelListener - level undefined");
			}
		}
		var levelManager = this._levelManagerMap[level._tag];
		if (LOGGING && !levelManager) {
			console.log("!!! gameAi - addLevelListener - no levelManager for level");
		}
		levelManager.addListener(listener);
	};

	GameObserver.prototype.removeLevelListener = function(listener, level) {
		if (LOGGING) {
			if (!listener) {
				console.log("!!! gameAi - removeLevelListener - listener undefined");
			} if (!level) {
				console.log("!!! gameAi - removeLevelListener - level undefined");
			}
		}
		var levelManager = this._levelManagerMap[level._tag];
		if (LOGGING && !levelManager) {
			console.log("!!! gameAi - removeLevelListener - no levelManager for level");
		}
		levelManager.removeListener(listener);
	};

	return GameObserver;

}();