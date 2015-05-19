gm.Controllers.Player = function(body, params) {
	this._body = body;
	this._behavior = new gm.Behaviors.Walker(body, params);
};

gm.Controllers.Player.prototype.control = function() {
	this._behavior.control(gm.Input);
};

gm.Controllers.Player.prototype.post = function() {
	this._behavior.post();
};