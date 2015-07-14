gm.Ai.ObservedPlatformMap = function() {
	
	var Reachable = gm.Ai.Reachable;

	var ObservedPlatformMap = function(platformMap, cameraBody) {
		gm.PosMapTile.call(this, new gm.Map({
			tilesX: 0,
			tilesY: 0,
			tilesize: 0
		}));

		this._platforms = [];

		this._cameraBody = cameraBody;

		this._lastX = undefined;
		this._lastY = undefined;

		this._platformMap = platformMap;
		this._platformMap.addListener(this);

		this._listener = undefined;

		this._generateMap();

		this._renderer = new gm.Ai.ObservedPlatformMap.Renderer(this._map);
	};

	ObservedPlatformMap.prototype = Object.create(gm.PosMapTile.prototype);

	ObservedPlatformMap.prototype.setListener = function(listener) {
		this._listener = listener;
	};

	ObservedPlatformMap.prototype._generateMap = function() {
		var pmap = this._platformMap._map;
		this._map.resize(pmap._tilesX, pmap._tilesY);
		this._map.tilesize = pmap.tilesize;
		
		this._ptx = this._platformMap._ptx;
		this._pty = this._platformMap._pty;
	};

	ObservedPlatformMap.prototype.observe = function() {
		var bbox = this._cameraBody.getBbox();

		if (this._lastX === undefined || this._lastY === undefined) {
			this._observeAll(bbox);
		} 
		else {
			var dx = bbox.x0 - this._lastX;
			var dy = bbox.y0 - this._lastY;
			this._observeDelta(bbox, dx, dy);

		}
		this._lastX = bbox.x0;
		this._lastY = bbox.y0;
	};

	// only works with small dx/dy, otherwise 
	// the observed space is oversized
	var tbbox = {};
	var tb = {};
	ObservedPlatformMap.prototype._observeDelta = function(bbox, dx, dy) {
		
		this.translateBboxToLocal(bbox, abbox);
		tbbox.x0 = abbox.x0 - dx;
		tbbox.y0 = abbox.y0 - dy;
		tbbox.x1 = abbox.x1 - dx;
		tbbox.y1 = abbox.y1 - dy;
		var seenPlatforms = [];

		this._getDeltaNinePatch(tbbox, abbox, tb);

		var tx0, tx1, ty0, ty1;
		var tx, ty;
		
		if (dx > 0) {
			tx0 = tb.tx1;
			tx1 = tb.tx2;
		} else {
			tx0 = tb.tx0;
			tx1 = tb.tx1;
		}
		ty0 = tb.ty0;
		ty1 = tb.ty2;
		
		for (tx = tx0; tx < tx1; tx++) {
			for (ty = ty0; ty < ty1; ty++) {
				this._observePlatform(tx, ty, seenPlatforms);
			}
		}
		
		if (dy > 0) {
			ty0 = tb.ty1;
			ty1 = tb.ty2;
		} else {
			ty0 = tb.ty0;
			ty1 = tb.ty1;
		}
		tx0 = tb.tx0;
		tx1 = tb.tx2;
		
		for (tx = tx0; tx < tx1; tx++) {
			for (ty = ty0; ty < ty1; ty++) {
				this._observePlatform(tx, ty, seenPlatforms);
			}
		}

		if (this._listener && seenPlatforms.length > 0) {
			this._listener.onPlatformsSeen(abbox, seenPlatforms);
		}
	};

	ObservedPlatformMap.prototype._getDeltaNinePatch = function(tbbox, abbox, res) {
		var dx = abbox.x0 - tbbox.x0;
		var dy = abbox.y0 - tbbox.y0;
		if (dx > 0) {
			res.tx0 = this._map.clampTileX(this.posToTileX(tbbox.x0));
			res.tx1 = this._map.clampTileX(this.posToTileCeilX(tbbox.x1));
			res.tx2 = this._map.clampTileX(this.posToTileCeilX(abbox.x1));
		} else {
			res.tx0 = this._map.clampTileX(this.posToTileX(abbox.x0));
			res.tx1 = this._map.clampTileX(this.posToTileX(tbbox.x0));
			res.tx2 = this._map.clampTileX(this.posToTileCeilX(tbbox.x1));
		}
		if (dy > 0) {
			res.ty0 = this._map.clampTileY(this.posToTileY(tbbox.y0));
			res.ty1 = this._map.clampTileY(this.posToTileCeilY(tbbox.y0));
			res.ty2 = this._map.clampTileY(this.posToTileCeilY(abbox.y1));
		} else {
			res.ty0 = this._map.clampTileY(this.posToTileY(abbox.y0));
			res.ty1 = this._map.clampTileY(this.posToTileY(tbbox.y0));
			res.ty2 = this._map.clampTileY(this.posToTileCeilY(tbbox.y1));
		}
	};

	var ltpres = {};
	var brpres = {};
	var abbox = {};
	var lbbox = {};
	ObservedPlatformMap.prototype._observeAll = function(bbox) {

		this.translateBboxToLocal(bbox, abbox);

		this.posToTile(abbox.x0, abbox.y0, ltpres);
		this._map.clampTile(ltpres.tx, ltpres.ty, ltpres);
		
		this.posToTileCeil(abbox.x1, abbox.y1, brpres);
		this._map.clampTile(brpres.tx, brpres.ty, brpres);

		var seenPlatforms = [];
		var platform;

		for (var ty = ltpres.ty; ty < brpres.ty; ty++) {
			for (var tx = ltpres.tx; tx < brpres.tx; tx++) {
				this._observePlatform(tx, ty, seenPlatforms);
			}
		}

		if (this._listener && seenPlatforms.length > 0) {
			this._listener.onPlatformsSeen(abbox, seenPlatforms);
		}
	};

	ObservedPlatformMap.prototype._observePlatform = function(tx, ty, seenPlatforms) {
		
		platform = this._platformMap._map.tileAt(tx, ty);

		this._map.setTile(tx, ty, platform);
		if (platform && this._platforms.indexOf(platform) < 0) {
			this._platforms.push(platform);
		}
		if (platform && seenPlatforms.indexOf(platform) < 0) {
			seenPlatforms.push(platform);
		}
	};

	ObservedPlatformMap.prototype.onPlatformMapUpdated = function() {
		this._hasObserved = false;
	};

	var pres = {};
	ObservedPlatformMap.prototype.render = function(ctx, bbox) {
		this.tileToPos(0, 0, pres);
		this._renderer.render(ctx, pres.x, pres.y, bbox);
	};

	return ObservedPlatformMap;

}();