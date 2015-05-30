gm.Sample.Pathfinding.Search = function() {

	var values = gm.Sample.Pathfinding.values;
	var ToyWorld = gm.Sample.Pathfinding.ToyWorld;

	var navGrid = new gm.NavGrid();
	navGrid.fromLayers(ToyWorld._level._layers);

	var platformSearch;
	var startSearch = function(originPlatform) {
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

}();