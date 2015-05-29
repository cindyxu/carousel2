var NavGrid = gm.NavGrid = function() {
	this._platformMap = new gm.Map({
		tilesX: 0,
		tilesY: 0,
		tilesize: 0
	});

	this._platforms = [];

	this._tx = 0;
	this._ty = 0;

	this._listeners = [];
	
	this._renderer = new gm.Renderer.PlatformMap(this._platformMap);
};

NavGrid.prototype.addListener = function(listener) {
	if (this._listeners.indexOf(listener) < 0) this._listeners.push(listener);
};

NavGrid.prototype.removeListener = function(listener) {
	var i = this._listeners.indexOf(listener);
	if (i >= 0) this._listeners.splice(i, 1);
};

NavGrid.prototype.fromLayers = function(layers) {
	if (layers.length > 0) {
		var combinedMap = this.generateCombinedLayerMap(layers);
		this.fromCombinedLayerMap(combinedMap);
	} else {
		this.reset();
	}
};

NavGrid.prototype.reset = function() {
	this._tx = this._ty = 0;
	this._platformMap.resize(0, 0);
};

NavGrid.prototype.generateCombinedLayerMap = function(layers) {

	var tx = 0;
	var ty = 0;
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

		tx = Math.min(otx, tx);
		tilesX = Math.max(map._tilesX, otx + tilesX);
		ty = Math.min(oty, ty);
		tilesY = Math.max(map._tilesY, oty + tilesY);
	}

	var combinedMap = new gm.Map({
		tilesX: tilesX,
		tilesY: tilesY,
		tilesize: map.tilesize
	});

	this._fillCombinedMap(combinedMap, tx, ty, layers);

	var combinedLayerMap = new gm.LayerMap({
			offsetX: tx * map.tilesize, 
			offsetY: ty * map.tilesize
		}
	);
	combinedLayerMap.setMap(combinedMap);
	
	return combinedLayerMap;
};

NavGrid.prototype._fillCombinedMap = function(combinedMap, tx, ty, layers) {
	for (l = 0; l < layers.length; l++) {
		layer = layers[l];
		layerMap = layer._layerMap;
		map = layerMap._map;

		tx0 = (layerMap._offsetX / map.tilesize) - tx;
		ty0 = (layerMap._offsetY / map.tilesize) - ty;

		for (ty = 0; ty < map._tilesY; ty++) {
			for (tx = 0; tx < map._tilesX; tx++) {
				var ctile = combinedMap.tileAt(tx, ty);
				var otile = map.tileAt(tx0 + tx, ty0 + ty);
				if (ctile !== undefined || otile !== undefined) {
					combinedMap.set(tx, ty, ctile | otile);
				}
			}
		}
	}
};

NavGrid.prototype.posToTile = function(x, y, res) {
	var platformMap = this._platformMap;
	var offsetX = this._tx * platformMap.tilesize;
	var offsetY = this._ty * platformMap.tilesize;

	platformMap.posToTile(x - offsetX, y - offsetY, res);
};

NavGrid.prototype.tileToPos = function(tx, ty, res) {
	var platformMap = this._platformMap;
	var offsetX = this._tx * platformMap.tilesize;
	var offsetY = this._ty * platformMap.tilesize;
	
	platformMap.tileToPos(tx, ty, res);
	res.x += offsetX;
	res.y += offsety;
};

NavGrid.prototype.fromCombinedLayerMap = function(combinedLayerMap) {

	var combinedMap = combinedLayerMap._map;
	var tilesize = combinedMap.tilesize;

	this._tx = combinedLayerMap._offsetX / tilesize;
	this._ty = combinedLayerMap._offsetY / tilesize;

	this._platformMap.resize(combinedMap._tilesX, combinedMap._tilesY);
	this._platformMap.tilesize = tilesize;

	var platformMap = this._platformMap;
	var pstart = -1;
	for (var ty = 0; ty < platformMap._tilesY; ty++) {
		for (var tx = 0; tx < platformMap._tilesX; tx++) {
			if (combinedMap.tileAt(tx, ty) && (pstart < 0)) {
				pstart = tx;
			} else if (!combinedMap.tileAt(tx, ty) && pstart >= 0) {
				this._addNewPlatform(pstart, tx, ty);
				pstart = -1;
			}
		}
		if (pstart >= 0) {
			this._addNewPlatform(pstart, platformMap._tilesX, ty);
			pstart = -1;
		}
	}
};

NavGrid.prototype._addNewPlatform = function(tx0, tx1, ty) {
	var platform = {
		tx0: tx0,
		tx1: tx1,
		ty: ty
	};
	this._platforms.push(platform);
	for (var tx = tx0; tx < tx1; tx++) {
		this._platformMap.setTile(tx, ty, platform);
	}
};

NavGrid.prototype.render = function(ctx, bbox) {
	var tilesize = this._platformMap.tilesize;
	console.log(tilesize, this._tx, this._ty);
	this._renderer.render(ctx, this._tx * tilesize, this._ty * tilesize, bbox);
};