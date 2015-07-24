if (!gm.Controllers) gm.Controllers = {};

gm.Controllers.Player = function(entity, params) {
	this._entity = entity;
	this._behavior = new gm.Behaviors.Walker(params, entity._body, entity._sprite);
};

gm.Controllers.Player.prototype.onBodyChanged = function() {
	this._behavior.setBody(this._entity._body);
};

gm.Controllers.Player.prototype.control = function() {
	this._behavior.control(gm.Input);
};

gm.Controllers.Player.prototype.post = function() {
	this._behavior.post();
};