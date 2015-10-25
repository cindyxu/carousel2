gm.Ai.Walker.PlatformGenerator = function() {

	var PlatformGenerator = {};
	var PlatformMap = gm.Ai.Walker.PlatformMap;

	var LEFT = gm.Constants.Dir.LEFT;
	var RIGHT = gm.Constants.Dir.RIGHT;

	PlatformGenerator.generatePlatforms = function(platformMap) {
		var cmap = platformMap._combinedMap._map;

		var pstart = -1;
		var ptile;

		var platforms = [];

		for (var ty = 0; ty < cmap._tilesY; ty++) {
			for (var tx = 0; tx < cmap._tilesX; tx++) {

				var ntile = cmap.tileAt(tx, ty);

				var shouldFinishPlatform = (pstart >= 0 && !(ntile & gm.Constants.Dir.UP));
				if (shouldFinishPlatform) {
					addPlatformsForPatch(pstart, tx, ty, platformMap, platforms);
					pstart = -1;
				}

				if (ntile && pstart < 0) {
					pstart = tx;
					ptile = cmap.tileAt(tx, ty);
				}
			}

			if (pstart >= 0) {
				addPlatformsForPatch(pstart, cmap._tilesX, ty, platformMap, platforms);
				pstart = -1;
			}
		}
		return platforms;
	};

	// sets platform.pxli and platform.pxri, which represent how far a body with sizeX and sizeY 
	// could walk to the left/right of this platform before either falling off or hitting a wall.
	var setPlatformExtents = function(platform, platformMap) {
		var cmap = platformMap._combinedMap._map;

		var maxTy = platform._ty;
		var minTy = cmap.posToTileY(cmap.tileToPosY(platform._ty) - platformMap._body._sizeY);
		var ty, tile;
		
		var minPxli = cmap.tileToPosX(platform._tx0) - platformMap._body._sizeX;
		var minLtx = cmap.posToTileX(minPxli);
		var ltx;
		lxloop:
		for (ltx = platform._tx0; ltx >= minLtx; ltx--) {
			lyloop:
			for (ty = minTy; ty < maxTy; ty++) {
				tile = cmap.tileAt(ltx-1, ty);
				if (tile & RIGHT) break lxloop;
			}
		}

		var maxPxri = cmap.tileToPosX(platform._tx1) + platformMap._body._sizeX;
		var maxRtx = cmap.posToTileCeilX(maxPxri);
		var rtx;
		rxloop:
		for (rtx = platform._tx1; rtx < maxRtx; rtx++) {
			ryloop:
			for (ty = minTy; ty < maxTy; ty++) {
				tile = cmap.tileAt(rtx, ty);
				if (tile & LEFT) break rxloop;
			}
		}

		platformMap.extendPlatformLeft(platform, Math.max(minPxli, cmap.tileToPosX(ltx)));
		platformMap.extendPlatformRight(platform, Math.min(maxPxri, cmap.tileToPosX(rtx)));
	};

	// turns patch into platform(s). splits into smaller platforms if necessary,
	// then extends each platform as far as possible to the left and right.
	var addPlatformsForPatch = function(tx0, tx1, ty, platformMap, res) {
		var cmap = platformMap._combinedMap._map;

		var initPlatform = platformMap.newPlatformObject(tx0, tx1, ty);
		var splitPlatforms = splitPlatform(initPlatform, platformMap);

		for (var s = 0; s < splitPlatforms.length; s++) {
			var platform = splitPlatforms[s];
			setPlatformExtents(platform, platformMap);
			res.push(platform);
		}
	};

	// splits platform into smaller ones until a body with sizeX, sizeY
	// can walk unencumbered from one end of each platform to the other.
	var splitPlatform = function(platform, platformMap) {
		var cmap = platformMap._combinedMap._map;

		var tx, ty;
		var maxTy = platform._ty;
		var minTy = cmap.posToTileY(cmap.tileToPosY(platform._ty) - platformMap._body._sizeY);

		var splitPlatforms = [];
		
		for (tx = platform._tx0; tx < platform._tx1; tx++) {
			var splitLeft = false;
			var splitRight = false;

			// we check tiles the body touches in each row
			for (ty = minTy; ty < maxTy; ty++) {
				var tile = cmap.tileAt(tx, ty);
				splitLeft = splitLeft || (tile & LEFT);
				splitRight = splitRight || (tile & RIGHT);
			}
			if (splitLeft && tx > platform._tx0) {
				splitPlatforms.push(platform);
				platform = platformMap.splitPlatformAt(platform, tx);
			} if (splitRight && tx < platform._tx1-1) {
				splitPlatforms.push(platform);
				platform = platformMap.splitPlatformAt(platform, tx+1);
			}
		}

		splitPlatforms.push(platform);
		return splitPlatforms;
	};

	return PlatformGenerator;

}();