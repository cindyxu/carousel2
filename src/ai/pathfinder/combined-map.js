if (!gm.Pathfinder) gm.Pathfinder = {};

/* combines all collision maps in the level
 * by ORing their tiles together. 
 */
gm.Pathfinder.CombinedMap = function(layers) {
	this._map = new gm.Map({
		tilesX: 0,
		tilesY: 0,
		tilesize: 0
	});

	this._oftx = 0;
	this._ofty = 0;

	this._listeners = [];

	if (layers) this.fromLayers(layers);
};

gm.Pathfinder.CombinedMap.prototype.addListener = function(listener) {
	if (this._listeners.indexOf(listener) < 0) this._listeners.push(listener);
};

gm.Pathfinder.CombinedMap.prototype.removeListener = function(listener) {
	var i = this._listeners.indexOf(listener);
	if (i >= 0) this._listeners.splice(i, 1);
};

gm.Pathfinder.CombinedMap.prototype.fromLayers = function(layers) {
	if (layers.length > 0) {
		this._generateCombinedMap(layers);
	} else {
		this._reset();
	}
};

gm.Pathfinder.CombinedMap.prototype._reset = function() {
	this._oftx = this._ofty = 0;
	this._map.resize(0, 0);
};

gm.Pathfinder.CombinedMap.prototype._setupCombinedMap = function(layers) {
	this._reset();

	var tilesX = 0;
	var tilesY = 0;

	var layer, layerMap, map;
	var otx, oty;
	var l;

	for (l = 0; l < layers.length; l++) {
		layer = layers[l];
		layerMap = layer._layerMap;
		map = layerMap._map;

		otx = layerMap._offsetX / map.tilesize;
		oty = layerMap._offsetY / map.tilesize;

		this._oftx = Math.min(otx, this._oftx);
		tilesX = Math.max(map._tilesX, otx + tilesX);
		this._ofty = Math.min(oty, this._ofty);
		tilesY = Math.max(map._tilesY, oty + tilesY);
	}

	this._map.resize(tilesX, tilesY);
	this._map.tilesize = map.tilesize;
};

gm.Pathfinder.CombinedMap.prototype._generateCombinedMap = function(layers) {

	this._setupCombinedMap(layers);

	for (l = 0; l < layers.length; l++) {
		layer = layers[l];
		layerMap = layer._layerMap;
		map = layerMap._map;

		for (ty = 0; ty < map._tilesY; ty++) {
			for (tx = 0; tx < map._tilesX; tx++) {
				var ctile = this._map.tileAt(tx, ty);
				var otile = map.tileAt(this._oftx + tx, this._ofty + ty);
				if (ctile !== undefined || otile !== undefined) {
					this._map.setTile(tx, ty, ctile | otile);
				}
			}
		}
	}
};

gm.Pathfinder.CombinedMap.prototype.posToTile = function(x, y, res) {
	var combinedMap = this._map;
	var offsetX = this._oftx * combinedMap.tilesize;
	var offsetY = this._ofty * combinedMap.tilesize;

	combinedMap.posToTile(x - offsetX, y - offsetY, res);
};

gm.Pathfinder.CombinedMap.prototype.tileToPos = function(tx, ty, res) {
	var combinedMap = this._map;
	var offsetX = this._oftx * combinedMap.tilesize;
	var offsetY = this._ofty * combinedMap.tilesize;
	
	combinedMap.tileToPos(tx, ty, res);
	res.x += offsetX;
	res.y += offsety;
};