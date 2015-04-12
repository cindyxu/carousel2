var renderer = gm.Editor.Renderer.Map = function(map, params) {
	gm.Renderer.Map.call(this, map, params);

	this.strokeStyle = "white";

	if (params) {
		if (params.strokeStyle) this.strokeStyle = params.strokeStyle;
	}
};

renderer.prototype = Object.create(gm.Renderer.Map.prototype);

renderer.prototype.isValid = function() { return true; };

renderer.prototype.render = function(ctx, x, y, bbox) {
	ctx.save();
	ctx.strokeStyle = this.strokeStyle;

	gm.Renderer.Map.prototype.render.call(this, ctx, x, y, bbox);
	
	ctx.restore();
};

renderer.prototype.renderTileFn = function(ctx, map, ptx, pty) {
	var tilesize = this.map.tilesize;
	ctx.strokeRect(ptx * tilesize, pty * tilesize, tilesize, tilesize);
};