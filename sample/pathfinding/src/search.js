gm.Sample.Pathfinding.Search = function() {

	var values = gm.Sample.Pathfinding.values;
	var walkerParams = {
		sizeX: values.SIZE_X,
		sizeY: values.SIZE_Y, 
		walkSpd: values.WALK_SPD,
		jumpSpd: values.JUMP_SPD,
		fallAccel: values.FALL_ACCEL,
		terminalV: values.TERMINAL_V
	};

	var ToyWorld = gm.Sample.Pathfinding.ToyWorld;

	var combinedMap = new gm.Pathfinder.CombinedMap(ToyWorld._level._layers);

	var body = ToyWorld._entity._body;
	var platformMap = new gm.Pathfinder.Walker.PlatformMap(walkerParams, combinedMap);

	var platformScan;

	var Search = {};

	Search.planPath = function() {

		platformScan = undefined;		
		combinedMap.fromLayers(ToyWorld._level._layers);
		platformMap.fromCombinedMap(combinedMap);

		var originPlatform = platformMap.getPlatformUnderBody(body);

		if (originPlatform) {
			platformScan = new gm.Pathfinder.Walker.PlatformScan(
				combinedMap._map,
				walkerParams);
			platformScan.beginSearch(originPlatform._pxli, 
				originPlatform._pxri, 
				combinedMap.tileToPosY(originPlatform._ty));
		}
	};

	Search.step = function() {
		if (platformScan) platformScan.step();
	};

	Search.render = function(ctx) {
		var bbox = ToyWorld._camera._body.getBbox();
		platformMap.render(ctx, bbox);
		if (platformScan) platformScan.render(ctx, bbox);
	};

	return Search;

}();