gm.NavGrid = function() {

	this._platformMap = new gm.Map({
		tilesX: 0,
		tilesY: 0,
		tilesize: 0
	});

	this._combinedLayerMap = new gm.LayerMap(new gm.Map({
		tilesX: 0,
		tilesY: 0,
		tilesize: 0
	}));

	this._platforms = [];

	this._tx = 0;
	this._ty = 0;

	this._listeners = [];
	
	this._renderer = new gm.Renderer.PlatformMap(this._platformMap);
};

gm.NavGrid.prototype.addListener = function(listener) {
	if (this._listeners.indexOf(listener) < 0) this._listeners.push(listener);
};

gm.NavGrid.prototype.removeListener = function(listener) {
	var i = this._listeners.indexOf(listener);
	if (i >= 0) this._listeners.splice(i, 1);
};

gm.NavGrid.prototype.fromLayers = function(layers) {
	if (layers.length > 0) {
		this._generateCombinedLayerMap(layers);
		this._generatePlatformMap();
	} else {
		this.reset();
	}
};

gm.NavGrid.prototype.reset = function() {
	this._tx = this._ty = 0;
	this._platformMap.resize(0, 0);
	this._platforms.length = 0;
};

gm.NavGrid.prototype._generateCombinedLayerMap = function(layers) {

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

	var combinedMap = this._combinedLayerMap._map;

	combinedMap.resize(tilesX, tilesY);
	combinedMap.tilesize = map.tilesize;

	this._fillCombinedMap(tx, ty, layers);

	this._combinedLayerMap.setParams({
		offsetX: tx * map.tilesize, 
		offsetY: ty * map.tilesize
	});
};

gm.NavGrid.prototype._fillCombinedMap = function(tx, ty, layers) {
	var combinedMap = this._combinedLayerMap._map;

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
					combinedMap.setTile(tx, ty, ctile | otile);
				}
			}
		}
	}
};

gm.NavGrid.prototype.posToTile = function(x, y, res) {
	var platformMap = this._platformMap;
	var offsetX = this._tx * platformMap.tilesize;
	var offsetY = this._ty * platformMap.tilesize;

	platformMap.posToTile(x - offsetX, y - offsetY, res);
};

gm.NavGrid.prototype.tileToPos = function(tx, ty, res) {
	var platformMap = this._platformMap;
	var offsetX = this._tx * platformMap.tilesize;
	var offsetY = this._ty * platformMap.tilesize;
	
	platformMap.tileToPos(tx, ty, res);
	res.x += offsetX;
	res.y += offsety;
};

gm.NavGrid.prototype._generatePlatformMap = function() {

	var combinedLayerMap = this._combinedLayerMap;
	var combinedMap = combinedLayerMap._map;
	var tilesize = combinedMap.tilesize;

	this._tx = combinedLayerMap._offsetX / tilesize;
	this._ty = combinedLayerMap._offsetY / tilesize;

	this._platformMap.resize(combinedMap._tilesX, combinedMap._tilesY);
	this._platformMap.tilesize = tilesize;

	this._platforms.length = 0;

	var platformMap = this._platformMap;
	var pstart = -1;
	var ptile;
	for (var ty = 0; ty < platformMap._tilesY; ty++) {
		for (var tx = 0; tx < platformMap._tilesX; tx++) {

			var ntile = combinedMap.tileAt(tx, ty);

			var shouldFinishPlatform = (pstart >= 0 && !(ntile & gm.Constants.Dir.UP));
			if (shouldFinishPlatform) {
				this._addNewPlatform(pstart, tx, ty);
				pstart = -1;
			}

			if (ntile && pstart < 0) {
				pstart = tx;
				ptile = combinedMap.tileAt(tx, ty);
			}
		}

		if (pstart >= 0) {
			this._addNewPlatform(pstart, platformMap._tilesX, ty);
			pstart = -1;
		}
	}
};

var obbox = {};
var tbbox = {};
gm.NavGrid.prototype.getPlatformUnderBody = function(body) {

	var platformMap = this._platformMap;
	var tilesize = this._platformMap.tilesize;
	var bbox = body.getBbox();

	obbox.x0 = bbox.x0 + (this._tx * tilesize);
	obbox.y0 = bbox.y0 + (this._ty * tilesize);
	obbox.x1 = bbox.x1 + (this._tx * tilesize);
	obbox.y1 = bbox.y1 + (this._ty * tilesize);
	
	platformMap.getOverlappingTileBbox(obbox, tbbox);

	var platform;
	for (var ty = tbbox.ty1; ty < platformMap._tilesY; ty++) {
		for (var tx = tbbox.tx0; tx < tbbox.tx1; tx++) {
			platform = platformMap.tileAt(tx, ty);
			if (platform) return platform;
		}
	}
};

gm.NavGrid.prototype._addNewPlatform = function(tx0, tx1, ty) {
	var platform = {
		tx0: tx0,
		tx1: tx1,
		ty: ty,
		index: this._platforms.length + 1
	};
	this._platforms.push(platform);
	for (var tx = tx0; tx < tx1; tx++) {
		this._platformMap.setTile(tx, ty, platform);
	}
};

gm.NavGrid.prototype.render = function(ctx, bbox) {
	var tilesize = this._platformMap.tilesize;
	this._renderer.render(ctx, this._tx * tilesize, this._ty * tilesize, bbox);
};