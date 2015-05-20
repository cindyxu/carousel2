var LOGGING = gm.Settings.LOGGING;

var tag = 0;

gm.Entity = function(name, params) {
	var entity = this;

	entity.name = name;

	entity.layer = undefined;

	entity.body = undefined;
	entity.renderer = undefined;
	entity.controller = undefined;

	entity._drawIndex = 0;
	entity.collideMapType = gm.Constants.Collision.mapTypes.ALL;
	entity.collideBodyType = gm.Constants.Collision.bodyTypes.ALL;

	entity._tag = tag++;

	if (params) entity.setParams(params);

	if (!name && LOGGING) console.log("!!! new entity - no name");
};

gm.Entity.prototype.readState = function(state) {
	this._body.readState(state);
};

gm.Entity.prototype.writeState = function(state) {
	this._body.writeState(state);
};

gm.Entity.prototype.setParams = function(params) {
	if (params.drawIndex !== undefined) this._drawIndex = params.drawIndex;
	if (params.collideMapType !== undefined) this.collideMapType = params.collideMapType;
	if (params.collideBodyType !== undefined) this.collideBodyType = params.collideBodyType;
};

gm.Entity.prototype.preUpdate = function() {
	if (this.controller) this.controller.control();
};

gm.Entity.prototype.postUpdate = function() {
	if (this.controller && this.controller.post) this.controller.post();
};

gm.Entity.prototype.render = function(ctx, bbox) {
	if (this.renderer && this.body && this.body.overlapsBbox(bbox)) {
		this.renderer.render(ctx, bbox);
	}
};

gm.EntityClasses = {};