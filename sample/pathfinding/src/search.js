gm.Sample.Pathfinding.Search = function() {

	var values = gm.Sample.Pathfinding.values;
	var ToyWorld = gm.Sample.Pathfinding.ToyWorld;

	var navGrid = new gm.NavGrid();
	navGrid.fromLayers(ToyWorld._level._layers);

	var Search = {};

	var platformSearch;

	var findPlatformUnderBody = function() {
		
	};

	Search.planPath = function() {

		navGrid.fromLayers(ToyWorld._level._layers);

		var body = ToyWorld._body;


		platformSearch = new gm.Pathfinder.Walker.PlatformSearch(
			navGrid._platformMap,
			values.SIZE_X,
			values.SIZE_Y, 
			values.WALK_SPD,
			values.JUMP_SPD,
			values.FALL_ACCEL,
			values.TERMINAL_V,
			originPlatform);
	};

	Search.render = function(ctx) {
		navGrid.render(ctx, ToyWorld._camera._body.getBbox());
	};

	return Search;

}();