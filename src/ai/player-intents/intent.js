gm.Ai.PlayerIntent = function(observer) {

	this._pastIntents = [];
	this._currentIntent = new gm.Ai.PlayerIntent.Travelling(observer);
	this._currentIntent.enter();

};

gm.Ai.PlayerIntent.onChangeIntent = function(newIntent) {

};