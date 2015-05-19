gm.Renderer.DebugMap = function(map, params) {
	gm.Renderer.Map.call(this, map, params);
	this.strokeStyle = "white";

	if (params) {
		if (params.strokeStyle) this.strokeStyle = params.strokeStyle;
	}
};

gm.Renderer.DebugMap.prototype = Object.create(gm.Renderer.Map.prototype);

gm.Renderer.DebugMap.prototype.isValid = function() { return true; };

gm.Renderer.DebugMap.prototype.applyStyle = function(ctx) {
	ctx.strokeStyle = this.strokeStyle;
};

gm.Renderer.DebugMap.prototype.renderTileFn = function(ctx, map, ptx, pty) {
	var tilesize = this.map.tilesize;
	ctx.strokeRect(ptx * tilesize, pty * tilesize, tilesize, tilesize);
};