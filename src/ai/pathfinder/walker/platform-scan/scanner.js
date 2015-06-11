gm.Pathfinder.Walker.PlatformScanner = function() {

	var PlatformScanner = {};

	PlatformScanner.scanPlatforms = function(platformMap) {
		var platforms = platformMap._platforms;
		var scan = new gm.Pathfinder.Walker.PlatformScan(
			platformMap._combinedMap._map, 
			platformMap._body._sizeX, 
			platformMap._body._sizeY, 
			platformMap._kinematics);
		
		for (var p = 0; p < platforms.length; p++) {
			var platform = platforms[p];
			scan.beginSearch(platform._pxli, platform._pxri, platformMap._map.tileToPosY(platform._ty));
			while(scan.step());
			PlatformScanner._addReachableLinks(platformMap, platform, scan.getPatchesByPlatform(platformMap._map));
		}
	};

	PlatformScanner._addReachableLinks = function(platformMap, originPlatform, patches) {
		var map = platformMap._map;
		for (var p = 0; p < patches.length; p++) {
			var tailArea = patches[p];
			var tx0 = map.posToTileX(tailArea.pxli);
			var tx1 = map.posToTileCeilX(tailArea.pxri);
			var ty = map.posToTileY(tailArea.pyi);

			var link = new gm.Pathfinder.Walker.Link(tailArea, platformMap._kinematics);

			// assuming every link can only touch one platform.
			var reachedPlatform;
			for (var tx = tx0; tx < tx1; ) {
				reachedPlatform = map.tileAt(tx, ty);
				if (reachedPlatform) {
					platformMap.addReachableLink(originPlatform, reachedPlatform, link);
					break;
				} else tx++;
			}
		}
	};

	return PlatformScanner;
}();