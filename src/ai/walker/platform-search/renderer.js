gm.Ai.PlatformSearch.Renderer = function() {

	var RenderUtil = gm.Ai.Walker.PlatformUtil.Render;

	var Renderer = function(search) {
		this._search = search;
	};

	Renderer.prototype.render = function(ctx, x, y, bbox) {
		ctx.save();
		ctx.translate(x - bbox.x0, y - bbox.y0);

		if (this._search._linkStepInc === 0) {
			this._renderAll(ctx);
		} else if (this._search._linkStepInc === 1) {
			this._renderNeighborStart(ctx);
		} else if (this._search._linkStepInc === 2) {
			this._renderNeighborLaunch(ctx);
		} else {
			this._renderNeighborLand(ctx, bbox);
		}

		ctx.restore();
	};

	Renderer.prototype._renderAll = function(ctx) {
		
		var pmap = this._search._platformMap._map;

		for (var n = 0; n < this._search._openNodes.length; n++) {
			var node = this._search._openNodes[n];
			var link = node._link;
			if (link && node !== this._search._currentNeighbor) {

				ctx.fillStyle = "rgba(0, 255, 150, 0.7)";
				RenderUtil.renderPlatform(ctx, pmap, link._fromPlatform);
				RenderUtil.renderPlatform(ctx, pmap, link._toPlatform);

				if (link._head._vyi < 0) ctx.fillStyle = "rgba(255, 0, 0, 0.5)";
				else ctx.fillStyle = "rgba(150, 0, 200, 0.5)";

				RenderUtil.renderLink(ctx, link._tail);
			}
		}
	};

	Renderer.prototype._renderNeighborStart = function(ctx) {
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

	Renderer.prototype._renderNeighborLaunch = function(ctx) {
		var neighborNode = this._search._currentNeighbor;
		if (!neighborNode) return;
		
		var parent = neighborNode._parent;
		var pmap = this._search._platformMap._map;
		var sizeY = this._search._platformMap._body._sizeY;

		ctx.save();

		ctx.fillStyle = "rgba(255, 255, 100, 0.5)";
		RenderUtil.renderLink(ctx, neighborNode._link._tail);

		ctx.strokeStyle = "blue";
		ctx.lineWidth = 2;

		var px0 = neighborNode._pxli;
		var py0 = pmap.tileToPosY(parent._platform._ty) - sizeY;
		var px1 = neighborNode._pxri - neighborNode._pxli;
		var py1 = sizeY;

		ctx.strokeRect(px0, py0, px1, py1);

		ctx.restore();
	};

	Renderer.prototype._renderNeighborLand = function(ctx) {
		var neighborNode = this._search._currentNeighbor;
		if (!neighborNode) return;
		
		var pmap = this._search._platformMap._map;
		var sizeY = this._search._platformMap._body._sizeY;

		ctx.save();

		ctx.fillStyle = "rgba(255, 255, 100, 0.5)";
		RenderUtil.renderLink(ctx, neighborNode._link._tail);

		ctx.strokeStyle = "purple";
		ctx.lineWidth = 2;
		
		var px0 = neighborNode._pxlo;
		var py0 = pmap.tileToPosY(neighborNode._platform._ty) - sizeY;
		var px1 = neighborNode._pxro - neighborNode._pxlo;
		var py1 = sizeY;

		ctx.strokeRect(px0, py0, px1, py1);

		ctx.restore();
	};

	return Renderer;

}();