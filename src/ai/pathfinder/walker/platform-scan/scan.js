if (!gm.Pathfinder) gm.Pathfinder = {};
if (!gm.Pathfinder.Walker) gm.Pathfinder.Walker = {};

gm.Pathfinder.Walker.PlatformScan = function() {

	var DOWN = gm.Constants.Dir.DOWN;
	var UP = gm.Constants.Dir.UP;
	var LEFT = gm.Constants.Dir.LEFT;
	var RIGHT = gm.Constants.Dir.RIGHT;

	var PlatformScan = function(cmap, walkerParams) {

		this._cmap = cmap;

		this._sizeX = walkerParams.sizeX;
		this._sizeY = walkerParams.sizeY;
		this._kinematics = new gm.Pathfinder.Walker.Kinematics(walkerParams);

		this._renderer = new gm.Pathfinder.Walker.PlatformScan.Renderer(this);

		if (LOGGING && !cmap) console.log("!!! platformScan - no combined map");
	};

	PlatformScan.prototype.beginSearch = function(pxlo, pxro, pyo) {

		console.log("begin search: pxlo", pxlo, "pxro:", pxro, "pyo:", pyo);
		this._reachablePatches = [];
		this._currentAreas = [];

		if (pxro <= pxlo) return;

		var stubArea = {
			vyo: Math.max(-this._kinematics._jumpSpd, -this._kinematics._terminalV),
			pxlo: pxlo,
			pxro: pxro,
			pyo: pyo,
			parent: undefined,
		};

		this._currentAreas.push(stubArea);
	};

	PlatformScan.prototype.step = function() {
		console.log("STEP *******************************");
		var parentArea = this._currentAreas.pop();
		if (parentArea) {
			var childArea = this._getInitialSeed(parentArea);
			this._addChildrenFromSeed(childArea);
			return true;
		}
		return false;
	};

	PlatformScan.prototype._getInitialSeed = function(parentArea, pxli, pxri, vyi) {
		var childArea = {
			vyi: vyi !== undefined ? vyi : parentArea.vyo,
			pxli: pxli !== undefined ? pxli : parentArea.pxlo,
			pxri: pxri !== undefined ? pxri : parentArea.pxro,
			pyi: parentArea.pyo,
			parent: parentArea
		};
		return childArea;
	};

	PlatformScan.prototype._addChildrenFromSeed = function(childArea) {
		if (childArea.pxri - childArea.pxli < this._sizeX) return;
		if (!this._cmap.inRangeY(this._cmap.posToTileY(childArea.pyi))) return;

		this._getAltitude(childArea);
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

	PlatformScan.prototype._cloneArea = function(area) {
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

	PlatformScan.prototype._getAltitude = function(childArea) {

		var tilesize = this._cmap.tilesize;
		var kinematics = this._kinematics;

		var pyo;
		var vyo;

		var pyiBottom = childArea.pyi;
		var pyiTop = childArea.pyi - this._sizeY;

		var bodyExtend = this._sizeY % tilesize;

		// going up
		if (childArea.vyi < 0) {
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
			var tyoBottom = this._cmap.posToTileY(pyiBottom);
			var ptyoBottom = this._cmap.tileToPosY(tyoBottom);

			var pyoBottom = ptyoBottom + Math.min(bodyExtend, tilesize - bodyExtend);
			if (pyiBottom >= pyoBottom) {
				pyoBottom = ptyoBottom + Math.max(bodyExtend, tilesize - bodyExtend);
				if (pyiBottom >= pyoBottom) {
					pyoBottom = this._cmap.tileToPosY(tyoBottom+1);
				}
			}
			vyo = kinematics.getVyFinalFromDeltaY(childArea.vyi, pyoBottom - pyiBottom);
			pyo = pyoBottom;
		}
		childArea.vyo = vyo;
		childArea.pyo = pyo;
	};

	PlatformScan.prototype._getTentativeSpread = function(childArea) {
		var deltaX = this._kinematics.getAbsDeltaXFromDeltaY(childArea.vyi, childArea.pyo - childArea.pyi);
		childArea.pxlo = childArea.pxli - deltaX;
		childArea.pxro = childArea.pxri + deltaX;
	};

	PlatformScan.prototype._clampSpread = function(childArea) {
		var cmap = this._cmap;
		
		var txli = cmap.posToTileX(childArea.pxli)-1;
		var txlo = cmap.posToTileX(childArea.pxlo)-1;
		var txri = cmap.posToTileCeilX(childArea.pxri);
		var txro = cmap.posToTileCeilX(childArea.pxro);

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
		var dx = px - (dir === LEFT ? childArea.pxli : childArea.pxri);
		var dy = this._kinematics.getDeltaYFromDeltaX(childArea.vyi, dx);

		var tyTop, tyBottom;
		if (childArea.vyi < 0) {
			tyTop = cmap.posToTileCeilY(childArea.pyi + dy - this._sizeY) - 1;
			tyBottom = cmap.posToTileCeilY(childArea.pyi + dy);
		} else {
			tyTop = cmap.posToTileY(childArea.pyi + dy - this._sizeY);
			tyBottom = cmap.posToTileY(childArea.pyi + dy) + 1;
		}

		for (var ty = tyTop; ty < tyBottom; ty++) {
			if (cmap.tileAt(tx, ty) & dir) {
				if (dir === LEFT) childArea.pxlo = cmap.tileToPosX(tx+1);
				else childArea.pxro = cmap.tileToPosX(tx);
				return true;
			}
		}
	};

	PlatformScan.prototype._findXBarrierEnd = function(ltx, ty, dir, etx) {
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

		var ltx = cmap.posToTileX(childArea.pxli);
		var rtx = cmap.posToTileCeilX(childArea.pxri);
		var vyi = childArea.vyi;
		var ty, fty;
		
		if (vyi < 0) {
			fty = cmap.posToTileY(childArea.pyi - this._sizeY);
			ty = cmap.posToTileY(childArea.pyo - this._sizeY);
			if (fty === ty) return;
		} else {
			fty = cmap.posToTileCeilY(childArea.pyo);
			ty = cmap.posToTileCeilY(childArea.pyi);
			if (fty === ty) return;
		}

		var tilesize = cmap.tilesize;

		var txStart = -1;
		var splitSeeds = [];
		var artx;

		for (var tx = ltx; tx < rtx; ) {
			var tile = cmap.tileAt(tx, ty);
			if ((tile & DOWN) && vyi < 0) {
				if (txStart >= 0) {
					splitSeeds.push(this._getInitialSeed(
						childArea.parent, txStart * tilesize, tx * tilesize));
				}

				// if we've collided with something above,
				// then we bounce off with velocity = 0.
				artx = this._findXBarrierEnd(tx, ty, DOWN, rtx);
				splitSeeds.push(this._getInitialSeed(
					childArea.parent, tx * tilesize, rtx * tilesize, 0));
				tx = artx;

				txStart = -1;

			} else if ((tile & UP) && vyi >= 0) {

				if (txStart >= 0) {
					splitSeeds.push(this._getInitialSeed(
						childArea.parent, txStart * tilesize, tx * tilesize));
				}

				artx = this._findXBarrierEnd(tx, ty, UP, rtx);
				this._addReachablePatch(childArea.parent, tx, artx);
				tx = artx;

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

	PlatformScan.prototype._addReachablePatch = function(area, tx0, tx1) {
		var cmap = this._cmap;
		var endArea = this._getInitialSeed(area,
			Math.max(cmap.tileToPosX(tx0), area.pxlo),
			Math.min(cmap.tileToPosX(tx1), area.pxro));
		this._clipHierarchy(endArea);

		this._reachablePatches.push(endArea);
	};

	// if the child range is smaller than the parent range,
	// creates a clipped version of the parent that matches the child range.
	// this propagates back up the parent chain.
	PlatformScan.prototype._clipHierarchy = function(childArea) {
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

	PlatformScan.prototype.render = function(ctx, bbox) {
		this._renderer.render(ctx, bbox);
	};

	return PlatformScan;

}();