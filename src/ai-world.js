gm.AiWorld = function(level) {
	this._navGrid = undefined;
	this._level = level;

	this.init();
};

gm.AiWorld.prototype.init = function() {
	this._navGrid = new gm.NavGrid(this._level._layers);
};

gm.AiWorld.prototype.rebuild = function() {
	this._navGrid.rebuild();
};