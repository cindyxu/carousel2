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
			
			// jump
			scan.beginScan(
				true, 
				platform._pxli, 
				platform._pxri, 
				platformMap._map.tileToPosY(platform._ty));
			while(scan.step());
			PlatformScanner._addReachableLinks(platformMap, platform, 
				scan.getPatchesByPlatform(platformMap._map));
		
			// don't jump
			scan.beginScan(
				false, 
				platform._pxli, 
				platform._pxri, 
				platformMap._map.tileToPosY(platform._ty));
			while(scan.step());
			PlatformScanner._addReachableLinks(platformMap, platform, 
				scan.getPatchesByPlatform(platformMap._map));

			if (LOGGING) {
				console.log("~~~~~~~~~~~~~~~~~~ RESULTS for platform", platform._index);
				console.log(platform._linksByPlatform);
			}
		}
	};

	PlatformScanner._addReachableLinks = function(platformMap, originPlatform, patches) {
		var map = platformMap._map;

		for (var p = 0; p < patches.length; p++) {
			var tailArea = patches[p];
			var tx0 = map.posToTileX(tailArea._ppxl);
			var tx1 = map.posToTileCeilX(tailArea._ppxr);
			var ty = map.posToTileY(tailArea._pyi);

			// assuming every link can only touch one platform.
			var reachedPlatform;
			for (var tx = tx0; tx < tx1; ) {
				reachedPlatform = map.tileAt(tx, ty);
				if (reachedPlatform && reachedPlatform !== originPlatform) {
					var link = new gm.Pathfinder.Walker.Link.Platform(
						originPlatform, reachedPlatform, tailArea, platformMap._kinematics);
					platformMap.addReachableLink(originPlatform, reachedPlatform, link);
					break;
				} else tx++;
			}
		}
	};

	return PlatformScanner;
}();