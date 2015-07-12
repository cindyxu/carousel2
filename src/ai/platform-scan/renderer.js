gm.Ai.PlatformScan.Renderer = function() {

	var Renderer = function(platformScan) {
		this._platformScan = platformScan;
	};

	Renderer.prototype.render = function(ctx, x, y, bbox) {
		ctx.save();
		ctx.translate(x - bbox.x0, y - bbox.y0);

		this._renderAreas(ctx, bbox);
		this._renderPatches(ctx, bbox);

		ctx.restore();
	};

	Renderer.prototype._renderAreas = function(ctx, bbox) {
		var currentAreas = this._platformScan._currentAreas;
		if (!currentAreas) return;

		var globalAlpha = ctx.globalAlpha;

		for (var a = 0; a < currentAreas.length; a++) {
			var currentArea = currentAreas[a];
			for (var i = 0; i < 3; i++) {
				this._renderArea(ctx, currentArea);
				this._renderArea(ctx, currentArea, true);

				ctx.globalAlpha *= 0.6;
				currentArea = currentArea._parent;
				if (!currentArea) break;
			}
			ctx.globalAlpha = globalAlpha;
		}
	};

	Renderer.prototype._renderPatches = function(ctx, bbox) {
		var reachablePatches = this._platformScan._reachablePatches;
		if (!reachablePatches) return;

		ctx.save();
		ctx.fillStyle = "rgba(0, 200, 255, 0.6)";

		for (var p = 0; p < reachablePatches.length; p++) {
			var patch = reachablePatches[p];
			ctx.fillRect(patch._ppxl, patch._pyi, patch._ppxr - patch._ppxl, this._platformScan._cmap.tilesize);
		}

		ctx.restore();
	};

	Renderer.prototype._renderArea = function(ctx, area, isDetectionArea) {
		
		var sizeY = this._platformScan._sizeY;
		var tilesize = this._platformScan._cmap.tilesize;

		ctx.save();

		if (isDetectionArea) {
			ctx.fillStyle = "rgba(200, 200, 0, 0.3)";
			ctx.strokeStyle = "rgba(200, 200, 0, 1)";
			if (area.vyi < 0) ctx.translate(0, -sizeY);
		} else {
			ctx.fillStyle = "rgba(100, 255, 0, 0.3)";
			ctx.strokeStyle = "rgba(100, 255, 0, 1)";
		}

		if (area._pyo < area._pyi) {
			ctx.fillRect(area._pxlo, area._pyo, 
				area._pxro - area._pxlo, area._pyi - area._pyo);
		} else {
			ctx.fillRect(area._pxlo, area._pyi, 
				area._pxro - area._pxlo, area._pyo - area._pyi);
		}

		ctx.beginPath();
		ctx.moveTo(area._pxli, area._pyi);
		ctx.lineTo(area._pxlo, area._pyo);
		ctx.closePath();
		ctx.stroke();
		
		ctx.beginPath();
		ctx.moveTo(area._pxri, area._pyi);
		ctx.lineTo(area._pxro, area._pyo);
		ctx.closePath();
		ctx.stroke();

		ctx.restore();
	};

	return Renderer;
}();

