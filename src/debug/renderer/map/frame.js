gm.Debug.Renderer.Map.Frame = function(map, params) {
	gm.Renderer.Map.call(this, map, params);
	this.strokeStyle = "white";

	if (params) {
		if (params.strokeStyle) this.strokeStyle = params.strokeStyle;
	}
};

gm.Debug.Renderer.Map.Frame.prototype = Object.create(gm.Renderer.Map.prototype);

gm.Debug.Renderer.Map.Frame.prototype.isValid = function() { return true; };

gm.Debug.Renderer.Map.Frame.prototype.applyStyle = function(ctx) {
	ctx.strokeStyle = this.strokeStyle;
};

gm.Debug.Renderer.Map.Frame.prototype.renderTileFn = function(ctx, map, ptx, pty) {
	var tilesize = this.map.tilesize;
	ctx.strokeRect(ptx * tilesize, pty * tilesize, tilesize, tilesize);
};