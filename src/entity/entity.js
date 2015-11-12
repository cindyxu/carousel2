gm.Entity = function() {

	var tag = 0;

	var Entity = function(name, params) {
		var entity = this;

		entity._name = name;

		entity._body = undefined;
		entity._sprite = undefined;
		entity._renderer = undefined;
		entity._controller = undefined;

		entity._drawIndex = 0;
		entity.collideMapType = gm.Constants.Collision.mapTypes.ALL;
		entity.collideBodyType = gm.Constants.Collision.bodyTypes.ALL;

		entity._tag = tag++;

		if (params) entity.setParams(params);

		if (!name && LOGGING) console.log("!!! new entity - no name");
	};

	Entity.prototype.setParams = function(params) {
		if (params.drawIndex !== undefined) this._drawIndex = params.drawIndex;
		if (params.collideMapType !== undefined) this.collideMapType = params.collideMapType;
		if (params.collideBodyType !== undefined) this.collideBodyType = params.collideBodyType;
	};

	Entity.prototype.setBody = function(body) {
		this._body = body;
		if (this._renderer) this._renderer.setBody(this._body);
		if (this._controller) this._controller.onBodyChanged();
	};

	Entity.prototype.setSprite = function(sprite) {
		this._sprite = sprite;
		if (this._sprite) this._renderer.setSprite(this._sprite);
	};

	Entity.prototype.setRenderer = function(renderer) {
		this._renderer = renderer;
		this._renderer.setBody(this._body);
		this._renderer.setSprite(this._sprite);
	};

	Entity.prototype.setController = function(controller) {
		this._controller = controller;
		this._controller.onBodyChanged();
	};

	Entity.prototype.preUpdate = function() {
		if (this._controller) this._controller.control();
	};

	Entity.prototype.postUpdate = function() {
		if (this._controller && this._controller.post) this._controller.post();
	};

	Entity.prototype.render = function(ctx, bbox) {
		if (this._renderer && this._body && this._body.overlapsBbox(bbox)) {
			this._renderer.render(ctx, this._body._x, this._body._y);
		}
	};

	return Entity;

}();