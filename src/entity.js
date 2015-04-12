var tag = 0;

gm.Entity = function(name, body, renderer, controller, params) {
	var entity = this;

	entity.name = name;
	entity.body = body;
	entity.renderer = renderer;
	entity.controller = controller;
	controller.bind(entity);

	entity.layer = undefined;

	entity._drawIndex = 0;
	entity.collideMapType = gm.Constants.Collision.mapTypes.ALL;
	entity.collideBodyType = gm.Constants.Collision.bodyTypes.ALL;

	entity._tag = tag++;

	if (params) entity.setParams(params);
};

gm.Entity.prototype.setParams = function(params) {
	if (params.drawIndex !== undefined) entity._drawIndex = params.drawIndex;
	if (params.collideMapType !== undefined) entity.collideMapType = params.collideMapType;
	if (params.collideBodyType !== undefined) entity.collideBodyTyp = params.collideBodyTyp;
};

gm.Entity.prototype.preUpdate = function() {
	if (this.controller) this.controller.control();
};

gm.Entity.prototype.updateStep = function(delta) {
	if (this.body) this.body.updateStep(delta);
};

gm.Entity.prototype.postUpdate = function() {
	if (this.controller) this.controller.post();
};

gm.Entity.prototype.render = function(ctx, bbox) {
	if (this.renderer && this.body && this.body.overlapsBbox(bbox)) {
		this.renderer.render(ctx, bbox);
	}
};

gm.EntityClasses = {};