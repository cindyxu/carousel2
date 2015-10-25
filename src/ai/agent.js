gm.Ai.Agent = function() {

	var Agent = function(entity, camera) {
		if (LOGGING) {
			if (!entity) console.log("!!! agent - entity was undefined");
			if (!camera) console.log("!!! agent - camera was undefined");
		}

		this._entity = entity;

		this._level = undefined;
		this._levelInfo = undefined;
		this._walkerLevelInfoDirty = false;
	};

	Agent.prototype._setLevel = function(level) {
		this._level = level;
		this._walkerLevelInfoDirty = true;
	};

	Agent.prototype._initWithQueuedLevel = function() {
		if (LOGGING) {
			console.log("agent - level changed", this._level.name);
		}
		var behavior = this._entity._controller._behavior;
		if (this._level) {
			if (this._level._gravity !== 0) {
				this._levelInfo = new gm.Ai.Walker.LevelInfo(this._level, behavior, this._entity._body);
			} else {
				this._levelInfo = undefined;
			}
		} else {
			this._levelInfo = undefined;
		}
		this._walkerLevelInfoDirty = false;
	};

	// entered new level
	Agent.prototype.onEntityAddedToLevel = function(entity, level, levelManager) {
		if (entity === this._entity) {
			this._setLevel(level);
			levelManager.addListener(this);
		}
	};

	// left level
	Agent.prototype.onEntityRemovedFromLevel = function(entity, level, levelManager) {
		if (entity === this._entity) {
			levelManager.removeListener(this);
			this._setLevel(undefined);
		}
	};

	Agent.prototype.onLevelChanged = function() {
		this._walkerLevelInfoDirty = true;
	};

	Agent.prototype.onBodyChanged = function() {
		this._walkerLevelInfoDirty = true;
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
		if (this._walkerLevelInfoDirty) {
			this._initWithQueuedLevel();
		}
		this._levelInfo.preUpdate();
		return noInput;
	};

	return Agent;

}();