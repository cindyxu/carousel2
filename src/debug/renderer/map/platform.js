gm.Debug.Renderer.Map.Platform = function(map) {
	gm.Renderer.Map.call(this, map);
};

gm.Debug.Renderer.Map.Platform.prototype = Object.create(gm.Renderer.Map.prototype);

gm.Debug.Renderer.Map.Platform.prototype.applyStyle = function(ctx) {
	ctx.lineWidth = 2;
	ctx.font = "bold 12px 0b403";
	ctx.textAlign = "center";
};

gm.Debug.Renderer.Map.Platform.prototype.renderTileFn = function(ctx, map, tx, ty) {
	var platform = map._tiles[ty * map._tilesX + tx];

	var tilesize = map.tilesize;

	ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
	ctx.strokeRect(tx * tilesize, ty * tilesize, tilesize, tilesize);

	var ti;
	if (!platform) {
		ti = "~";
		ctx.fillStyle = "gray";
	} else {
		ti = platform._index;
		ctx.fillStyle = "white";
	}
	
	ctx.strokeStyle = "black";
	ctx.strokeText(ti, (tx+0.5) * tilesize, (ty+0.5) * tilesize);
	ctx.fillText(ti, (tx+0.5) * tilesize, (ty+0.5) * tilesize);
};