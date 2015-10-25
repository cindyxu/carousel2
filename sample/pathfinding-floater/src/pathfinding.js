gm.Sample.FloaterPathfinding.Pathfinding = function() {

	var values = gm.Sample.FloaterPathfinding.values;
	var ToyWorld = gm.Sample.FloaterPathfinding.ToyWorld;
	var combinedMap = new gm.Ai.CombinedMap(ToyWorld._level._layers);

	var startBody = ToyWorld._startEntity._body;
	var endBody = ToyWorld._endEntity._body;
	var camera = ToyWorld._camera;

	var Pathfinding = {};

	Pathfinding.startSearch = function() {
	};

	Pathfinding.step = function() {
	};

	Pathfinding.render = function(ctx) {
		var bbox = ToyWorld._camera._body.getBbox();
	};

	return Pathfinding;

}();