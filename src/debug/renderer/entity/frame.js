gm.Debug.Renderer.Entity.Frame = function(body, sprite) {
	this.setBody(body);
	this._color = "#00FFFF";
};

gm.Debug.Renderer.Entity.Frame.prototype = Object.create(gm.Renderer.prototype);

gm.Debug.Renderer.Entity.Frame.prototype.setBody = function(body) {
	this._body = body;
};

gm.Debug.Renderer.Entity.Frame.prototype.setSprite = function(sprite) {
};

gm.Debug.Renderer.Entity.Frame.prototype.render = function(ctx, x, y) {
	ctx.save();
	ctx.strokeStyle = this._color;
	ctx.strokeRect(x, y, this._body._sizeX, this._body._sizeY);
	ctx.restore();
};