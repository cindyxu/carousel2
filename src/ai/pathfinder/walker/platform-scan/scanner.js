gm.Pathfinder.Walker.PlatformScanner = function() {

	var PlatformScanner = {};

	PlatformScanner.scanPlatforms = function(platformMap) {
		var platforms = platformMap._platforms;
		var scan = new gm.Pathfinder.Walker.PlatformScan(platformMap._combinedMap._map, platformMap._walkerParams);
		
		for (var p = 0; p < platforms.length; p++) {
			var platform = platforms[p];
			scan.beginSearch(platform._pxli, platform._pxri, platformMap._map.tileToPosY(platform._ty));
			while(scan.step());
			PlatformScanner._addReachablePlatforms(platformMap, platform, scan._reachablePatches);
		}
	};

	PlatformScanner._addReachablePlatforms = function(platformMap, originPlatform, patches) {
		var map = platformMap._map;
		for (var p = 0; p < patches.length; p++) {
			var patch = patches[p];
			var tx0 = map.posToTileX(patch.pxli);
			var tx1 = map.posToTileCeilX(patch.pxri);
			var ty = map.posToTileY(patch.pyi);

			var reachedPlatform;
			for (var tx = tx0; tx < tx1; ) {
				reachedPlatform = map.tileAt(tx, ty);
				if (reachedPlatform) {
					platformMap.addReachableLink(originPlatform, reachedPlatform, patch);
					tx = reachedPlatform.tx1;
				} else tx++;
			}
		}
	};

	return PlatformScanner;
}();