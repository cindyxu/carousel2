gm.Ai.PlatformScan = function() {

	var DOWN = gm.Constants.Dir.DOWN;
	var UP = gm.Constants.Dir.UP;
	var LEFT = gm.Constants.Dir.LEFT;
	var RIGHT = gm.Constants.Dir.RIGHT;

	var PlatformArea = gm.Ai.PlatformArea;
	var PlatformPatch = gm.Ai.PlatformPatch;

	var PlatformScan = function(cmap, sizeX, sizeY, kinematics) {

		this._cmap = cmap;

		this._sizeX = sizeX;
		this._sizeY = sizeY;
		this._kinematics = kinematics;
		this._renderer = new gm.Ai.PlatformScan.Renderer(this);

		if (LOGGING && !cmap) console.log("!!! platformScan - no combined map");
	};

	PlatformScan.prototype.beginScan = function(jumped, pxli, pxri, pyi) {

		if (LOGGING) console.log("platformscan - begin search: pxli", pxli, "pxri:", pxri, "pyi:", pyi);
		this._reachablePatches = [];
		this._currentAreas = [];

		if (pxri <= pxli) return;

		var vyi = jumped ? -this._kinematics._jumpSpd : 0;
		var beginArea = PlatformArea.fromPlatform(vyi, pxli, pxri, pyi);

		this._currentAreas.push(beginArea);
	};

	PlatformScan.prototype.step = function() {
		if (LOGGING) console.log("STEP *******************************");
		var parentArea = this._currentAreas.pop();
		if (parentArea) {
			var childArea = PlatformArea.fromArea(parentArea);
			this._addChildrenFromSeed(childArea);
			return true;
		}
		return false;
	};

	PlatformScan.prototype._addChildrenFromSeed = function(childArea) {
		if (childArea._pxri - childArea._pxli < this._sizeX) return;
		if (!this._cmap.inRangeY(this._cmap.posToTileY(childArea._pyi))) return;

		this._getAltitude(childArea);
		this._getTentativeSpread(childArea);
		this._clampSpread(childArea);

		if (LOGGING) {
			console.log("vyi", childArea._vyi, "vyo", childArea._vyo);
			console.log("pyi", childArea._pyi, "pyo", childArea._pyo);
			console.log("pxli", childArea._pxli, "pxlo", childArea._pxlo);
			console.log("pxri", childArea._pxri, "pxro", childArea._pxro);
		}

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

	PlatformScan.prototype._getAltitude = function(childArea) {

		var tilesize = this._cmap.tilesize;
		var kinematics = this._kinematics;

		var pyo;
		var vyo;

		var pyiBottom = childArea._pyi;
		var pyiTop = childArea._pyi - this._sizeY;

		var bodyExtend = this._sizeY % tilesize;

		// going up
		if (childArea._vyi < 0) {
			var tyTop = this._cmap.posToTileY(pyiTop);
			// for going up only - if the top of our body is exactly aligned
			// with the top of this tile row, we still want to end on the row above it
			if (this._cmap.tileToPosY(tyTop) === pyiTop) tyTop--;

			var ptyoTop = this._cmap.tileToPosY(tyTop);
			
			var pyoTop = ptyoTop + Math.max(bodyExtend, tilesize - bodyExtend);
			if (pyiTop <= pyoTop) {
				pyoTop = ptyoTop + Math.min(bodyExtend, tilesize - bodyExtend);
				if (pyiTop <= pyoTop) {
					pyoTop = ptyoTop;
				}
			}
			var dyTarget = pyoTop - pyiTop;
			var dyTerminal = kinematics.getDeltaYFromVyFinal(childArea._vyi, 0);

			// if the zenith of our trajectory happens before we reach the next row,
			// we cut off the area at the zenith
			var zenithBeforeNextTile = -dyTerminal < -dyTarget;
			if (zenithBeforeNextTile) {
				pyoTop = pyiTop + dyTerminal;
				vyo = 0;
			} else {
				vyo = kinematics.getVyFinalFromDeltaY(childArea._vyi, dyTarget);
			}
			pyo = pyoTop + this._sizeY;
		}
		// going down
		else {
			var tyoBottom = this._cmap.posToTileY(pyiBottom);
			var ptyoBottom = this._cmap.tileToPosY(tyoBottom);

			var pyoBottom = ptyoBottom + Math.min(bodyExtend, tilesize - bodyExtend);
			if (pyiBottom >= pyoBottom) {
				pyoBottom = ptyoBottom + Math.max(bodyExtend, tilesize - bodyExtend);
				if (pyiBottom >= pyoBottom) {
					pyoBottom = this._cmap.tileToPosY(tyoBottom+1);
				}
			}
			vyo = kinematics.getVyFinalFromDeltaY(childArea._vyi, pyoBottom - pyiBottom);
			pyo = pyoBottom;
		}
		childArea.setAltitude(vyo, pyo);
	};

	PlatformScan.prototype._getTentativeSpread = function(childArea) {
		var deltaX = this._kinematics.getAbsDeltaXFromDeltaY(childArea._vyi, childArea._pyo - childArea._pyi);
		childArea.setSpread(childArea._pxli - deltaX, childArea._pxri + deltaX);
	};

	// clamps pxlo and pxro on whether there are any blocking RIGHT tiles to the left
	// or LEFT tiles to the right.
	PlatformScan.prototype._clampSpread = function(childArea) {
		var cmap = this._cmap;
		
		var txli = cmap.posToTileX(childArea._pxli)-1;
		var txlo = cmap.posToTileX(childArea._pxlo)-1;
		var txri = cmap.posToTileCeilX(childArea._pxri);
		var txro = cmap.posToTileCeilX(childArea._pxro);

		var tx;
		for (tx = txli; tx > txlo; tx--) {
			if (this._clampSpreadColumn(childArea, tx, LEFT)) break;
		}

		for (tx = txri; tx < txro; tx++) {
			if (this._clampSpreadColumn(childArea, tx, RIGHT)) break;
		}
	};

	PlatformScan.prototype._clampSpreadColumn = function(childArea, tx, dir) {
		var cmap = this._cmap;

		var px = cmap.tileToPosX(dir === LEFT ? tx+1 : tx);
		var dx = px - (dir === LEFT ? childArea._pxli : childArea._pxri);
		var dy = this._kinematics.getDeltaYFromDeltaX(childArea._vyi, dx);

		var tyTop, tyBottom;
		if (childArea._vyi < 0) {
			tyTop = cmap.posToTileCeilY(childArea._pyi + dy - this._sizeY) - 1;
			tyBottom = cmap.posToTileCeilY(childArea._pyi + dy);
		} else {
			tyTop = cmap.posToTileY(childArea._pyi + dy - this._sizeY);
			tyBottom = cmap.posToTileY(childArea._pyi + dy) + 1;
		}

		var pxlo, pxro;
		for (var ty = tyTop; ty < tyBottom; ty++) {
			if (cmap.tileAt(tx, ty) & dir) {
				pxlo = dir === LEFT ? cmap.tileToPosX(tx+1) : childArea._pxlo;
				pxro = dir === RIGHT ? cmap.tileToPosX(tx) : childArea._pxro;
				childArea.setSpread(pxlo, pxro);
				return true;
			}
		}
	};

	// starting from (ltx, ty) and up to (etx, ty), finds a straight line of tiles 
	// that have a wall in direction dir where dir is UP or DOWN.
	PlatformScan.prototype._findHorizontalBarrierEnd = function(ltx, ty, dir, etx) {
		var cmap = this._cmap;
		if (etx === undefined) etx = cmap._tilesX;
		var rtx = ltx;
		for (rtx = ltx; rtx < etx; rtx++) {
			tile = cmap.tileAt(rtx, ty);
			if (!(tile & dir)) break;
		}
		return rtx;
	};

	/* checks if there are any nonempty tiles in the area
	 * and splits the area based on the following rules:
	 ** if there is a DOWN tile, add it to reachable patches
	 ** if there is an UP tile, create a area with vyi=0
	 ** if there is a LEFT tile, split the area at tx-1
	 ** if there is a RIGHT tile, split the area at tx
	 */
	PlatformScan.prototype._getSplitSeeds = function(childArea) {
		var cmap = this._cmap;

		var ltx = cmap.posToTileX(childArea._pxli);
		var rtx = cmap.posToTileCeilX(childArea._pxri);
		var vyi = childArea._vyi;
		var ty, fty;
		
		if (vyi < 0) {
			fty = cmap.posToTileY(childArea._pyi - this._sizeY);
			ty = cmap.posToTileY(childArea._pyo - this._sizeY);
			if (fty === ty) return;
		} else {
			fty = cmap.posToTileCeilY(childArea._pyo);
			ty = cmap.posToTileCeilY(childArea._pyi);
			if (fty === ty) return;
		}

		var tilesize = cmap.tilesize;

		var txStart = ltx-1;
		var splitSeeds = [];
		var artx;

		var tile;
		var area;

		for (var tx = ltx; tx < rtx; ) {

			tile = cmap.tileAt(tx, ty);
			if ((tile & DOWN) && vyi < 0) {
				if (txStart >= ltx) {
					area = this._createSplitSeed(childArea._parent, txStart, tx, ty);
					splitSeeds.push(area);
				}

				// if we've collided with something above,
				// then we bounce off with velocity = 0.
				artx = this._findHorizontalBarrierEnd(tx, ty, DOWN, rtx);
				area = PlatformArea.fromArea(childArea._parent, 
					tx * tilesize - this._sizeX, 
					artx * tilesize + this._sizeX, 
					0);
				this._clipHierarchy(area);
				splitSeeds.push(area);
				
				tx = artx;
				txStart = ltx-1;

			} else if ((tile & UP) && vyi >= 0) {
				if (txStart >= ltx) {
					area = this._createSplitSeed(childArea._parent, txStart, tx, ty);
					splitSeeds.push(area);
				}

				artx = this._findHorizontalBarrierEnd(tx, ty, UP, rtx);
				this._addReachablePatch(childArea._parent, tx, artx);

				tx = artx;
				txStart = ltx-1;
				
			} else {
				if (tile & LEFT) {
					if (txStart >= ltx) {
						area = this._createSplitSeed(childArea._parent, txStart, tx, ty);
						splitSeeds.push(area);
					}
				}
				if (txStart < ltx) txStart = tx;
				if (tile & RIGHT) {
					area = this._createSplitSeed(childArea._parent, txStart, tx+1, ty);
					splitSeeds.push(area);
					txStart = ltx-1;
				}	
				tx++;
			}
		}

		if (txStart >= ltx) {
			// we haven't changed anything. child is fine as is
			if (txStart === ltx) return;
			area = this._createSplitSeed(childArea._parent, txStart, rtx, ty);
			splitSeeds.push(area);
		}

		return splitSeeds;
	};

	PlatformScan.prototype._createSplitSeed = function(parent, ltx, rtx, ty) {
		var cmap = this._cmap;
		var sltx = cmap.posToTileX(cmap.tileToPosX(ltx) - this._sizeX);
		var srtx = cmap.posToTileCeilX(cmap.tileToPosX(rtx) + this._sizeX);

		var pxli, pxri;

		var tx;
		for (tx = ltx-1; tx >= sltx; tx--) {
			if (cmap.tileAt(tx, ty) & RIGHT) break;
		}
		pxli = cmap.tileToPosX(tx+1);

		for (tx = rtx; tx < srtx; tx++) {
			if (cmap.tileAt(tx, ty) & LEFT) break;
		}
		pxri = cmap.tileToPosX(tx);
		
		var area = PlatformArea.fromArea(parent, pxli, pxri);
		this._clipHierarchy(area);

		return area;
	};

	PlatformScan.prototype._addReachablePatch = function(area, tx0, tx1) {

		var cmap = this._cmap;
		
		var ppxl = cmap.tileToPosX(tx0);
		var ppxr = cmap.tileToPosX(tx1);
		var patch = new PlatformPatch(area,
			ppxl, ppxr,
			ppxl - this._sizeX,
			ppxr + this._sizeX);
		this._clipHierarchy(patch);
		this._reachablePatches.push(patch);
	};

	// if the child range is smaller than the parent range,
	// creates a clipped version of the parent that matches the child range.
	// this propagates up the parent chain.
	PlatformScan.prototype._clipHierarchy = function(childArea) {
		var parentArea = childArea._parent;
		if (!parentArea) return;

		var dx = this._kinematics.getAbsDeltaXFromDeltaY(parentArea._vyi, parentArea._pyo - parentArea._pyi);
		if (parentArea._pxlo < childArea._pxli || parentArea._pxro > childArea._pxri) {

			var cloneParent = parentArea.clone();
			cloneParent.clip(childArea._pxli - dx,
				childArea._pxri + dx,
				childArea._pxli,
				childArea._pxri);

			this._clipHierarchy(cloneParent);
			childArea.reparent(cloneParent);
		}
	};

	// splits patches by platform.
	PlatformScan.prototype.getPatchesByPlatform = function(pmap) {
		var platformPatches = [];
		
		var nextPlatform;
		var txStart;
		var ppatch;

		var patch;
		var ltx, rtx, ty;

		for (var p = 0; p < this._reachablePatches.length; p++) {
			patch = this._reachablePatches[p];
			ltx = pmap.posToTileX(patch._ppxl);
			rtx = pmap.posToTileCeilX(patch._ppxr);
			ty = pmap.posToTileY(patch._pyi);

			for (var tx = ltx; tx < rtx; ) {
				nextPlatform = pmap.tileAt(tx, ty);
				if (nextPlatform) {
					ppatch = patch.clone();
					ppatch.clip(nextPlatform._pxli, nextPlatform._pxri);
					this._clipHierarchy(ppatch);
					platformPatches.push(ppatch);
					tx = nextPlatform._tx1;
				} else tx++;
			}
		}
		return platformPatches;
	};

	PlatformScan.prototype.render = function(ctx, x, y, bbox) {
		this._renderer.render(ctx, x, y, bbox);
	};

	return PlatformScan;

}();