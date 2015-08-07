gm.Ai.PlayerIntent = function(camera) {
	this._pastIntents = [];
	this._playerObserver = new gm.Ai.WalkerObserver("player", camera._body);
	this._currentIntent = new gm.Ai.PlayerIntent.Travelling(this._playerObserver);
	this._currentIntent.enterIntent();
};

gm.Ai.PlayerIntent.prototype.onInitWithLevel = function(levelInfo) {
	this._playerObserver.onInitWithLevel(levelInfo);
};

gm.Ai.PlayerIntent.prototype.onChangeIntent = function(newIntent) {

};

gm.Ai.PlayerIntent.prototype.preUpdate = function(newIntent) {
	this._currentIntent.preUpdate();
};
