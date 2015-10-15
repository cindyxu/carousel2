gm.Ai.Agent = function() {

	var Agent = function(entity, camera) {
		if (LOGGING) {
			if (!entity) console.log("!!! agent - entity was undefined");
			if (!camera) console.log("!!! agent - camera was undefined");
		}

		this._gameAi = undefined;
		this._entity = entity;
		this._camera = camera;

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
			var walker = this._entity._controller._behavior;
			this._levelInfo = new gm.Ai.LevelInfo(this._level, walker, this._entity._body, this._camera);
		} else {
			this._levelInfo = undefined;
		}
		this._levelInfoDirty = false;
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
			levelAi.removeListener(this);
			this._setLevel(undefined);
		}
	};

	Agent.prototype.onLevelChanged = function() {
		this._levelInfoDirty = true;
	};

	Agent.prototype.onBodyChanged = function() {
		this._levelInfoDirty = true;
	};

	var noInput = {
		down: {
			up: undefined,
			down: undefined,
			left: undefined,
			right: undefined
		},
		pressed: {
			up: undefined,
			down: undefined,
			left: undefined,
			right: undefined
		}
	};

	Agent.prototype.getNextInput = function() {
		if (this._levelInfoDirty) {
			this._initWithQueuedLevel();
		}
		this._levelInfo.preUpdate();
		return noInput;
	};

	return Agent;

}();