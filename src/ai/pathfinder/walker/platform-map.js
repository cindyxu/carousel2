if (!gm.Pathfinder.Walker) gm.Pathfinder.Walker = {};

gm.Pathfinder.Walker.PlatformMap = function() {

	var LEFT = gm.Constants.Dir.LEFT;
	var RIGHT = gm.Constants.Dir.RIGHT;

	var PlatformMap = function(sizeX, sizeY, combinedMap) {
		this._sizeX = sizeX;
		this._sizeY = sizeY;
		this._platforms = [];

		this._map = new gm.Map({
			tilesX: 0,
			tilesY: 0,
			tilesize: 0
		});
		this._renderer = new gm.Renderer.PlatformMap(this._map);
		if (combinedMap) this.fromCombinedMap(combinedMap);
	};

	PlatformMap.prototype.fromCombinedMap = function(combinedMap) {

		this._combinedMap = combinedMap;
		var cmap = combinedMap._map;
		var tilesize = cmap.tilesize;

		this._map.resize(cmap._tilesX, cmap._tilesY);
		this._map.tilesize = tilesize;
		this._platforms.length = 0;

		this._fillPlatformMap();
	};

	PlatformMap.prototype._fillPlatformMap = function() {
		var cmap = this._combinedMap._map;
		var platformMap = this._map;
		var pstart = -1;
		var ptile;

		for (var ty = 0; ty < platformMap._tilesY; ty++) {
			for (var tx = 0; tx < platformMap._tilesX; tx++) {

				var ntile = cmap.tileAt(tx, ty);

				var shouldFinishPlatform = (pstart >= 0 && !(ntile & gm.Constants.Dir.UP));
				if (shouldFinishPlatform) {
					this._addNewPlatform(pstart, tx, ty);
					pstart = -1;
				}

				if (ntile && pstart < 0) {
					pstart = tx;
					ptile = cmap.tileAt(tx, ty);
				}
			}

			if (pstart >= 0) {
				this._addNewPlatform(pstart, platformMap._tilesX, ty);
				pstart = -1;
			}
		}
	};

	var obbox = {};
	var tbbox = {};
	PlatformMap.prototype.getPlatformUnderBody = function(body) {

		var platformMap = this._map;
		var tilesize = this._map.tilesize;
		var bbox = body.getBbox();
		var oftx = this._combinedMap._oftx, 
			ofty = this._combinedMap._ofty;

		obbox.x0 = bbox.x0 + (oftx * tilesize);
		obbox.y0 = bbox.y0 + (ofty * tilesize);
		obbox.x1 = bbox.x1 + (oftx * tilesize);
		obbox.y1 = bbox.y1 + (ofty * tilesize);
		
		platformMap.getOverlappingTileBbox(obbox, tbbox);

		var platform;
		for (var ty = tbbox.ty1; ty < platformMap._tilesY; ty++) {
			for (var tx = tbbox.tx0; tx < tbbox.tx1; tx++) {
				platform = platformMap.tileAt(tx, ty);
				if (platform) return platform;
			}
		}
	};

	PlatformMap.prototype._getPlatformExtents = function(platform) {
		var cmap = this._combinedMap._map;
		var maxTy = platform.ty;
		var minTy = cmap.posToTileY(cmap.tileToPosY(platform.ty) - this._sizeY);
		var ty, tile;
		
		var minPxli = cmap.tileToPosX(platform.tx0) - this._sizeX;
		var minLtx = cmap.posToTileX(minPxli);
		var ltx;
		lxloop:
		for (ltx = platform.tx0; ltx >= minLtx; ltx--) {
			lyloop:
			for (ty = minTy; ty < maxTy; ty++) {
				tile = cmap.tileAt(ltx-1, ty);
				if (tile & RIGHT) break lxloop;
			}
		}

		var maxPxri = cmap.tileToPosX(platform.tx1) + this._sizeX;
		var maxRtx = cmap.posToTileCeilX(maxPxri);
		var rtx;
		rxloop:
		for (rtx = platform.tx1; rtx < maxRtx; rtx++) {
			ryloop:
			for (ty = minTy; ty < maxTy; ty++) {
				tile = cmap.tileAt(rtx, ty);
				if (tile & LEFT) break rxloop;
			}
		}

		platform.pxli = Math.max(minPxli, cmap.tileToPosX(ltx));
		platform.pxri = Math.min(maxPxri, cmap.tileToPosX(rtx));
	};

	PlatformMap.prototype._createNewPlatformObject = function(tx0, tx1, ty) {
		return {
			tx0: tx0,
			tx1: tx1,
			ty: ty,
			index: this._platforms.length + 1
		};
	};

	PlatformMap.prototype._addNewPlatform = function(tx0, tx1, ty) {
		var platform = this._createNewPlatformObject(tx0, tx1, ty);
		this._getPlatformExtents(platform);

		this._platforms.push(platform);
		for (var tx = tx0; tx < tx1; tx++) {
			this._map.setTile(tx, ty, platform);
		}
	};

	PlatformMap.prototype.render = function(ctx, bbox) {
		var tilesize = this._map.tilesize;
		this._renderer.render(ctx, this._combinedMap._oftx * tilesize, this._combinedMap._ofty * tilesize, bbox);
	};

	return PlatformMap;

}();