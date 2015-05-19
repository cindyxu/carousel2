gm.Renderer.PlatformMap = function(map) {
	gm.Renderer.Map.call(this, map);
};

gm.Renderer.PlatformMap.prototype = Object.create(gm.Renderer.Map.prototype);

gm.Renderer.PlatformMap.prototype.applyStyle = function(ctx) {
	ctx.fillStyle = "white";
	ctx.strokeStyle = "black";
	ctx.lineWidth = 2;
	ctx.font = "bold 12px 0b403";
	ctx.textAlign = "center";
};

gm.Renderer.PlatformMap.prototype.renderTileFn = function(ctx, map, tx, ty) {
	var ti = map._tiles[ty * map._tilesX + tx];
	var tilesize = map.tilesize;
	if (ti) {
		ctx.strokeText(ti, (tx+0.5) * tilesize, (ty+0.5) * tilesize);
		ctx.fillText(ti, (tx+0.5) * tilesize, (ty+0.5) * tilesize);
	}
};