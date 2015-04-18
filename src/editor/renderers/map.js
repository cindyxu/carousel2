var renderer = gm.Editor.Renderer.Map = function(map, params) {
	gm.Renderer.Map.call(this, map, params);
	this.strokeStyle = "white";

	if (params) {
		if (params.strokeStyle) this.strokeStyle = params.strokeStyle;
	}
};

renderer.prototype = Object.create(gm.Renderer.Map.prototype);

renderer.prototype.isValid = function() { return true; };

renderer.prototype.applyStyle = function(ctx) {
	ctx.strokeStyle = this.strokeStyle;
};

renderer.prototype.renderTileFn = function(ctx, map, ptx, pty) {
	var tilesize = this.map.tilesize;
	ctx.strokeRect(ptx * tilesize, pty * tilesize, tilesize, tilesize);
};