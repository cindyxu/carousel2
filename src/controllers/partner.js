if (!gm.Controllers) gm.Controllers = {};

gm.Controllers.Partner = function(entity, params) {
	this._entity = entity;
	
	this._behavior = new gm.Behaviors.Walker(params, entity._body, entity._sprite);

	this._camera = new gm.Camera({
		sizeX: 400,
		sizeY: 300
	});
	this._camera.track(entity._body);
	
	this._agent = new gm.Ai.Agent(entity, this._camera);
};

gm.Controllers.Partner.prototype.onBodyChanged = function() {
	this._behavior.setBody(this._entity._body);
	this._camera.track(this._entity._body);
	this._agent.onBodyChanged();
};

gm.Controllers.Partner.prototype.control = function() {
	this._camera.update();
	this._behavior.control(this._agent.getNextInput());
};

gm.Controllers.Partner.prototype.post = function() {
	this._behavior.post();
};