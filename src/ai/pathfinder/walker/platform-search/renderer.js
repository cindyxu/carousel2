gm.Pathfinder.Walker.PlatformSearch.Renderer = function() {

	var Renderer = function(platformSearch) {
		this._platformSearch = platformSearch;
	};

	Renderer.prototype.render = function(ctx, bbox) {

		ctx.save();
		ctx.translate(bbox.x0, bbox.y0);

		this._renderAreas(ctx, bbox);
		this._renderReachablePlatforms(ctx, bbox);

		ctx.restore();
	};

	Renderer.prototype._renderAreas = function(ctx, bbox) {
		var currentAreas = this._platformSearch._currentAreas;
		var globalAlpha = ctx.globalAlpha;

		for (var a = 0; a < currentAreas.length; a++) {
			var currentArea = currentAreas[a];
			for (var i = 0; i < 3; i++) {
				this._renderArea(ctx, currentArea);
				this._renderArea(ctx, currentArea, true);

				ctx.globalAlpha *= 0.6;
				currentArea = currentArea.parent;
				if (!currentArea) break;
			}
			ctx.globalAlpha = globalAlpha;
		}
	};

	Renderer.prototype._renderReachablePlatforms = function(ctx, bbox) {
		ctx.save();
		ctx.fillStyle = "rgba(0, 200, 255, 0.6)";

		var platformMap = this._platformSearch._platformMap;
		var reachablePlatforms = this._platformSearch._reachablePlatforms;

		for (var p = 0; p < reachablePlatforms.length; p++) {
			var platform = reachablePlatforms[p].platform;
			var py = platformMap.tileToPosY(platform.ty);
			var px = platformMap.tileToPosX(platform.tx0);
			ctx.fillRect(px, py, platformMap.tilesize * (platform.tx1 - platform.tx0), platformMap.tilesize);
		}

		ctx.restore();
	};

	Renderer.prototype._renderArea = function(ctx, area, isDetectionArea) {
		
		var sizeY = this._platformSearch._sizeY;
		var tilesize = this._platformSearch._platformMap.tilesize;

		ctx.save();

		if (isDetectionArea) {
			ctx.fillStyle = "rgba(200, 200, 0, 0.3)";
			ctx.strokeStyle = "rgba(200, 200, 0, 1)";
			if (area.vyi < 0) ctx.translate(0, -sizeY);
		} else {
			ctx.fillStyle = "rgba(100, 255, 0, 0.3)";
			ctx.strokeStyle = "rgba(100, 255, 0, 1)";
		}

		if (area.pyo < area.pyi) {
			ctx.fillRect(area.pxlo, area.pyo, 
				area.pxro - area.pxlo, area.pyi - area.pyo);
		} else {
			ctx.fillRect(area.pxlo, area.pyi, 
				area.pxro - area.pxlo, area.pyo - area.pyi);
		}

		ctx.beginPath();
		ctx.moveTo(area.pxli, area.pyi);
		ctx.lineTo(area.pxlo, area.pyo);
		ctx.closePath();
		ctx.stroke();
		
		ctx.beginPath();
		ctx.moveTo(area.pxri, area.pyi);
		ctx.lineTo(area.pxro, area.pyo);
		ctx.closePath();
		ctx.stroke();

		ctx.restore();
	};

	return Renderer;
}();

