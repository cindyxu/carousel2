gm.Renderer.DebugEntity = function(entity) {
	this._entity = entity;
};

gm.Renderer.DebugEntity.prototype.render = function(ctx, x, y) {
	ctx.save();
	ctx.strokeStyle = "#FF0055";
	ctx.strokeRect(x, y, this._entity.body._sizeX, this._entity.body._sizeY);
	ctx.restore();
};