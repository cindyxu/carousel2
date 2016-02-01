gm.Sample.FloaterPathfinding.Pathfinding = function() {

	var Values = gm.Sample.FloaterPathfinding.Values;
	var ToyWorld = gm.Sample.FloaterPathfinding.ToyWorld;
	var combinedMap = new gm.Ai.CombinedMap(ToyWorld._level._layers);

	var startBody = ToyWorld._startEntity._body;
	var endBody = ToyWorld._endEntity._body;
	var camera = ToyWorld._camera;

	var Pathfinding = {};

	var tilePathSearch, tilePathSearchRenderer;

	Pathfinding.startSearch = function() {
		combinedMap.fromLayers(ToyWorld._level._layers);

		tilePathSearch = new gm.Ai.Floater.TilePathSearch(
			combinedMap, 
			combinedMap.posToTileX(startBody._x), 
			combinedMap.posToTileY(startBody._y), 
			combinedMap.posToTileX(endBody._x), 
			combinedMap.posToTileY(endBody._y), 
			Math.ceil(startBody._sizeX / combinedMap._map.tilesize), 
			Math.ceil(startBody._sizeY / combinedMap._map.tilesize));
		tilePathSearchRenderer = new gm.Debug.Renderer.Ai.Floater.TilePathSearch(tilePathSearch);
	};

	Pathfinding.step = function() {
		tilePathSearch.step();
	};

	var bbox = {};
	Pathfinding.render = function(ctx) {
		ToyWorld._camera._body.getBbox(bbox);
		if (tilePathSearchRenderer) tilePathSearchRenderer.render(ctx, 0, 0, bbox);
	};

	return Pathfinding;

}();