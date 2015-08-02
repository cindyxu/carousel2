gm.Sample.Pathfinding.Pathfinding = function() {

	var PlatformMap = gm.Ai.PlatformMap;
	var ObservedPlatformMap = gm.Ai.ObservedPlatformMap;
	var PlatformUtil = gm.Ai.PlatformUtil;

	var values = gm.Sample.Pathfinding.values;
	var kinematics = new gm.Ai.Kinematics({
		walkSpd: values.WALK_SPD,
		jumpSpd: values.JUMP_SPD,
		fallAccel: values.FALL_ACCEL,
		terminalV: values.TERMINAL_V
	});

	var ToyWorld = gm.Sample.Pathfinding.ToyWorld;

	var combinedMap = new gm.Ai.CombinedMap(ToyWorld._level._layers);

	var startBody = ToyWorld._startEntity._body;
	var endBody = ToyWorld._endEntity._body;
	var camera = ToyWorld._camera;

	var platformMap, platformMapRenderer;
	var reachable;

	var platformScan, platformScanRenderer;
	var platformSearch, platformSearchRenderer;

	var observedPlatformMap, observedPlatformMapRenderer;
	var observedReachable, observedReachableRenderer;
	var reachableObserver;

	var observeCameraBody = new gm.Body({
		sizeX: values.OBSERVE_CAMERA_SIZE_X,
		sizeY: values.OBSERVE_CAMERA_SIZE_Y
	});

	var mx, my;

	var Pathfinding = {};

	Pathfinding.regeneratePlatforms = function() {

		platformSearch = platformSearchRenderer = undefined;
		platformScan = platformScanRenderer = undefined;

		observedPlatformMap = observedPlatformMapRenderer = undefined;
		observedReachable = observedReachableRenderer = undefined;
		reachableObserver = undefined;

		combinedMap.fromLayers(ToyWorld._level._layers);
		platformMap = new PlatformMap(startBody, kinematics, combinedMap);
		platformMapRenderer = new gm.Renderer.PlatformMap(platformMap._map);
		reachable = gm.Ai.PlatformScanner.scanPlatforms(combinedMap, platformMap);
	};

	Pathfinding.startScan = function() {
		var originPlatform = PlatformUtil.getPlatformUnderBody(platformMap, startBody);

		if (originPlatform) {
			platformScan = new gm.Ai.PlatformScan(
				combinedMap._map,
				platformMap._body._sizeX,
				platformMap._body._sizeY,
				platformMap._kinematics);
			platformScan.beginScan(true, originPlatform._pxli, 
				originPlatform._pxri, 
				combinedMap.tileToPosY(originPlatform._ty));
			platformScanRenderer = new gm.Ai.PlatformScan.Renderer(platformScan);
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

	var pres = {};
	Pathfinding.startObserving = function() {
		var center = observeCameraBody.getCenter();
		camera.canvasToWorldPos(mx, my, pres);
		observeCameraBody.moveTo(pres.x - center.x, pres.y - center.y);

		observedPlatformMap = new ObservedPlatformMap(platformMap, observeCameraBody);
		observedPlatformMapRenderer = new ObservedPlatformMap.Renderer(observedPlatformMap._map);
		observedReachable = gm.Ai.Reachable.newInstance();
		observedReachableRenderer = new gm.Ai.Reachable.Renderer(observedReachable);
		reachableObserver = new gm.Ai.ReachableObserver(observedPlatformMap, reachable, observedReachable);
	};

	Pathfinding.onMouseMove = function(nmx, nmy) {
		mx = nmx;
		my = nmy;
		if (observedPlatformMap) {
			camera.canvasToWorldPos(mx, my, pres);
			observeCameraBody.moveTo(pres.x - observeCameraBody._sizeX/2, pres.y - observeCameraBody._sizeY/2);
			observedPlatformMap.observe();
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
		if (observedPlatformMapRenderer) observedPlatformMapRenderer.render(ctx, 0, 0, bbox);
		if (observedReachableRenderer) observedReachableRenderer.render(ctx, 0, 0, bbox);
	};

	return Pathfinding;

}();