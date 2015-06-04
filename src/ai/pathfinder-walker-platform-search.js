if (!gm.Pathfinder) gm.Pathfinder = {};
if (!gm.Pathfinder.Walker) gm.Pathfinder.Walker = {};

gm.Pathfinder.Walker.PlatformSearch = function() {

	var DOWN = gm.Constants.Dir.DOWN;
	var UP = gm.Constants.Dir.UP;
	var LEFT = gm.Constants.Dir.LEFT;
	var RIGHT = gm.Constants.Dir.RIGHT;

	var PlatformSearch = function(
		platformMap, combinedMap, sizeX, sizeY, runSpd, jumpSpd, fallAccel, terminalV, originPlatform, params) {

		this._platformMap = platformMap;
		this._combinedMap = combinedMap;
		this._sizeX = sizeX;
		this._sizeY = sizeY;

		this._kinematics = new gm.Pathfinder.Walker.Kinematics(runSpd, jumpSpd, fallAccel, terminalV);

		this._renderSpecifics = false;
		if (params) this.setParams(params);

		console.log("sizeX", sizeX, "sizeY", sizeY);
		console.log("runSpd", runSpd, "jumpSpd", jumpSpd, "fallAccel", fallAccel, "terminalV", terminalV);

		if (LOGGING) {
			if (!platformMap) console.log("!!! platformSearch - no platform map");
			if (!combinedMap) console.log("!!! platformSearch - no combined map");
			if (isNaN(sizeX) || isNaN(sizeY)) console.log("!!! platformSearch - body dimensions were", sizeX, ",", sizeY);
			if (isNaN(runSpd)) console.log("!!! platformSearch - runSpd was", runSpd);
			if (isNaN(jumpSpd)) console.log("!!! platformSearch - jumpSpd was", jumpSpd);
			if (isNaN(fallAccel)) console.log("!!! platformSearch - fallAccel was", fallAccel);
			else if (fallAccel <= 0) console.log("!!! fallAccel", fallAccel, "<= 0. this will have unexpected results");
			if (isNaN(terminalV)) console.log("!!! platformSearch - terminalV was", terminalV);
		}

		this.beginSearch(originPlatform);
	};

	PlatformSearch.prototype.setParams = function(params) {
		if (params.renderSpecifics !== undefined) this._renderSpecifics = params.renderSpecifics;
	};

	PlatformSearch.prototype.beginSearch = function(originPlatform) {
		this._originPlatform = originPlatform;

		this._reachableAreas = {};
		this._currentAreas = [];

		var stubArea = {
			parent: undefined,

			vyi: Math.max(-this._kinematics._jumpSpd, -this._kinematics._terminalV),
			vyo: Math.max(-this._kinematics._jumpSpd, -this._kinematics._terminalV),

			pxli: originPlatform.tx0 * this._platformMap.tilesize,
			pxri: originPlatform.tx1 * this._platformMap.tilesize,

			pxlo: originPlatform.tx0 * this._platformMap.tilesize,
			pxro: originPlatform.tx1 * this._platformMap.tilesize,
			
			pyi: originPlatform.ty * this._platformMap.tilesize,
			pyo: originPlatform.ty * this._platformMap.tilesize,
		};
		if (this._renderSpecifics) stubArea.debug = {};

		this._currentAreas.push(stubArea);
	};

	PlatformSearch.prototype.getInitialChild = function(parentArea, pxli, pxri) {
		var childArea = {
			vyi: parentArea.vyo,
			pxli: pxli !== undefined ? pxli : parentArea.pxlo,
			pxri: pxri !== undefined ? pxri : parentArea.pxro,
			pyi: parentArea.pyo,
			parent: parentArea
		};
		if (this._renderSpecifics) childArea.debug = {};
		return childArea;
	};

	PlatformSearch.prototype.getTentativeAltitude = function(childArea) {

		var tilesize = this._platformMap.tilesize;
		var kinematics = this._kinematics;

		var pyo;
		var vyo;

		var pyiBottom = childArea.pyi;
		var pyiTop = childArea.pyi - this._sizeY;

		var bodyExtend = this._sizeY % tilesize;

		// going up
		if (childArea.vyi < 0) {
			var tyTop = this._platformMap.posToTileY(pyiTop);
			// for going up only - if the top of our body is exactly aligned
			// with the top of this tile row, we still want to end on the row above it
			if (this._platformMap.tileToPosY(tyTop) === pyiTop) tyTop--;

			var ptyoTop = this._platformMap.tileToPosY(tyTop);
			
			var pyoTop = ptyoTop + Math.max(bodyExtend, tilesize - bodyExtend);
			if (pyiTop <= pyoTop) {
				pyoTop = ptyoTop + Math.min(bodyExtend, tilesize - bodyExtend);
				if (pyiTop <= pyoTop) {
					pyoTop = ptyoTop;
				}
			}
			var dyTarget = pyoTop - pyiTop;
			var dyTerminal = kinematics.getDeltaYFromVyFinal(childArea.vyi, 0);

			// if the zenith of our trajectory happens before we reach the next row,
			// we cut off the area at the zenith
			var zenithBeforeNextTile = -dyTerminal < -dyTarget;
			if (zenithBeforeNextTile) {
				pyoTop = pyiTop + dyTerminal;
				vyo = 0;
			} else {
				vyo = kinematics.getVyFinalFromDeltaY(childArea.vyi, dyTarget);
			}
			pyo = pyoTop + this._sizeY;
		}
		// going down
		else {
			var tyoBottom = this._platformMap.posToTileY(pyiBottom);
			var ptyoBottom = this._platformMap.tileToPosY(tyoBottom);

			var pyoBottom = ptyoBottom + Math.min(bodyExtend, tilesize - bodyExtend);
			if (pyiBottom >= pyoBottom) {
				pyoBottom = ptyoBottom + Math.max(bodyExtend, tilesize - bodyExtend);
				if (pyiBottom >= pyoBottom) {
					pyoBottom = this._platformMap.tileToPosY(tyoBottom+1);
				}
			}
			vyo = kinematics.getVyFinalFromDeltaY(childArea.vyi, pyoBottom - pyiBottom);
			pyo = pyoBottom;
		}
		childArea.vyo = vyo;
		childArea.pyo = pyo;
	};

	PlatformSearch.prototype.getTentativeSpread = function(childArea) {
		var deltaX = this._kinematics.getAbsDeltaXFromDeltaY(childArea.vyi, childArea.pyo - childArea.pyi);
		childArea.pxlo = childArea.pxli - deltaX;
		childArea.pxro = childArea.pxri + deltaX;
	};

	PlatformSearch.prototype.clampSpread = function(childArea) {
		var platformMap = this._platformMap;
		
		var txli = platformMap.posToTileX(childArea.pxli)-1;
		var txlo = platformMap.posToTileX(childArea.pxlo)-1;
		var txri = platformMap.posToTileCeilX(childArea.pxri);
		var txro = platformMap.posToTileCeilX(childArea.pxro);

		if (this._renderSpecifics) {
			childArea.debug.xpts = {};
		}

		var tx;
		for (tx = txli; tx > txlo; tx--) {
			if (this.clampSpreadColumn(childArea, tx, LEFT)) break;
		}

		for (tx = txri; tx < txro; tx++) {
			if (this.clampSpreadColumn(childArea, tx, RIGHT)) break;
		}
	};

	PlatformSearch.prototype.clampSpreadColumn = function(childArea, tx, dir) {
		var platformMap = this._platformMap;
		var combinedMap = this._combinedMap;

		var px = platformMap.tileToPosX(dir === LEFT ? tx+1 : tx);
		var dx = px - (dir === LEFT ? childArea.pxli : childArea.pxri);
		var dy = this._kinematics.getDeltaYFromDeltaX(childArea.vyi, dx);

		if (this._renderSpecifics) {
			childArea.debug.xpts[platformMap.tileToPosX(tx)] = childArea.pyi + dy;
		}

		var tyBottom = platformMap.posToTileCeilY(childArea.pyi + dy);
		var tyTop = platformMap.posToTileY(childArea.pyi + dy - this._sizeY);

		for (var ty = tyTop; ty < tyBottom; ty++) {
			if (combinedMap.tileAt(tx, ty) & dir) {
				if (dir === LEFT) childArea.pxlo = platformMap.tileToPosX(tx+1);
				else childArea.pxro = platformMap.tileToPosX(tx);
				return true;
			}
		}
	};

	PlatformSearch.prototype.getSplitSeeds = function(childArea) {
		var platformMap = this._platformMap;
		var combinedMap = this._combinedMap;
		var ltx = platformMap.posToTileX(childArea.pxli);
		var rtx = platformMap.posToTileCeilX(childArea.pxri);
		var vyi = childArea.vyi;
		var ty, fty;
		if (vyi < 0) {
			fty = platformMap.posToTileY(childArea.pyi);
			ty = platformMap.posToTileY(childArea.pyo);
			if (fty === ty) return;
		} else {
			fty = platformMap.posToTileCeilY(childArea.pyo);
			ty = platformMap.posToTileCeilY(childArea.pyi);
			if (fty === ty) return;
		}

		var tilesize = platformMap.tilesize;

		var txStart = -1;
		var splitSeeds = [];

		for (var tx = ltx; tx < rtx; tx++) {
			var tile = combinedMap.tileAt(tx, ty);
			if ((tile & UP) && vyi < 0) {
				if (txStart >= 0) {
					splitSeeds.push([txStart * tilesize, tx * tilesize]);
					txStart = -1;
				}
			} else if ((tile & DOWN) && vyi >= 0) {
				if (txStart >= 0) {
					splitSeeds.push([txStart * tilesize, tx * tilesize]);
					// add platform to reachable.
					txStart = -1;
				}
			} else {
				if (tile & LEFT) {
					if (txStart >= 0) {
						splitSeeds.push([txStart * tilesize, tx * tilesize]);
					}
				}
				if (txStart < 0) txStart = tx;
				if (tile & RIGHT) {
					splitSeeds.push([txStart * tilesize, (tx+1) * tilesize]);
					txStart = -1;
				}	
			}
		}

		console.log(txStart);

		if (txStart >= 0) {
			if (txStart === ltx) return;
			splitSeeds.push([txStart * tilesize, tx * tilesize]);
		}
		return splitSeeds;
	};

	PlatformSearch.prototype.step = function() {
		console.log("STEP *******************************");
		var parentArea = this._currentAreas.pop();
		this.addChildren(parentArea);
	};

	PlatformSearch.prototype.addChildren = function(parentArea, pxli, pxri) {
		var childArea = this.getInitialChild(parentArea, pxli, pxri);
		this.getTentativeAltitude(childArea);
		this.getTentativeSpread(childArea);
		this.clampSpread(childArea);

		console.log("vyi", childArea.vyi, "vyo", childArea.vyo);
		console.log("pyi", childArea.pyi, "pyo", childArea.pyo);
		console.log("pxli", childArea.pxli, "pxlo", childArea.pxlo);
		console.log("pxri", childArea.pxri, "pxro", childArea.pxro);

		var splitSeeds = this.getSplitSeeds(childArea);

		if (splitSeeds !== undefined) {
			console.log(splitSeeds);
			for (var s = 0; s < splitSeeds.length; s++) {
				var seed = splitSeeds[s];
				this.addChildren(parentArea, seed[0], seed[1]);
			}
		} else {
			this._currentAreas.push(childArea);
		}
	};

	PlatformSearch.prototype.render = function(ctx, bbox, trueAreasOff, detectionAreasOff) {
		if (trueAreasOff && detectionAreasOff) return;

		ctx.save();
		ctx.translate(bbox.x0, bbox.y0);

		var globalAlpha = ctx.globalAlpha;
		for (var a = 0; a < this._currentAreas.length; a++) {
			var currentArea = this._currentAreas[a];
			for (var i = 0; i < 3; i++) {
				if (!trueAreasOff) {
					this.renderArea(ctx, currentArea);
				}
				if (!detectionAreasOff) {
					this.renderArea(ctx, currentArea, true);
					if (this._renderSpecifics) {
						this.renderAreaSpecifics(ctx, currentArea);
					}
				}
				ctx.globalAlpha *= 0.6;
				currentArea = currentArea.parent;
				if (!currentArea) break;
			}
			ctx.globalAlpha = globalAlpha;
		}
		ctx.restore();
	};

	PlatformSearch.prototype.renderArea = function(ctx, area, isDetectionArea) {
		ctx.save();

		if (isDetectionArea) {
			ctx.fillStyle = "rgba(200, 200, 0, 0.3)";
			ctx.strokeStyle = "rgba(200, 200, 0, 1)";
			if (area.vyi < 0) ctx.translate(0, -this._sizeY);
		} else {
			ctx.fillStyle = "rgba(100, 255, 0, 0.3)";
			ctx.strokeStyle = "rgba(100, 255, 0, 1)";
		}

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

		ctx.restore();
	};

	PlatformSearch.prototype.renderAreaSpecifics = function(ctx, area) {
		ctx.save();
		ctx.fillStyle = "rgba(255, 100, 100, 0.5)";
		var xpts = area.debug.xpts;
		if (xpts) {
			var tilesize = this._platformMap.tilesize;
		
			for (var px in xpts) {
				var pyBottom = xpts[px];
				ctx.fillRect(px, pyBottom - this._sizeY, tilesize, this._sizeY);
			}
		}
		ctx.restore();
	};

	return PlatformSearch;

}();