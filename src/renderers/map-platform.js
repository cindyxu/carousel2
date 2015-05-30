gm.Renderer.PlatformMap = function(map) {
	gm.Renderer.Map.call(this, map);
};

gm.Renderer.PlatformMap.prototype = Object.create(gm.Renderer.Map.prototype);

gm.Renderer.PlatformMap.prototype.applyStyle = function(ctx) {
	ctx.strokeStyle = "black";
	ctx.lineWidth = 2;
	ctx.font = "bold 12px 0b403";
	ctx.textAlign = "center";
};

gm.Renderer.PlatformMap.prototype.renderTileFn = function(ctx, map, tx, ty) {
	var platform = map._tiles[ty * map._tilesX + tx];
	var tilesize = map.tilesize;
	var ti;
	if (!platform) {
		ti = "~";
		ctx.fillStyle = "gray";
	} else {
		ti = platform.index;
		ctx.fillStyle = "white";
	}
	ctx.strokeText(ti, (tx+0.5) * tilesize, (ty+0.5) * tilesize);
	ctx.fillText(ti, (tx+0.5) * tilesize, (ty+0.5) * tilesize);
};