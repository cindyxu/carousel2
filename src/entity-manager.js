gm.Game.EntityManager = function() {
	
	var LevelEntityManager = function(level) {
		level.addListener(this);
		this._listeners = [];
	};

	LevelEntityManager.prototype.addListener = function(listener) {
		if (this._listeners.indexOf(listener) < 0) {
			this._listeners.push(listener);
		}
	};

	LevelEntityManager.prototype.removeListener = function(listener) {
		var i = this._listeners.indexOf(listener);
		if (i >= 0) {
			this._listeners.splice(i, 1);
		}
	};

	LevelEntityManager.prototype.onLevelChanged = function(level) {
		for (var i = 0; i < this._listeners.length; i++) {
			this._listeners[i].onLevelChanged(level);
		}
	};

	var Game = gm.Game;
	var GameEntityManager = {};
	var levelManagerMap = {};
	var listeners = [];

	Game.addListener(GameEntityManager);

	GameEntityManager.onEntityRegistered = function(entity) {
		if (entity._controller) {
			entity._controller.initWithGame(GameEntityManager);
		}
	};

	GameEntityManager.onLevelAddedToGame = function(level) {
		levelManagerMap[level._tag] = new LevelEntityManager(level);
	};

	GameEntityManager.onEntityAddedToLevel = function(entity, level) {
		for (var i = 0; i < listeners.length; i++) {
			if (listeners[i].onEntityAddedToLevel) {
				listeners[i].onEntityAddedToLevel(entity, level, levelManagerMap[level._tag]);
			}
		}
	};

	GameEntityManager.onEntityRemovedFromLevel = function(entity, level) {
		for (var i = 0; i < listeners.length; i++) {
			if (listeners[i].onEntityRemovedFromLevel) {
				listeners[i].onEntityRemovedFromLevel(entity, level, levelManagerMap[level._tag]);
			}
		}
	};

	GameEntityManager.addListener = function(listener) {
		if (listeners.indexOf(listener) < 0) {
			listeners.push(listener);
		}
	};

	GameEntityManager.removeListener = function(listener) {
		var i = listeners.indexOf(listener);
		if (i >= 0) {
			listeners.splice(i, 1);
		}
	};

	GameEntityManager.addLevelListener = function(listener, level) {
		if (LOGGING) {
			if (!listener) {
				console.log("!!! gameAi - addLevelListener - listener undefined");
			} if (!level) {
				console.log("!!! gameAi - addLevelListener - level undefined");
			}
		}
		var levelManager = levelManagerMap[level._tag];
		if (LOGGING && !levelManager) {
			console.log("!!! gameAi - addLevelListener - no levelManager for level");
		}
		levelManager.addListener(listener);
	};

	GameEntityManager.removeLevelListener = function(listener, level) {
		if (LOGGING) {
			if (!listener) {
				console.log("!!! gameAi - removeLevelListener - listener undefined");
			} if (!level) {
				console.log("!!! gameAi - removeLevelListener - level undefined");
			}
		}
		var levelManager = levelManagerMap[level._tag];
		if (LOGGING && !levelManager) {
			console.log("!!! gameAi - removeLevelListener - no levelManager for level");
		}
		levelManager.removeListener(listener);
	};

}();