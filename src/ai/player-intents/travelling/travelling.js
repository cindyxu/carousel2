gm.PlayerIntent.Travelling = function(observer) {
	this._observer = observer;
	this._predictor = new gm.PlayerIntent.Travelling.Predictor(observer, this);
};

gm.PlayerIntent.Travelling.enter = function() {
	this._predictor.startListening();
};

gm.PlayerIntent.Travelling.exit = function() {
	this._predictor.stopListening();
};

gm.PlayerIntent.onUnexpectedJump = function() {
	console.log("unexpected jump");
};

gm.PlayerIntent.onUnexpectedTurn = function() {
	console.log("unexpected turn");
};

gm.PlayerIntent.onUnexpectedLand = function() {
	console.log("unexpected land");
};