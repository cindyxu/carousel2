gm.Sample.Pathfinding.Pathfinding = function() {

	var PlatformMap = gm.Pathfinder.Walker.PlatformMap;
	var ObservedPlatformMap = gm.Pathfinder.Walker.ObservedPlatformMap;

	var values = gm.Sample.Pathfinding.values;
	var kinematics = new gm.Pathfinder.Walker.Kinematics({
		walkSpd: values.WALK_SPD,
		jumpSpd: values.JUMP_SPD,
		fallAccel: values.FALL_ACCEL,
		terminalV: values.TERMINAL_V
	});

	var ToyWorld = gm.Sample.Pathfinding.ToyWorld;

	var combinedMap = new gm.Pathfinder.CombinedMap(ToyWorld._level._layers);

	var startBody = ToyWorld._startEntity._body;
	var endBody = ToyWorld._endEntity._body;
	var camera = ToyWorld._camera;

	var platformMap = new PlatformMap(startBody, kinematics, combinedMap);

	var platformScan;
	var platformSearch;

	var observedPlatformMap;
	var observeBody = new gm.Body({
		sizeX: values.OBSERVE_CAMERA_SIZE_X,
		sizeY: values.OBSERVE_CAMERA_SIZE_Y
	});

	var mx, my;

	var Pathfinding = {};

	Pathfinding.regeneratePlatforms = function() {

		platformSearch = undefined;
		platformScan = undefined;
		observedPlatformMap = undefined;

		combinedMap.fromLayers(ToyWorld._level._layers);
		platformMap.generateMap();
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
		}
	};

	Pathfinding.startSearch = function() {

		var originPlatform = platformMap.getPlatformUnderBody(startBody);
		if (originPlatform) {
			platformSearch = new gm.Pathfinder.Walker.PlatformSearch(
				platformMap,
				startBody,
				kinematics,
				endBody._x,
				endBody._y);
		}
	};

	var pres = {};
	Pathfinding.startObserving = function() {
		var center = observeBody.getCenter();
		camera.canvasToWorldPos(mx, my, pres);
		observeBody.moveTo(pres.x - center.x, pres.y - center.y);

		observedPlatformMap = new ObservedPlatformMap(platformMap, observeBody);
	};

	Pathfinding.onMouseMove = function(nmx, nmy) {
		mx = nmx;
		my = nmy;
		if (observedPlatformMap) {
			camera.canvasToWorldPos(mx, my, pres);
			observeBody.moveTo(pres.x - observeBody._sizeX/2, pres.y - observeBody._sizeY/2);
			observedPlatformMap.observe();
		}
	};

	Pathfinding.step = function() {

		if (platformScan) platformScan.step();
		if (platformSearch) platformSearch.stepLinkIncrement();
	};

	Pathfinding.render = function(ctx) {
		var bbox = ToyWorld._camera._body.getBbox();
		platformMap.render(ctx, bbox);

		if (platformScan) platformScan.render(ctx, bbox);
		if (platformSearch) platformSearch.render(ctx, bbox);
		if (observedPlatformMap) observedPlatformMap.render(ctx, bbox);
	};

	return Pathfinding;

}();