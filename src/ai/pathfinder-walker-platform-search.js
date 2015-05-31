if (!gm.Pathfinder) gm.Pathfinder = {};
if (!gm.Pathfinder.Walker) gm.Pathfinder.Walker = {};

gm.Pathfinder.Walker.PlatformSearch = function() {

	var DOWN = gm.Constants.Dir.DOWN;
	var UP = gm.Constants.Dir.UP;
	var LEFT = gm.Constants.Dir.LEFT;
	var RIGHT = gm.Constants.Dir.RIGHT;

	var PlatformSearch = function(
		platformMap, sizeX, sizeY, runSpd, jumpSpd, fallAccel, terminalV, originPlatform) {

		this._platformMap = platformMap;
		this._sizeX = sizeX;
		this._sizeY = sizeY;
		this._runSpd = runSpd;
		this._jumpSpd = jumpSpd;
		this._fallAccel = fallAccel;
		this._terminalV = terminalV;

		console.log("sizeX", sizeX, "sizeY", sizeY);
		console.log("runSpd", runSpd, "jumpSpd", jumpSpd, "fallAccel", fallAccel, "terminalV", terminalV);

		if (LOGGING) {
			if (!platformMap) console.log("!!! platformSearch - no platformMap");
			if (isNaN(sizeX) || isNaN(sizeY)) console.log("!!! platformSearch - body dimensions were", sizeX, ",", sizeY);
			if (isNaN(runSpd)) console.log("!!! platformSearch - runSpd was", runSpd);
			if (isNaN(jumpSpd)) console.log("!!! platformSearch - jumpSpd was", jumpSpd);
			if (isNaN(fallAccel)) console.log("!!! platformSearch - fallAccel was", fallAccel);
			else if (fallAccel <= 0) console.log("!!! fallAccel", fallAccel, "<= 0. this will have unexpected results");
			if (isNaN(terminalV)) console.log("!!! platformSearch - terminalV was", terminalV);
		}

		this.beginSearch(originPlatform);
	};

	PlatformSearch.prototype.getDeltaYFromVyFinal = function(vyi, vyf) {
		if (LOGGING && vyf > this._terminalV) {
			console.log("!!! platformSearch - end velocity", vyf, 
				"greater than terminal velocity", this._terminalV, 
				" - result will be inaccurate");
		}
		var dt = (vyf - vyi) / this._fallAccel;
		return (vyi + vyf) / 2 * dt;
	};

	PlatformSearch.prototype.getVyFinalFromDeltaY = function(vyi, dy) {
		// if we hit terminalv before reaching dy,
		// then deltav is really just delta to terminalv
		if (vyi === this._terminalV) {
			return vyi;
		}
		var dyTerminal = this.getDeltaYFromVyFinal(vyi, this._terminalV);
		if (dyTerminal < dy) {
			return this._terminalV;
		}

		// there are always two possibilities for vyf
		// we will take the one closest to vyi, after vyi
		var absVyf = Math.sqrt(vyi * vyi + 2 * this._fallAccel * dy);
		var vyf = vyi < -absVyf ? -absVyf : absVyf;
		vyf = Math.min(this._terminalV, vyf);

		return vyf;
	};

	PlatformSearch.prototype.getAbsDeltaXFromDeltaY = function(vyi, dy) {
		if (vyi >= this._terminalV) {
			return dy / this._terminalV * this._runSpd;
		}

		var dyTerminal = this.getDeltaYFromVyFinal(vyi, this._terminalV);
		if (dyTerminal < dy) {
			var dxPreTerm = this.getAbsDeltaXFromDeltaY(vyi, dyTerminal);
			var dxPostTerm = this.getAbsDeltaXFromDeltaY(this._terminalV, (dy - dyTerminal));
			return dxPreTerm + dxPostTerm;
		}

		// there are two potential solutions for time.
		// we will use the smallest positive time
		var dtdeterminant = Math.sqrt(vyi * vyi + 2 * this._fallAccel * dy);
		var dt = (-vyi - dtdeterminant) / this._fallAccel;
		if (dt < 0) dt = (-vyi + dtdeterminant) / this._fallAccel;

		return dt * this._runSpd;	
	};

	PlatformSearch.prototype.beginSearch = function(originPlatform) {
		this._originPlatform = originPlatform;

		this._reachableAreas = {};
		this._currentAreas = [];

		var stubArea = {
			parent: undefined,

			vyi: Math.max(-this._jumpSpd, -this._terminalV),
			vyo: Math.max(-this._jumpSpd, -this._terminalV),

			pxli: originPlatform.tx0 * this._platformMap.tilesize,
			pxri: originPlatform.tx1 * this._platformMap.tilesize,

			pxlo: originPlatform.tx0 * this._platformMap.tilesize,
			pxro: originPlatform.tx1 * this._platformMap.tilesize,
			
			pyi: originPlatform.ty * this._platformMap.tilesize,
			pyo: originPlatform.ty * this._platformMap.tilesize,
		};

		this._currentAreas.push(stubArea);
	};

	PlatformSearch.prototype.getInitialChild = function(parentArea) {
		return {
			vyi: parentArea.vyo,
			pxli: parentArea.pxlo,
			pxri: parentArea.pxro,
			pyi: parentArea.pyo,
			parent: parentArea
		};
	};

	PlatformSearch.prototype.getTentativeAltitude = function(childArea) {

		var pyo;
		var vyo;

		var pyiBottom = childArea.pyi;
		var pyiTop = childArea.pyi - this._sizeY;

		// going up
		if (childArea.vyi < 0) {
			var tyoTop = this._platformMap.posToTileY(pyiTop);
			// for going up only - if the top of our body is exactly aligned
			// with the top of this tile row, we still want to end on the row above it
			if (this._platformMap.tileToPosY(tyoTop) === pyiTop) tyoTop--;
			
			var pyoTop = this._platformMap.tileToPosY(tyoTop);
			var dyTarget = pyoTop - pyiTop;
			var dyTerminal = this.getDeltaYFromVyFinal(childArea.vyi, 0);

			// if the zenith of our trajectory happens before we reach the next row,
			// we cut off the area at the zenith
			var zenithBeforeNextTile = -dyTerminal < -dyTarget;
			if (zenithBeforeNextTile) {
				pyoTop = pyiTop + dyTerminal;
				vyo = 0;
			} else {
				vyo = this.getVyFinalFromDeltaY(childArea.vyi, dyTarget);
			}
			pyo = pyoTop + this._sizeY;
		}
		// going down
		else {
			var tyoBottom = this._platformMap.posToTileY(pyiBottom);
			var pyoBottom = this._platformMap.tileToPosY(tyoBottom + 1);
			vyo = this.getVyFinalFromDeltaY(childArea.vyi, pyoBottom - pyiBottom);
			console.log("pyoBottom", pyoBottom, "pyiBottom", pyiBottom);
			pyo = pyoBottom;
		}
		childArea.vyo = vyo;
		childArea.pyo = pyo;
	};

	PlatformSearch.prototype.getTentativeSpread = function(childArea) {
		var deltaX = this.getAbsDeltaXFromDeltaY(childArea.vyi, childArea.pyo - childArea.pyi);
		childArea.pxlo = childArea.pxli - deltaX;
		childArea.pxro = childArea.pxri + deltaX;
	};

	PlatformSearch.prototype.clampSpread = function(childArea) {
		var platformMap = this._platformMap;

		var ty;
		if (childArea.vyi < 0) {
			ty = platformMap.posToTileY(childArea.pyo);
		} else {
			ty = platformMap.posToTileY(childArea.pyi);
		}
		
		var tli = platformMap.posToTileX(childArea.pxli);
		var tlo = platformMap.posToTileX(childArea.pxlo);

		var tx;
		for (tx = tli-1; tx > tlo; tx--) {
			if (platformMap.tileAt(tx, ty) & RIGHT) {
				childArea.pxlo = platformMap.tileToPosX(tx+1);
				break;
			}
		}
		
		var tri = platformMap.posToTileCeilX(childArea.pxri);
		var tro = platformMap.posToTileCeilX(childArea.pxro);

		for (tx = tri; tx < tro; tx++) {
			console.log("tile", platformMap.tileAt(tx, ty));
			if (platformMap.tileAt(tx, ty) & LEFT) {
				childArea.pxro = platformMap.tileToPosX(tx);
				break;
			}
		}
		console.log(tri, tro, ty);
	};

	PlatformSearch.prototype.step = function() {

		console.log("STEP *******************************");
		var parentArea = this._currentAreas.pop();

		var childArea = this.getInitialChild(parentArea);
		this.getTentativeAltitude(childArea);
		this.getTentativeSpread(childArea);
		this.clampSpread(childArea);

		console.log("vyi", childArea.vyi, "vyo", childArea.vyo);
		console.log("pyi", childArea.pyi, "pyo", childArea.pyo);
		console.log("pxli", childArea.pxli, "pxlo", childArea.pxlo);
		console.log("pxri", childArea.pxri, "pxro", childArea.pxro);

		this._currentAreas.push(childArea);
	};

	PlatformSearch.prototype.render = function(ctx, bbox, trueAreasOff, detectionAreasOff) {
		if (trueAreasOff && detectionAreasOff) return;

		ctx.save();
		ctx.translate(bbox.x0, bbox.y0);

		var globalAlpha = ctx.globalAlpha;
		for (var a = 0; a < this._currentAreas.length; a++) {
			var currentArea = this._currentAreas[a];
			for (var i = 0; i < 3; i++) {
				this.renderArea(ctx, currentArea, trueAreasOff, detectionAreasOff);
				ctx.globalAlpha *= 0.6;
				currentArea = currentArea.parent;
				if (!currentArea) break;
			}
			ctx.globalAlpha = globalAlpha;
		}
		ctx.restore();
	};

	PlatformSearch.prototype.renderArea = function(ctx, area, trueAreasOff, detectionAreasOff) {
		if (!trueAreasOff) {
			ctx.fillStyle = "rgba(100, 255, 0, 0.3)";
			ctx.strokeStyle = "rgba(100, 255, 0, 1)";
			this.renderAreaLocal(ctx, area);
		}
		if (!detectionAreasOff) {
			ctx.fillStyle = "rgba(200, 200, 0, 0.3)";
			ctx.strokeStyle = "rgba(200, 200, 0, 1)";
			if (area.vyi < 0) ctx.translate(0, -this._sizeY);
			this.renderAreaLocal(ctx, area);
			if (area.vyi < 0) ctx.translate(0, this._sizeY);
		}
	};

	PlatformSearch.prototype.renderAreaLocal = function(ctx, area) {
		var tilesize = this._platformMap.tilesize;

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
	};

	return PlatformSearch;

}();