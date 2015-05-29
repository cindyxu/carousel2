gm.Controllers.Player = function(params, body, sprite) {
	this._behavior = new gm.Behaviors.Walker(params, body, sprite);
};

gm.Controllers.Player.prototype.setBody = function(body) {
	this._behavior.setBody(body);
};

gm.Controllers.Player.prototype.setSprite = function(sprite) {
};

gm.Controllers.Player.prototype.control = function() {
	this._behavior.control(gm.Input);
};

gm.Controllers.Player.prototype.post = function() {
	this._behavior.post();
};