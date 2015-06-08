gm.Pathfinder.Walker.PlatformGenerator = function() {

	var PlatformGenerator = {};
	var PlatformMap = gm.Pathfinder.Walker.PlatformMap;

	var LEFT = gm.Constants.Dir.LEFT;
	var RIGHT = gm.Constants.Dir.RIGHT;

	PlatformGenerator.generatePlatforms = function(platformMap) {
		var cmap = platformMap._combinedMap._map;

		var pstart = -1;
		var ptile;

		for (var ty = 0; ty < cmap._tilesY; ty++) {
			for (var tx = 0; tx < cmap._tilesX; tx++) {

				var ntile = cmap.tileAt(tx, ty);

				var shouldFinishPlatform = (pstart >= 0 && !(ntile & gm.Constants.Dir.UP));
				if (shouldFinishPlatform) {
					addPlatformsForPatch(pstart, tx, ty, platformMap);
					pstart = -1;
				}

				if (ntile && pstart < 0) {
					pstart = tx;
					ptile = cmap.tileAt(tx, ty);
				}
			}

			if (pstart >= 0) {
				addPlatformsForPatch(pstart, cmap._tilesX, ty, platformMap);
				pstart = -1;
			}
		}
	};

	var getPlatformExtents = function(platform, platformMap) {
		var cmap = platformMap._combinedMap._map;

		var maxTy = platform._ty;
		var minTy = cmap.posToTileY(cmap.tileToPosY(platform._ty) - platformMap._walkerParams.sizeY);
		var ty, tile;
		
		var minPxli = cmap.tileToPosX(platform._tx0) - platformMap._walkerParams.sizeX;
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

		var maxPxri = cmap.tileToPosX(platform._tx1) + platformMap._walkerParams.sizeX;
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

	var addPlatformsForPatch = function(tx0, tx1, ty, platformMap) {
		var cmap = platformMap._combinedMap._map;

		var initPlatform = platformMap.newPlatformObject(tx0, tx1, ty);
		var splitPlatforms = splitPlatform(initPlatform, platformMap);

		for (var s = 0; s < splitPlatforms.length; s++) {
			var platform = splitPlatforms[s];
			getPlatformExtents(platform, platformMap);
			platformMap.addPlatform(platform);
		}
	};

	var splitPlatform = function(platform, platformMap) {
		var cmap = platformMap._combinedMap._map;

		var maxTy = platform._ty;
		var minTy = cmap.posToTileY(cmap.tileToPosY(platform._ty) - platformMap._walkerParams.sizeY);

		var splitPlatforms = [];
		
		for (var tx = platform._tx0; tx < platform._tx1; tx++) {
			var splitLeft = false;
			var splitRight = false;
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