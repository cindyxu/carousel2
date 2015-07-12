gm.PlayerIntent = function(observer) {

	this._pastIntents = [];
	this._currentIntent = new gm.PlayerIntent.Travelling(observer);
	this._currentIntent.enter();

};

gm.PlayerIntent.onChangeIntent = function(newIntent) {

};