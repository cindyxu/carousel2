gm.Ai.Agent = function() {

	var Agent = function(entity, camera, params) {
		if (LOGGING) {
			if (!entity) console.log("!!! agent - entity was undefined");
			if (!camera) console.log("!!! agent - camera was undefined");
		}

		this._entity = entity;

		this._level = undefined;
		this._levelObserver = undefined;
		this._levelInfo = undefined;
		this._levelDirty = false;

		this._planner = undefined;
		this._lastInput = undefined;

		if (params) this._setParams(params);
	};

	Agent.prototype._setParams = function(params) {
		if (params.float) this._floatParams = params.float;
		if (params.walk) this._walkParams = params.walk;
	};

	Agent.prototype._setLevel = function(level, levelObserver) {
		this._level = level;
		if (this._levelObserver) levelObserver.removeListener(this);
		this._levelObserver = levelObserver;
		this._levelDirty = true;
	};

	Agent.prototype._initWithQueuedLevel = function() {
		if (LOGGING) {
			console.log("agent - level changed", this._level._name);
		}
		var behavior = this._entity._controller._behavior;
		if (this._level) {
			if (this._level._gravity !== 0) {
				this._levelInfo = new gm.Ai.Walker.LevelInfo(this._level, behavior, this._entity._body);
				this._planner = new gm.Ai.Walker.Planner(this._levelInfo, this._walkParams);
			} else {
				this._levelInfo = undefined;
				this._planner = new gm.Ai.Floater.Planner(this._entity, this._levelObserver, this._floatParams);
			}
		} else {
			this._levelInfo = undefined;
		}
		this._levelObserver.addListener(this);
		this._levelDirty = false;
	};

	// entered new level
	Agent.prototype.onEntityAddedToLevel = function(entity, level, levelObserver) {
		if (entity === this._entity) {
			this._setLevel(level, levelObserver);
		}
	};

	// left level
	Agent.prototype.onEntityRemovedFromLevel = function(entity, level, levelObserver) {
		if (entity === this._entity) {
			this._setLevel(undefined);
		}
	};

	Agent.prototype.onLevelChanged = function() {
		this._levelDirty = true;
	};

	Agent.prototype.onBodyChanged = function() {
		this._levelDirty = true;
	};

	Agent.prototype.getNextInput = function() {
		if (this._levelDirty) {
			this._initWithQueuedLevel();
		}
		if (this._levelInfo) this._levelInfo.preUpdate();
		
		return this._planner.planNextInput();
	};

	return Agent;

}();