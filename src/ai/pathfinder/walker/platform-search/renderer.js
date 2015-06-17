gm.Pathfinder.Walker.PlatformSearch.Renderer = function() {

	var Renderer = function(search) {
		this._search = search;
	};

	Renderer.prototype.render = function(ctx, bbox) {
		ctx.save();

		for (var n = 0; n < this._search._openNodes.length; n++) {
			var node = this._search._openNodes[n];
			var link = node._link;
			if (link) {

				ctx.fillStyle = "rgba(0, 255, 150, 0.7)";
				this.renderPlatform(ctx, bbox, link._fromPlatform);
				this.renderPlatform(ctx, bbox, link._toPlatform);

				if (link._head._vyi < 0) ctx.fillStyle = "rgba(255, 0, 0, 0.5)";
				else ctx.fillStyle = "rgba(150, 0, 200, 0.5)";

				var area = link._tail;
				while (area !== undefined) {
					this.renderArea(ctx, bbox, area);
					area = area._parent;
				}
			}
		}

		ctx.restore();
	};

	Renderer.prototype.renderPlatform = function(ctx, bbox, platform) {
		var pmap = this._search._platformMap._map;
		var px0 = pmap.tileToPosX(platform._tx0);
		var px1 = pmap.tileToPosX(platform._tx1);
		ctx.fillRect(px0, pmap.tileToPosY(platform._ty), px1 - px0, pmap.tilesize);
	};

	Renderer.prototype.renderArea = function(ctx, bbox, area) {
		if (area._pyo < area._pyi) {
			ctx.fillRect(area._pxlo, area._pyo, 
				area._pxro - area._pxlo, area._pyi - area._pyo);
		} else {
			ctx.fillRect(area._pxlo, area._pyi, 
				area._pxro - area._pxlo, area._pyo - area._pyi);
		}
	};

	return Renderer;

}();