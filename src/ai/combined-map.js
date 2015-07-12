if (!gm.Ai) gm.Ai = {};

/* combines all collision maps in the level
 * by ORing their tiles together. 
 */
gm.Ai.CombinedMap = function(layers) {
	gm.PosMapTile.call(this, new gm.Map({
		tilesX: 0,
		tilesY: 0,
		tilesize: 0
	}));

	this._listeners = [];
	if (layers) this.fromLayers(layers);
};

gm.Ai.CombinedMap.prototype = Object.create(gm.PosMapTile.prototype);

gm.Ai.CombinedMap.prototype.addListener = function(listener) {
	if (this._listeners.indexOf(listener) < 0) this._listeners.push(listener);
};

gm.Ai.CombinedMap.prototype.removeListener = function(listener) {
	var i = this._listeners.indexOf(listener);
	if (i >= 0) this._listeners.splice(i, 1);
};

gm.Ai.CombinedMap.prototype.fromLayers = function(layers) {
	if (layers.length > 0) {
		this._generateCombinedMap(layers);
	} else {
		this._reset();
	}
};

gm.Ai.CombinedMap.prototype._reset = function() {
	this._ptx = this._pty = 0;
	this._map.resize(0, 0);
};

gm.Ai.CombinedMap.prototype._setupCombinedMap = function(layers) {
	this._reset();

	var tilesX = 0;
	var tilesY = 0;

	var layer, layerMap, map;
	var ptx, pty;
	var l;

	for (l = 0; l < layers.length; l++) {
		layer = layers[l];
		layerMap = layer._layerMap;
		map = layerMap._map;

		ptx = layerMap._offsetX / map.tilesize;
		pty = layerMap._offsetY / map.tilesize;

		this._ptx = Math.min(ptx, this._ptx);
		tilesX = Math.max(map._tilesX, ptx + tilesX);
		this._pty = Math.min(pty, this._pty);
		tilesY = Math.max(map._tilesY, pty + tilesY);
	}

	this._map.resize(tilesX, tilesY);
	this._map.tilesize = map.tilesize;
};

gm.Ai.CombinedMap.prototype._generateCombinedMap = function(layers) {

	this._setupCombinedMap(layers);

	for (l = 0; l < layers.length; l++) {
		layer = layers[l];
		layerMap = layer._layerMap;
		map = layerMap._map;

		for (ty = 0; ty < map._tilesY; ty++) {
			var s = "";
			for (tx = 0; tx < map._tilesX; tx++) {
				var ctile = this._map.tileAt(tx, ty);
				s += ctile + " ";
				var otile = map.tileAt(this._ptx + tx, this._pty + ty);
				if (ctile !== undefined || otile !== undefined) {
					this._map.setTile(tx, ty, ctile | otile);
				}
			}
		}
	}

	for (var i = 0; i < this._listeners.length; i++) {
		this._listeners[i].onCombinedMapUpdated();
	}
};