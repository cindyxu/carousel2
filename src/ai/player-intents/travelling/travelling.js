gm.Ai.PlayerIntent.Travelling = function(observer) {
	this._observer = observer;
	this._predictor = new gm.Ai.PlayerIntent.Predictor(observer);
	this._observer.addListener(this);
};

gm.Ai.PlayerIntent.Travelling.prototype.enterIntent = function() {
	this._predictor.startListening();
};

gm.Ai.PlayerIntent.Travelling.prototype.exitIntent = function() {
	this._predictor.resetPredictions();
	this._predictor.stopListening();
};

gm.Ai.PlayerIntent.Travelling.prototype.preUpdate = function() {
};

gm.Ai.PlayerIntent.Travelling.prototype.onUnexpectedJump = function() {
	console.log("unexpected jump");
};

gm.Ai.PlayerIntent.Travelling.prototype.onUnexpectedTurn = function() {
	console.log("unexpected turn");
};

gm.Ai.PlayerIntent.Travelling.prototype.onUnexpectedLand = function() {
	console.log("unexpected land");
};

gm.Ai.PlayerIntent.Travelling.prototype.onEnterSight = function() {
};

gm.Ai.PlayerIntent.Travelling.prototype.onLeaveSight = function() {
	this._predictor.resetPredictions();
};