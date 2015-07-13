gm.Pathfinding = function(layers) {

	this._combinedMap = new gm.Ai.CombinedMap(layers);
	this._platformMap = new gm.Ai.PlatformMap(this._combinedMap);

};