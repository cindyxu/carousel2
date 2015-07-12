gm.Ai.ObservedPlatformMap.Renderer = function() {

	var RenderUtil = gm.Ai.PlatformUtil.Render;

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


	var Renderer = function(observedMap) {
		this._observedMap = observedMap;
		this._mapRenderer = new MapRenderer(observedMap._map);
	};

	Renderer.prototype.render = function(ctx, x, y, bbox) {
		this._mapRenderer.render(ctx, x, y, bbox);

		ctx.save();
		ctx.translate(x - bbox.x0, y - bbox.y0);

		ctx.fillStyle = "rgba(100, 255, 0, 0.5)";
		for (var r = 0; r < this._observedMap._reachable.length; r++) {
			var preachable = this._observedMap._reachable[r];
			if (preachable) {
				for (var l = 0; l < preachable._links.length; l++) {
					var link = preachable._links[l];
					RenderUtil.renderLink(ctx, link._tail);
				}
			}
		}
		
		var body = this._observedMap._body;
		ctx.fillStyle = undefined;
		ctx.strokeStyle = "yellow";
		ctx.translate(-x, -y);
		ctx.strokeRect(body._x, body._y, body._sizeX, body._sizeY);
		
		ctx.restore();
	};

	return Renderer;

}();