gm.Ai.Agent = function() {

	var Agent = function(entity, walker, camera) {
		if (LOGGING) {
			if (!entity) console.log("!!! agent - entity was undefined");
			if (!camera) console.log("!!! agent - camera was undefined");
		}

		this._gameAi = undefined;
		this._entity = entity;
		this._walker = walker;
		this._playerObserver = new gm.Ai.WalkerObserver("player", camera._body);
		this._playerIntent = new gm.Ai.PlayerIntent(this._playerObserver);

		this._level = undefined;
		this._levelInfo = undefined;
		this._levelInfoDirty = false;
	};

	Agent.prototype._setLevel = function(level) {
		this._level = level;
		this._levelInfoDirty = true;
	};

	Agent.prototype.initWithGameAi = function(gameAi) {
		if (LOGGING) {
			console.log("agent - initialize with game");
		}
		this._gameAi = gameAi;
		gameAi.addListener(this);
	};

	Agent.prototype._initWithQueuedLevel = function() {
		if (LOGGING) {
			console.log("agent - level changed", this._level.name);
		}
		if (this._level) {
			// todo not great, fix this
			this._levelInfo = new gm.Ai.LevelInfo(this._level, this._walker, this._entity._body);
		} else {
			this._levelInfo = undefined;
		}

		this._levelInfoDirty = false;
		this._playerObserver.onInitWithLevel(this._levelInfo);
	};

	// entered new level
	Agent.prototype.onEntityAddedToLevel = function(entity, level, levelAi) {
		if (entity === this._entity) {
			this._setLevel(level);
			levelAi.addListener(this);
		}
	};

	// left level
	Agent.prototype.onEntityRemovedFromLevel = function(entity, level, levelAi) {
		if (entity === this._entity) {
			this._setLevel(undefined);
			this._levelInfoDirty = true;
		}
	};

	Agent.prototype.onLevelChanged = function() {
		this._levelInfoDirty = true;
	};

	Agent.prototype.onBodyChanged = function() {
		this._levelInfoDirty = true;
	};

	Agent.prototype.getNextInput = function() {
		if (this._levelInfoDirty) {
			this._initWithQueuedLevel();
		}
		this._playerObserver.preUpdate();
	};

	Agent.prototype.postUpdate = function() {

	};

	return Agent;

}();