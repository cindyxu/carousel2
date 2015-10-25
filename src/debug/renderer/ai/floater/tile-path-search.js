gm.Debug.Renderer.Ai.Floater.TilePathSearch = function() {
	
	var Renderer = function(pathSearch) {
		this._pathSearch = pathSearch;
	};

	Renderer.prototype.render = function(ctx, x, y, bbox) {
		if (!ctx || !bbox) {
			console.log("!!! reachable renderer - ctx:", ctx, ", bbox:", bbox);
			return;
		}

		var openNodes = this._pathSearch._openNodes;
		var tilesize = this._pathSearch._combinedMap._map.tilesize;
		if (openNodes) {
			ctx.save();
			ctx.translate(x - bbox.x0, y - bbox.y0);

			ctx.fillStyle = "rgba(100, 255, 0, 0.5)";

			var stx = this._pathSearch._tilesX * tilesize;
			var sty = this._pathSearch._tilesY * tilesize;

			for (var i = 0; i < openNodes.length; i++) {
				var node = openNodes[i];
				var nx = this._pathSearch._combinedMap.tileToPosX(node._tx);
				var ny = this._pathSearch._combinedMap.tileToPosY(node._ty);
				ctx.fillRect(nx, ny, stx, sty);
			}

			ctx.restore();
		}
	};

	return Renderer;
}();