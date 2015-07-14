gm.Ai.Pathfinding = function(layers) {
	this.onLevelChanged(layers);
};

gm.Ai.Pathfinding.prototype.onLevelChanged = function(layers) {
	this._combinedMap = new gm.Ai.CombinedMap(layers);
	this._platformMap = new gm.Ai.PlatformMap(this._combinedMap);
};