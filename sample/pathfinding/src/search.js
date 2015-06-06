gm.Sample.Pathfinding.Search = function() {

	var values = gm.Sample.Pathfinding.values;
	var ToyWorld = gm.Sample.Pathfinding.ToyWorld;

	var combinedMap = new gm.Pathfinder.CombinedMap(ToyWorld._level._layers);

	var body = ToyWorld._entity._body;
	var platformMap = new gm.Pathfinder.Walker.PlatformMap(body._sizeX, body._sizeY, combinedMap);

	var platformSearch;

	var Search = {};

	Search.planPath = function() {

		platformSearch = undefined;		
		combinedMap.fromLayers(ToyWorld._level._layers);
		platformMap.fromCombinedMap(combinedMap);

		var originPlatform = platformMap.getPlatformUnderBody(body);

		if (originPlatform) {
			platformSearch = new gm.Pathfinder.Walker.PlatformSearch(
				combinedMap._map,
				platformMap._map,
				values.SIZE_X,
				values.SIZE_Y, 
				values.WALK_SPD,
				values.JUMP_SPD,
				values.FALL_ACCEL,
				values.TERMINAL_V,
				originPlatform);
		}
	};

	Search.step = function() {
		if (platformSearch) platformSearch.step();
	};

	Search.render = function(ctx) {
		var bbox = ToyWorld._camera._body.getBbox();
		platformMap.render(ctx, bbox);
		if (platformSearch) platformSearch.render(ctx, bbox);
	};

	return Search;

}();