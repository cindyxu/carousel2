gm.Ai.PlayerIntent.Travelling = function(observer) {
	this._observer = observer;
	this._predictor = new gm.Ai.PlayerIntent.Predictor(observer);
};

gm.Ai.PlayerIntent.Travelling.prototype.enter = function() {
	this._predictor.startListening();
};

gm.Ai.PlayerIntent.Travelling.prototype.exit = function() {
	this._predictor.stopListening();
};

gm.Ai.PlayerIntent.prototype.onUnexpectedJump = function() {
	console.log("unexpected jump");
};

gm.Ai.PlayerIntent.prototype.onUnexpectedTurn = function() {
	console.log("unexpected turn");
};

gm.Ai.PlayerIntent.prototype.onUnexpectedLand = function() {
	console.log("unexpected land");
};