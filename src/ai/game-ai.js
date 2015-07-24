gm.Game.Ai = function() {
	
	var LevelAi = function(level) {
		level.addListener(this);
		this._listeners = [];
	};

	LevelAi.prototype.addListener = function(listener) {
		if (this._listeners.indexOf(listener) < 0) {
			this._listeners.push(listener);
		}
	};

	LevelAi.prototype.removeListener = function(listener) {
		var i = this._listeners.indexOf(listener);
		if (i >= 0) {
			this._listeners.splice(i, 1);
		}
	};

	LevelAi.prototype.onPreUpdate = function() {
		for (var i = 0; i < this._listeners.length; i++) {
			this._listeners[i].preUpdate();
		}
	};

	LevelAi.prototype.onPostUpdate = function() {
		for (var i = 0; i < this._listeners.length; i++) {
			this._listeners[i].postUpdate();
		}
	};

	LevelAi.prototype.onLevelChanged = function() {
		for (var i = 0; i < this._listeners.length; i++) {
			this._listeners[i].onLevelChanged();
		}
	};

	var Game = gm.Game;
	var GameAi = {};
	var levelAiMap = {};
	var listeners = [];

	Game.addListener(GameAi);

	GameAi.onEntityRegistered = function(entity) {
		if (entity._controller && entity._controller._agent) {
			entity._controller._agent.initWithGameAi(GameAi);
		}
	};

	GameAi.onLevelAddedToGame = function(level) {
		levelAiMap[level._tag] = new LevelAi(level);
	};

	GameAi.onEntityAddedToLevel = function(entity, level) {
		for (var i = 0; i < listeners.length; i++) {
			if (listeners[i].onEntityAddedToLevel) {
				listeners[i].onEntityAddedToLevel(entity, level, levelAiMap[level._tag]);
			}
		}
	};

	GameAi.onEntityRemovedFromLevel = function(entity, level) {
		for (var i = 0; i < listeners.length; i++) {
			if (listeners[i].onEntityRemovedFromLevel) {
				listeners[i].onEntityRemovedFromLevel(entity, level, levelAiMap[level._tag]);
			}
		}
	};

	GameAi.addListener = function(listener) {
		if (listeners.indexOf(listener) < 0) {
			listeners.push(listener);
		}
	};

	GameAi.removeListener = function(listener) {
		var i = listeners.indexOf(listener);
		if (i >= 0) {
			listeners.splice(i, 1);
		}
	};

	GameAi.addLevelListener = function(listener, level) {
		if (LOGGING) {
			if (!listener) {
				console.log("!!! gameAi - addLevelListener - listener undefined");
			} if (!level) {
				console.log("!!! gameAi - addLevelListener - level undefined");
			}
		}
		var levelAi = levelAiMap[level._tag];
		if (LOGGING && !levelAi) {
			console.log("!!! gameAi - addLevelListener - no levelAi for level");
		}
		levelAi.addListener(listener);
	};

	GameAi.removeLevelListener = function(listener, level) {
		if (LOGGING) {
			if (!listener) {
				console.log("!!! gameAi - removeLevelListener - listener undefined");
			} if (!level) {
				console.log("!!! gameAi - removeLevelListener - level undefined");
			}
		}
		var levelAi = levelAiMap[level._tag];
		if (LOGGING && !levelAi) {
			console.log("!!! gameAi - removeLevelListener - no levelAi for level");
		}
		levelAi.removeListener(listener);
	};

}();