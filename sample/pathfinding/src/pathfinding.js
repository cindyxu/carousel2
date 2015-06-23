gm.Sample.Pathfinding.Pathfinding = function() {

	var values = gm.Sample.Pathfinding.values;
	var walkerParams = {
		walkSpd: values.WALK_SPD,
		jumpSpd: values.JUMP_SPD,
		fallAccel: values.FALL_ACCEL,
		terminalV: values.TERMINAL_V
	};

	var ToyWorld = gm.Sample.Pathfinding.ToyWorld;

	var combinedMap = new gm.Pathfinder.CombinedMap(ToyWorld._level._layers);

	var startBody = ToyWorld._startEntity._body;
	var endBody = ToyWorld._endEntity._body;

	var platformMap = new gm.Pathfinder.Walker.PlatformMap(startBody, walkerParams, combinedMap);

	var platformScan, platformScanRenderer;
	var platformSearch, platformSearchRenderer;

	var Pathfinding = {};

	Pathfinding.regeneratePlatforms = function() {

		platformSearch = undefined;
		platformSearchRenderer = undefined;
		platformScan = undefined;
		platformScanRenderer = undefined;
	
		combinedMap.fromLayers(ToyWorld._level._layers);
		platformMap.fromCombinedMap(combinedMap);
	};

	Pathfinding.startScan = function() {
		var originPlatform = platformMap.getPlatformUnderBody(startBody);

		if (originPlatform) {
			platformScan = new gm.Pathfinder.Walker.PlatformScan(
				combinedMap._map,
				platformMap._body._sizeX,
				platformMap._body._sizeY,
				platformMap._kinematics);
			platformScan.beginScan(true, originPlatform._pxli, 
				originPlatform._pxri, 
				combinedMap.tileToPosY(originPlatform._ty));

			platformScanRenderer = new gm.Pathfinder.Walker.PlatformScan.Renderer(platformScan);
		}
	};

	Pathfinding.startSearch = function() {

		var originPlatform = platformMap.getPlatformUnderBody(startBody);
		if (originPlatform) {
			platformSearch = new gm.Pathfinder.Walker.PlatformSearch(
				platformMap, 
				endBody._x,
				endBody._y);
			platformSearchRenderer = new gm.Pathfinder.Walker.PlatformSearch.Renderer(platformSearch);
		}
	};

	Pathfinding.step = function() {
		if (platformScan) platformScan.step();
		if (platformSearch) platformSearch.stepLinkIncrement();
	};

	Pathfinding.render = function(ctx) {
		var bbox = ToyWorld._camera._body.getBbox();
		platformMap.render(ctx, bbox);

		if (platformScanRenderer) platformScanRenderer.render(ctx, bbox);
		if (platformSearchRenderer) platformSearchRenderer.render(ctx, bbox);
	};

	return Pathfinding;

}();