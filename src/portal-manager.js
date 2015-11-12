gm.PortalManager = function() {
	
	var LevelTransfer = function(game, entity, fromLevel, toLevelName, tx, ty) {
		this._game = game;
		this._entity = entity;
		this._fromLevel = fromLevel;
		this._toLevelName = toLevelName;
		this._tx = tx;
		this._ty = ty;
	};

	LevelTransfer.prototype.onPreUpdate = function() {
		gm.Driver.requestEnterLevel(this._toLevelName, function(toLevel) {
			this._game.moveEntityToLevel(this._entity, this._toLevelName, this._tx, this._ty);
			this._entity._body.moveTo(this._tx, this._ty);
			this._fromLevel.removeListener(this);
		});
	};

	var PortalManager = function(gameDriver) {
		this._gameDriver = gameDriver;
	};

	var listeners = [];

	PortalManager.prototype.transfer = function(entity, toLevel, tx, ty) {
		var fromLevel = this._gameDriver._game.getEntityLevel(entity);
		// currently we are forcing entity moves to the beginning of preUpdate.
		// if we need to add more strict rules for order of operations,
		// consider splitting preUpdate into multiple parts.
		fromLevel.addListener(new LevelTransfer(this._gameDriver._game, entity, fromLevel, toLevelName, tx, ty), true);
		for (var i = 0; i < listeners.length; i++) {
			listeners[i].onEnterPortal(entity, toLevelName);
		}
	};

	PortalManager.prototype.addListener = function(listener) {
		if (listeners.indexOf(listener) < 0) {
			listeners.push(listener);
		}
	};

	PortalManager.prototype.removeListener = function(listener) {
		var i = listeners.indexOf(listener);
		if (i >= 0) {
			listeners.splice(i, 1);
		}
	};

	return PortalManager;

}();