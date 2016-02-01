gm.Event.TriggerManager = function() {

	var _Condition = function(trigger) {
		this._trigger = trigger;
		this._fulfilled = false;
	};

	_Condition.prototype.onFulfilled = function() {
		this._fulfilled = true;
		this._trigger.tryTrigger();
	};

	_Condition.prototype.onUnfulfilled = function() {
		this._fulfilled = false;
	};

	var _Trigger = function() {
		this._conditions = [];
	};

	_Trigger.prototype.tryTrigger = function() {
		for (var i = 0; i < this._conditions.length; i++) {
			if (!this._conditions[i]._fulfilled) return;
		}
		this._trigger();
	};

	var LocationConditionManager = function(level) {
		this._conditions = {};
		this._checkEntities = [];
		this._level = level;
	};

	LocationConditionManager.prototype.startListening = function() {
		this._level.addListener(this);
	};

	LocationConditionManager.prototype.stopListening = function() {
		this._level.removeListener(this);
	};

	LocationConditionManager.prototype.addCondition = function(condition) {
		if (this._conditions[condition._entity]) {
			this._conditions[condition._entity].push(condition);
		} else {
			this._conditions[condition._entity] = [condition];
		}
	};

	LocationConditionManager.prototype.onEntityAddedToLevel = function(entity, level, layer) {
		if (entity._name && this._conditions[entity._name]) {
			this._checkEntities.push(entity);
		}
	};

	LocationConditionManager.prototype.onEntityRemovedFromLevel = function(entity, level, layer) {
		var i = this._checkEntities.indexOf(entity);
		if (i >= 0) this._checkEntities.splice(i, 1);
	};

	LocationConditionManager.prototype.update = function(delta) {
		for (var i = 0; i < this._checkEntities.length; i++) {
			var conditions = this._conditions[this._checkEntities[i]._name];
			for (var j = 0; j < conditions.length; j++) {
				var condition = conditions[j];
				this._checkLocation(this._checkEntities[i], condition);
			}
		}
	};

	LocationConditionManager.prototype._checkLocation = function(entity, condition) {

	};

	var FlagConditionManager = function(conditions) {
		this._conditions = {};
	};

	var ActionConditionManager = function(conditions) {
		this._conditions = {};

		// each entity controller can define its own set of actions. 
		// the manager can add a listener to every entity in the scene
		// for which a relevant condition exists
	};

	var TriggerManager = function() {
		this._currentTriggers = [];
		this._triggersJSON = undefined;
	};

	TriggerManager.prototype.init = function(game, callback) {
		game.addListener(this);
		this._loadAllTriggers(callback);
	};

	TriggerManager.prototype.loadAllTriggers = function(callback) {
		$.getJSON(filename, function(triggersJSON) {
			this._triggersJSON = triggersJSON;
			if (callback) callback();
		});
	};

	TriggerManager.prototype.onActiveLevelChanged = function(level) {
		this._currentTriggers = this._getTriggersForLevel(level);
	};

	TriggerManager.prototype._getTriggersForLevel = function(level) {
		for (var i = 0; i < this._triggersJSON.length; i++) {
			var triggerJSON = this._triggersJSON[i];
			if (triggerJSON._levels.indexOf(level._name) >= 0) {

			}
		}
	};

	TriggerManager.prototype.update = function(delta) {
		/*
		{
			conditions: {
				"location": [{
					entity : "player",
					x: [0, 20],
					y: [10, 30],
					radius: 10
				}]
			},
			levels: ["level1"],
			flags: [],
			event: "event0"
		}
		*/
	};

	return TriggerManager;

}();