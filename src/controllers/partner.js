if (!gm.Controllers) gm.Controllers = {};

gm.Controllers.Partner = function(entity, params, aiParams) {
	gm.Controllers.Player.call(this, entity, params);
	this._agent = new gm.Ai.Agent(entity, this._camera, aiParams);
};

gm.Controllers.Partner.prototype = Object.create(gm.Controllers.Player.prototype);

gm.Controllers.Partner.prototype.onBodyChanged = function() {
	gm.Controllers.Player.prototype.onBodyChanged.call(this);
	this._agent.onBodyChanged();
};

gm.Controllers.Partner.prototype.onEntityAddedToLevel = function(entity, level, levelManager) {
	gm.Controllers.Player.prototype.onEntityAddedToLevel.call(this, entity, level, levelManager);
	this._agent.onEntityAddedToLevel(entity, level, levelManager);
};

gm.Controllers.Partner.prototype.onEntityRemovedFromLevel = function(entity, level, levelManager) {
	gm.Controllers.Player.prototype.onEntityRemovedFromLevel.call(this, entity, level, levelManager);
	this._agent.onEntityRemovedFromLevel(entity, level, levelManager);
};

gm.Controllers.Partner.prototype.control = function() {
	this._behavior.control(this._agent.getNextInput());
	this._spriteMapper.update();
};