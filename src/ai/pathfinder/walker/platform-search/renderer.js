gm.Pathfinder.Walker.PlatformSearch.Renderer = function() {

	var Renderer = function(search) {
		this._search = search;
	};

	Renderer.prototype.render = function(ctx, bbox) {

		if (this._search._linkStepInc === 0) {
			this._renderAll(ctx, bbox);
		} else if (this._search._linkStepInc === 1) {
			this._renderNeighborStart(ctx, bbox);
		} else if (this._search._linkStepInc === 2) {
			this._renderNeighborLaunch(ctx, bbox);
		} else {
			this._renderNeighborLand(ctx, bbox);
		}
	};

	Renderer.prototype._renderAll = function(ctx, bbox) {
		ctx.save();

		for (var n = 0; n < this._search._openNodes.length; n++) {
			var node = this._search._openNodes[n];
			var link = node._link;
			if (link && node !== this._search._currentNeighbor) {

				ctx.fillStyle = "rgba(0, 255, 150, 0.7)";
				this._renderPlatform(ctx, bbox, link._fromPlatform);
				this._renderPlatform(ctx, bbox, link._toPlatform);

				if (link._head._vyi < 0) ctx.fillStyle = "rgba(255, 0, 0, 0.5)";
				else ctx.fillStyle = "rgba(150, 0, 200, 0.5)";

				this._renderHierarchy(ctx, bbox, link._tail);
			}
		}

		ctx.restore();
	};

	Renderer.prototype._renderPlatform = function(ctx, bbox, platform) {
		var pmap = this._search._platformMap._map;
		var px0 = pmap.tileToPosX(platform._tx0);
		var px1 = pmap.tileToPosX(platform._tx1);
		ctx.fillRect(px0, pmap.tileToPosY(platform._ty), px1 - px0, pmap.tilesize);
	};

	Renderer.prototype._renderArea = function(ctx, bbox, area) {
		if (area._pyo < area._pyi) {
			ctx.fillRect(area._pxlo, area._pyo, 
				area._pxro - area._pxlo, area._pyi - area._pyo);
		} else {
			ctx.fillRect(area._pxlo, area._pyi, 
				area._pxro - area._pxlo, area._pyo - area._pyi);
		}
	};

	Renderer.prototype._renderNeighborStart = function(ctx, bbox) {
		var neighborNode = this._search._currentNeighbor;
		if (!neighborNode) return;

		var parent = neighborNode._parent;
		var pmap = this._search._platformMap._map;
		var sizeY = this._search._platformMap._body._sizeY;

		ctx.save();
		
		ctx.strokeStyle = "orange";
		ctx.lineWidth = 2;

		ctx.strokeRect(parent._pxlo, 
			pmap.tileToPosY(parent._platform._ty) - sizeY, 
			parent._pxro - parent._pxlo, 
			sizeY);

		ctx.restore();
	};

	Renderer.prototype._renderNeighborLaunch = function(ctx, bbox) {
		var neighborNode = this._search._currentNeighbor;
		if (!neighborNode) return;
		
		var parent = neighborNode._parent;
		var pmap = this._search._platformMap._map;
		var sizeY = this._search._platformMap._body._sizeY;

		ctx.save();

		ctx.fillStyle = "rgba(255, 255, 100, 0.5)";
		this._renderHierarchy(ctx, bbox, neighborNode._link._tail);

		ctx.strokeStyle = "blue";
		ctx.lineWidth = 2;

		var px0 = neighborNode._pxli;
		var py0 = pmap.tileToPosY(parent._platform._ty) - sizeY;
		var px1 = neighborNode._pxri - neighborNode._pxli;
		var py1 = sizeY;

		ctx.strokeRect(px0, py0, px1, py1);

		ctx.restore();
	};

	Renderer.prototype._renderNeighborLand = function(ctx, bbox) {
		var neighborNode = this._search._currentNeighbor;
		if (!neighborNode) return;
		
		var pmap = this._search._platformMap._map;
		var sizeY = this._search._platformMap._body._sizeY;

		ctx.save();

		ctx.fillStyle = "rgba(255, 255, 100, 0.5)";
		this._renderHierarchy(ctx, bbox, neighborNode._link._tail);

		ctx.strokeStyle = "purple";
		ctx.lineWidth = 2;
		
		var px0 = neighborNode._pxlo;
		var py0 = pmap.tileToPosY(neighborNode._platform._ty) - sizeY;
		var px1 = neighborNode._pxro - neighborNode._pxlo;
		var py1 = sizeY;

		ctx.strokeRect(px0, py0, px1, py1);

		ctx.restore();
	};

	Renderer.prototype._renderHierarchy = function(ctx, bbox, tail) {
		while (tail) {
			this._renderArea(ctx, bbox, tail);
			tail = tail._parent;
		}
	};

	return Renderer;

}();