gm.Controllers.Player = function(body, params) {
	this._body = body;
	this._runBehavior = new gm.Behaviors.Runner(body, params);
};

gm.Controllers.Player.prototype.control = function() {
	this._runBehavior.control(gm.Input);
};

gm.Controllers.Player.prototype.post = function() {
	this._runBehavior.post();
};