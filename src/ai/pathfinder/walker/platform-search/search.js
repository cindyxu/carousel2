if (!gm.Pathfinder) gm.Pathfinder = {};
if (!gm.Pathfinder.Walker) gm.Pathfinder.Walker = {};

gm.Pathfinder.Walker.PlatformSearch = function() {

	var DOWN = gm.Constants.Dir.DOWN;
	var UP = gm.Constants.Dir.UP;
	var LEFT = gm.Constants.Dir.LEFT;
	var RIGHT = gm.Constants.Dir.RIGHT;

	var PlatformSearch = function(
		platformMap, combinedMap, sizeX, sizeY, runSpd, jumpSpd, fallAccel, terminalV, originPlatform) {

		this._platformMap = platformMap;
		this._combinedMap = combinedMap;
		this._sizeX = sizeX;
		this._sizeY = sizeY;

		this._kinematics = new gm.Pathfinder.Walker.Kinematics(runSpd, jumpSpd, fallAccel, terminalV);

		this._renderer = new gm.Pathfinder.Walker.PlatformSearch.Renderer(this);

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

		this._beginSearch(originPlatform);
	};

	PlatformSearch.prototype._beginSearch = function(originPlatform) {
		this._originPlatform = originPlatform;

		this._reachablePlatforms = [];
		this._currentAreas = [];

		var py = this._platformMap.tileToPosY(originPlatform.ty);
		pxlo = this._platformMap.tileToPosX(originPlatform.tx0) - this._sizeX;
		pxro = this._platformMap.tileToPosX(originPlatform.tx1) + this._sizeX;

		if (pxro <= pxlo) return;

		var stubArea = {
			vyo: Math.max(-this._kinematics._jumpSpd, -this._kinematics._terminalV),

			pxlo: pxlo,
			pxro: pxro,
			
			pyo: py,

			parent: undefined,
		};

		this._currentAreas.push(stubArea);
	};

	PlatformSearch.prototype.step = function() {
		console.log("STEP *******************************");
		var parentArea = this._currentAreas.pop();
		if (parentArea) {
			var childArea = this._getInitialSeed(parentArea);
			this._addChildrenFromSeed(childArea);
		}
	};

	PlatformSearch.prototype._getInitialSeed = function(parentArea, pxli, pxri, vyi) {
		var childArea = {
			vyi: vyi !== undefined ? vyi : parentArea.vyo,
			pxli: pxli !== undefined ? pxli : parentArea.pxlo,
			pxri: pxri !== undefined ? pxri : parentArea.pxro,
			pyi: parentArea.pyo,
			parent: parentArea
		};
		return childArea;
	};

	PlatformSearch.prototype._addChildrenFromSeed = function(childArea) {
		if (childArea.pxri - childArea.pxli < this._sizeX) return;

		this._getTentativeAltitude(childArea);
		this._getTentativeSpread(childArea);
		this._clampSpread(childArea);

		console.log("vyi", childArea.vyi, "vyo", childArea.vyo);
		console.log("pyi", childArea.pyi, "pyo", childArea.pyo);
		console.log("pxli", childArea.pxli, "pxlo", childArea.pxlo);
		console.log("pxri", childArea.pxri, "pxro", childArea.pxro);

		var splitSeeds = this._getSplitSeeds(childArea);

		if (splitSeeds !== undefined) {
			for (var s = 0; s < splitSeeds.length; s++) {
				var seed = splitSeeds[s];
				this._addChildrenFromSeed(seed);
			}
		} else {
			this._currentAreas.push(childArea);
		}
	};

	PlatformSearch.prototype._cloneArea = function(area) {
		return {
			vyi: area.vyi,
			vyo: area.vyo,

			pxli: area.pxli,
			pxlo: area.pxlo,

			pxri: area.pxri,
			pxro: area.pxro,

			pyi: area.pyi,
			pyo: area.pyo,

			parent: area.parent
		};
	};

	PlatformSearch.prototype._getTentativeAltitude = function(childArea) {

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

	PlatformSearch.prototype._getTentativeSpread = function(childArea) {
		var deltaX = this._kinematics.getAbsDeltaXFromDeltaY(childArea.vyi, childArea.pyo - childArea.pyi);
		childArea.pxlo = childArea.pxli - deltaX;
		childArea.pxro = childArea.pxri + deltaX;
	};

	PlatformSearch.prototype._clampSpread = function(childArea) {
		var platformMap = this._platformMap;
		
		var txli = platformMap.posToTileX(childArea.pxli)-1;
		var txlo = platformMap.posToTileX(childArea.pxlo)-1;
		var txri = platformMap.posToTileCeilX(childArea.pxri);
		var txro = platformMap.posToTileCeilX(childArea.pxro);

		var tx;
		for (tx = txli; tx > txlo; tx--) {
			if (this._clampSpreadColumn(childArea, tx, LEFT)) break;
		}

		for (tx = txri; tx < txro; tx++) {
			if (this._clampSpreadColumn(childArea, tx, RIGHT)) break;
		}
	};

	PlatformSearch.prototype._clampSpreadColumn = function(childArea, tx, dir) {
		var platformMap = this._platformMap;
		var combinedMap = this._combinedMap;

		var px = platformMap.tileToPosX(dir === LEFT ? tx+1 : tx);
		var dx = px - (dir === LEFT ? childArea.pxli : childArea.pxri);
		var dy = this._kinematics.getDeltaYFromDeltaX(childArea.vyi, dx);

		var tyTop, tyBottom;
		if (childArea.vyi < 0) {
			tyTop = platformMap.posToTileCeilY(childArea.pyi + dy - this._sizeY) - 1;
			tyBottom = platformMap.posToTileCeilY(childArea.pyi + dy);
		} else {
			tyTop = platformMap.posToTileY(childArea.pyi + dy - this._sizeY);
			tyBottom = platformMap.posToTileY(childArea.pyi + dy) + 1;
		}

		for (var ty = tyTop; ty < tyBottom; ty++) {
			if (combinedMap.tileAt(tx, ty) & dir) {
				if (dir === LEFT) childArea.pxlo = platformMap.tileToPosX(tx+1);
				else childArea.pxro = platformMap.tileToPosX(tx);
				return true;
			}
		}
	};

	PlatformSearch.prototype._getSplitSeeds = function(childArea) {
		var platformMap = this._platformMap;
		var combinedMap = this._combinedMap;

		var ltx = platformMap.posToTileX(childArea.pxli);
		var rtx = platformMap.posToTileCeilX(childArea.pxri);
		var vyi = childArea.vyi;
		var ty, fty;
		
		if (vyi < 0) {
			fty = platformMap.posToTileY(childArea.pyi - this._sizeY);
			ty = platformMap.posToTileY(childArea.pyo - this._sizeY);
			if (fty === ty) return;
		} else {
			fty = platformMap.posToTileCeilY(childArea.pyo);
			ty = platformMap.posToTileCeilY(childArea.pyi);
			if (fty === ty) return;
		}

		var tilesize = platformMap.tilesize;

		var txStart = -1;
		var splitSeeds = [];

		for (var tx = ltx; tx < rtx; ) {
			var tile = combinedMap.tileAt(tx, ty);
			if ((tile & DOWN) && vyi < 0) {
				if (txStart >= 0) {
					splitSeeds.push(this._getInitialSeed(
						childArea.parent, txStart * tilesize, tx * tilesize));
				}
				// if we've collided with something above,
				// then we bounce off with velocity = 0.
				var utxStart = tx;
				while(true) {
					tile = combinedMap.tileAt(tx, ty);
					if ((tile & DOWN) && tx < rtx) tx++;
					else {
						splitSeeds.push(this._getInitialSeed(
							childArea.parent, utxStart * tilesize, tx * tilesize, 0));
						break;
					}
				}
				txStart = -1;

			} else if ((tile & UP) && vyi >= 0) {
				if (txStart >= 0) {
					splitSeeds.push(this._getInitialSeed(
						childArea.parent, txStart * tilesize, tx * tilesize));
				}

				var platform = this._platformMap.tileAt(tx, ty);
				if (platform) {
					this._addReachablePlatform(childArea.parent, platform);
					tx = platform.tx1;		
				} else tx++;

				txStart = -1;
				
			} else {
				if (tile & LEFT) {
					if (txStart >= 0) {
						splitSeeds.push(this._getInitialSeed(
						childArea.parent, txStart * tilesize, tx * tilesize));
					}
				}
				if (txStart < 0) txStart = tx;
				if (tile & RIGHT) {
					splitSeeds.push(this._getInitialSeed(
						childArea.parent, txStart * tilesize, (tx+1) * tilesize));
					txStart = -1;
				}	
				tx++;
			}
		}

		if (txStart >= 0) {
			// we haven't changed anything. child is fine as is
			if (txStart === ltx) return;
			splitSeeds.push(this._getInitialSeed(
						childArea.parent, txStart * tilesize, rtx * tilesize));
		}

		// clamp leftmost and rightmost seeds to original bounds if necessary
		if (splitSeeds.length > 0) {
			splitSeeds[0].pxli = Math.max(splitSeeds[0].pxli, childArea.pxli);
			var e = splitSeeds.length-1;
			splitSeeds[e].pxri = Math.min(splitSeeds[e].pxri, childArea.pxri);
		}

		return splitSeeds;
	};

	PlatformSearch.prototype._addReachablePlatform = function(area, platform) {
		var platformMap = this._platformMap;
		var endArea = this._getInitialSeed(area,
			Math.max(platformMap.tileToPosX(platform.tx0), area.pxlo),
			Math.min(platformMap.tileToPosX(platform.tx1), area.pxro));
		this._clipHierarchy(endArea);
		endArea.platform = platform;
		this._reachablePlatforms.push(endArea);
	};

	PlatformSearch.prototype._clipHierarchy = function(childArea) {
		var parentArea = childArea.parent;
		if (!parentArea) return;

		var dx = this._kinematics.getAbsDeltaXFromDeltaY(parentArea.pyo - parentArea.pyi);
		if (parentArea.pxlo < childArea.pxli || parentArea.pxro > childArea.pxri) {

			var cloneParent = this._cloneArea(parentArea);
			cloneParent.pxlo = Math.max(cloneParent.pxlo, childArea.pxli);
			cloneParent.pxli = Math.max(cloneParent.pxli, childArea.pxli - dx);
			cloneParent.pxro = Math.min(cloneParent.pxro, childArea.pxri);
			cloneParent.pxri = Math.min(cloneParent.pxri, childArea.pxri + dx);

			childArea.parent = cloneParent;
			this._clipHierarchy(cloneParent);
		}
	};

	PlatformSearch.prototype.render = function(ctx, bbox) {
		this._renderer.render(ctx, bbox);
	};

	return PlatformSearch;

}();