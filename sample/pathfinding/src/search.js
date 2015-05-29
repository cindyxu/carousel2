var Pathfinding = gm.Sample.Pathfinding;
var ToyWorld = Pathfinding.ToyWorld;

var navGrid = new gm.NavGrid();
navGrid.fromLayers(ToyWorld._level._layers);

var platformSearch;
var startSearch = function(originPlatform) {
	platformSearch = new gm.Pathfinder.Walker.PlatformSearch(
		navGrid._platformMap,
		SIZE_X,
		SIZE_Y, 
		WALK_SPD,
		JUMP_SPD,
		FALL_ACCEL,
		TERMINAL_V,
		originPlatform);
};