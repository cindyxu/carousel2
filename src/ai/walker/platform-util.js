gm.Ai.Walker.PlatformUtil = function() {

	var PlatformUtil = {};

	var obbox = {};
	PlatformUtil.getPlatformUnderBody = function(platformMap, body) {
		var pmap = platformMap._map;
		var tilesize = pmap.tilesize;
		var bbox = body.getBbox();
		
		platformMap.getOverlappingTileBbox(bbox, obbox);

		var platform;
		for (var ty = obbox.ty1; ty < pmap._tilesY; ty++) {
			for (var tx = obbox.tx0; tx < obbox.tx1; tx++) {
				platform = pmap.tileAt(tx, ty);
				if (platform) return platform;
			}
		}
	};

	return PlatformUtil;

}();