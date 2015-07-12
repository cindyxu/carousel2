gm.Ai.EntityObserver = function() {

	var EntitySighting = function(entity, time) {
		this._entity = entity;
		this._onSeen(time);
	};

	EntitySighting.prototype.onSeen = function(time) {
		this._lastSightedX = this._entity._body._x;
		this._lastSightedY = this._entity._body._y;
		this._lastSeenTime = time;
	};

	var EntityObserver = function(entityList) {
		this.__entityList = entityList;
		this._entitySightings = {};
	};

	EntityObserver.prototype.observe = function(bbox, time) {
		// todo: optimize this?
		for (var e = 0; e < this.__entityList.length; e++) {
			var entity = this.__entityList[e];
			if (entity._body.overlapsBbox(bbox)) {
				if (!this._entitySightings[entity._tag]) {
					this._entitySightings[entity._tag] = new EntitySighting(entity, time);
				} else {
					this._entitySightings[entity._tag].onSeen(time);
				}
			}
		}
	};

	EntityObserver.prototype.onEntityListChanged = function() {
		for (var e in this._entitySightings) {
			var entity = this._entitySightings[e];
			if (entity && this.__entityList.indexOf(entity) < 0) {
				this._entitySightings[e] = undefined;
			}
		}
	};

};