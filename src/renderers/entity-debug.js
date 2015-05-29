gm.Renderer.DebugEntity = function(body, sprite) {
	this.setBody(body);
};

gm.Renderer.DebugEntity.prototype = Object.create(gm.Renderer.prototype);

gm.Renderer.DebugEntity.prototype.setBody = function(body) {
	this._body = body;
};

gm.Renderer.DebugEntity.prototype.setSprite = function(sprite) {
};

gm.Renderer.DebugEntity.prototype.render = function(ctx, x, y) {
	ctx.save();
	ctx.strokeStyle = "#FF0055";
	ctx.strokeRect(x, y, this._body._sizeX, this._body._sizeY);
	ctx.restore();
};