gm.Ai.WalkerObserver.PortalObserver = function(observer) {
	this._observer = observer;
};

gm.Ai.WalkerObserver.PortalObserver.prototype.startListening = function(entity) {
	this._entity = entity;
	gm.PortalManager.addListener(this);
};

gm.Ai.WalkerObserver.PortalObserver.prototype.stopListening = function() {
	gm.PortalManager.removeListener(this);
	this._entity = undefined;
};

gm.Ai.WalkerObserver.PortalObserver.prototype.onEnterPortal = function(entity, toLevel) {
	if (entity === this._entity) {
		this._observer.onEnterPortal(toLevel);
	}
};