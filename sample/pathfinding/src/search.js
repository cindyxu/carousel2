gm.Sample.Pathfinding.Search = function() {

	var values = gm.Sample.Pathfinding.values;
	var ToyWorld = gm.Sample.Pathfinding.ToyWorld;

	var navGrid = new gm.NavGrid();
	navGrid.fromLayers(ToyWorld._level._layers);

	var platformSearch;

	var Search = {};

	Search.planPath = function() {

		platformSearch = undefined;		
		navGrid.fromLayers(ToyWorld._level._layers);

		var body = ToyWorld._entity._body;
		var originPlatform = navGrid.getPlatformUnderBody(body);

		if (originPlatform) {
			platformSearch = new gm.Pathfinder.Walker.PlatformSearch(
				navGrid._platformMap,
				navGrid._combinedLayerMap._map,
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
		navGrid.render(ctx, bbox);
		if (platformSearch) platformSearch.render(ctx, bbox);
	};

	return Search;

}();