gm.Sample.Pathfinding.Search = function() {

	var Values = gm.Sample.Pathfinding.Values;
	var ToyWorld = gm.Sample.Pathfinding.ToyWorld;

	var navGrid = new gm.NavGrid();
	navGrid.fromLayers(ToyWorld._level._layers);

	var platformSearch;
	var startSearch = function(originPlatform) {
		platformSearch = new gm.Pathfinder.Walker.PlatformSearch(
			navGrid._platformMap,
			Values.SIZE_X,
			Values.SIZE_Y, 
			Values.WALK_SPD,
			Values.JUMP_SPD,
			Values.FALL_ACCEL,
			Values.TERMINAL_V,
			originPlatform);
	};

}();