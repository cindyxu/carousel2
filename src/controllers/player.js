if (!gm.Controllers) gm.Controllers = {};

gm.Controllers.Player = function(entity, params) {
	this._entity = entity;
	this._level = undefined;

	this._walkParams = undefined;
	this._floatParams = undefined;

	this.setParams(params);
};

gm.Controllers.Player.prototype.setParams = function(params) {
	if (params.walk !== undefined) this._walkParams = params.walk;
	if (params.float !== undefined) this._floatParams = params.float;
};

gm.Controllers.Player.prototype.initWithGame = function(gameObserver) {
	if (LOGGING) {
		console.log("player - init with game");
	}
	gameObserver.addListener(this);
};

gm.Controllers.Player.prototype.onBodyChanged = function() {
	if (this._behavior) this._behavior.setBody(this._entity._body);
};

gm.Controllers.Player.prototype.onSpriteChanged = function() {
	if (this._spriteMapper) this._spriteMapper.setSprite(this._entity._sprite);
};

gm.Controllers.Player.prototype.onEntityAddedToLevel = function(entity, level, levelObserver) {
	if (entity === this._entity) {
		levelObserver.addListener(this);
		this._initWithLevel(level);
	}
};

gm.Controllers.Player.prototype.onEntityRemovedFromLevel = function(entity, level, levelObserver) {
	if (entity === this._entity) {
		levelObserver.removeListener(this);
		this._behavior = undefined;
	}
};

gm.Controllers.Player.prototype.onLevelChanged = function(level) {
	this._initWithLevel(level);
};

gm.Controllers.Player.prototype.control = function() {
	this._behavior.control(gm.Input);
	this._spriteMapper.update();
};

gm.Controllers.Player.prototype.post = function() {
	this._behavior.post();
};

gm.Controllers.Player.prototype._initWithLevel = function(level) {
	if (level._gravity !== 0) {
		this._entity._body.setParams(this._walkParams.body);
		this._behavior = new gm.Behaviors.Walker(this._walkParams.behavior, this._entity._body);
		this._spriteMapper = new gm.SpriteMapper.Walker(this._behavior, this._entity._sprite);
	} else {
		this._entity._body.setParams(this._floatParams.body);
		this._behavior = new gm.Behaviors.Floater(this._floatParams.behavior, this._entity._body);
		this._spriteMapper = new gm.SpriteMapper.Floater(this._behavior, this._entity._sprite);
	}
};