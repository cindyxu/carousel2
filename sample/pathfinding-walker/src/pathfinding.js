gm.Sample.Ai.Walker.Pathfinding.Pathfinding = function() {

	var PlatformMap = gm.Ai.Walker.PlatformMap;
	var PlatformUtil = gm.Ai.Walker.PlatformUtil;

	var values = gm.Sample.Ai.Walker.Pathfinding.values;
	var kinematics = new gm.Ai.Walker.Kinematics({
		walkSpd: values.WALK_SPD,
		jumpSpd: values.JUMP_SPD,
		fallAccel: values.FALL_ACCEL,
		terminalV: values.TERMINAL_V
	});

	var ToyWorld = gm.Sample.Ai.Walker.Pathfinding.ToyWorld;

	var combinedMap = new gm.Ai.CombinedMap(ToyWorld._level._layers);

	var startBody = ToyWorld._startEntity._body;
	var endBody = ToyWorld._endEntity._body;
	var camera = ToyWorld._camera;

	var platformMap, platformMapRenderer;
	var reachable;

	var platformScan, platformScanRenderer;
	var platformSearch, platformSearchRenderer;

	var Pathfinding = {};

	Pathfinding.regeneratePlatforms = function() {

		platformSearch = platformSearchRenderer = undefined;
		platformScan = platformScanRenderer = undefined;

		combinedMap.fromLayers(ToyWorld._level._layers);
		platformMap = new PlatformMap(startBody, kinematics, combinedMap);
		platformMapRenderer = new gm.Debug.Renderer.Map.Platform(platformMap._map);
		reachable = gm.Ai.Walker.PlatformScan.Scanner.scanPlatforms(combinedMap, platformMap);
	};

	Pathfinding.startScan = function() {
		var originPlatform = PlatformUtil.getPlatformUnderBody(platformMap, startBody);

		if (originPlatform) {
			platformScan = new gm.Ai.Walker.PlatformScan(
				combinedMap._map,
				platformMap._body._sizeX,
				platformMap._body._sizeY,
				platformMap._kinematics);
			platformScan.beginScan(true, originPlatform._pxli, 
				originPlatform._pxri, 
				combinedMap.tileToPosY(originPlatform._ty));
			platformScanRenderer = new gm.Ai.Walker.PlatformScan.Renderer(platformScan);
		}
	};

	Pathfinding.startSearch = function() {
		var originPlatform = PlatformUtil.getPlatformUnderBody(platformMap, startBody);
		if (originPlatform) {
			platformSearch = new gm.Ai.PlatformSearch(
				platformMap,
				reachable,
				endBody._x,
				endBody._y);
			platformSearchRenderer = new gm.Ai.PlatformSearch.Renderer(platformSearch);
		}
	};

	Pathfinding.step = function() {
		if (platformScan) platformScan.step();
		if (platformSearch) platformSearch.stepLinkIncrement();
	};

	Pathfinding.render = function(ctx) {
		var bbox = ToyWorld._camera._body.getBbox();

		if (platformMapRenderer) platformMapRenderer.render(ctx, 0, 0, bbox);
		if (platformScanRenderer) platformScanRenderer.render(ctx, 0, 0, bbox);
		if (platformSearchRenderer) platformSearchRenderer.render(ctx, 0, 0, bbox);
	};

	return Pathfinding;

}();