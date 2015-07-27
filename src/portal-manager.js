gm.PortalManager = function() {
	
	var LevelTransfer = function(entity, fromLevel, toLevel, tx, ty) {
		this._entity = entity;
		this._fromLevel = fromLevel;
		this._toLevel = toLevel;
		this._tx = tx;
		this._ty = ty;
	};

	LevelTransfer.prototype.onPreUpdate = function() {
		gm.Game.moveEntityToLevel(this._entity, this._toLevel, this._tx, this._ty);
		this._entity._body.moveTo(this._tx, this._ty);
		this._fromLevel.removeListener(this);
	};

	var PortalManager = {};
	var listeners = [];

	PortalManager.transfer = function(entity, toLevel, tx, ty) {
		var fromLevel = gm.Game.getEntityLevel(entity);
		// currently we are forcing entity moves to the beginning of preUpdate.
		// if we need to add more strict rules for order of operations,
		// consider splitting preUpdate into multiple parts.
		fromLevel.addListener(new LevelTransfer(entity, fromLevel, toLevel, tx, ty), true);
		for (var i = 0; i < listeners.length; i++) {
			listeners[i].onEnterPortal(entity, toLevel);
		}
	};

	PortalManager.addListener = function(listener) {
		if (listeners.indexOf(listener) < 0) {
			listeners.push(listener);
		}
	};

	PortalManager.removeListener = function(listener) {
		var i = listeners.indexOf(listener);
		if (i >= 0) {
			listeners.splice(i, 1);
		}
	};

	return PortalManager;

}();