gm.Ai.ObservedPlatformMap.Renderer = function() {

	var MapRenderer = function(map) {
		gm.Renderer.Map.call(this, map);
	};

	MapRenderer.prototype = Object.create(gm.Renderer.Map.prototype);

	MapRenderer.prototype.applyStyle = function(ctx) {
		ctx.fillStyle = "rgba(255, 0, 0, 0.8)";
	};

	MapRenderer.prototype.renderTileFn = function(ctx, map, tx, ty) {
		var platform = map._tiles[ty * map._tilesX + tx];
		if (platform) {
			var tilesize = map.tilesize;
			ctx.fillRect(tx * tilesize, ty * tilesize, tilesize, tilesize);
		}
	};

	return MapRenderer;

}();