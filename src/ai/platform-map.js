if (!gm.Ai) gm.Ai = {};

gm.Ai.PlatformMap = function() {

	var PlatformMap = function(body, kinematics, combinedMap) {

		gm.PosMapTile.call(this, new gm.Map({
			tilesX: 0,
			tilesY: 0,
			tilesize: 0
		}));

		this._platforms = [];
		this._listeners = [];

		this._body = body;
		this._kinematics = kinematics;
		if (combinedMap !== undefined) {
			this.setCombinedMap(combinedMap);
		}
		
		this._renderer = new gm.Renderer.PlatformMap(this._map);

		if (LOGGING) {
			if (!body) {
				console.log("!!! PlatformMap - no body");
			} if (!kinematics) {
				console.log("!!! PlatformMap - no kinematics");
			} if (!combinedMap) {
				console.log("!!! PlatformMap - no combined map");
			}
		}
	};

	PlatformMap.prototype = Object.create(gm.PosMapTile.prototype);

	PlatformMap.prototype.setCombinedMap = function(combinedMap) {
		this._combinedMap = combinedMap;
		this._combinedMap.addListener(this);
		this.generateMap();
	};

	PlatformMap.prototype.generateMap = function() {
		this._ptx = this._combinedMap._ptx;
		this._pty = this._combinedMap._pty;

		var cmap = this._combinedMap._map;
		var tilesize = cmap.tilesize;

		this._platforms.length = 0;
		this._map.resize(0, 0);

		this._map.resize(cmap._tilesX, cmap._tilesY);
		this._map.tilesize = tilesize;

		this.setPlatforms(gm.Ai.PlatformGenerator.generatePlatforms(this));

		for (var i = 0; i < this._listeners.length; i++) {
			this._listeners[i].onPlatformMapUpdated();
		}
	};

	PlatformMap._Platform = function(tx0, tx1, ty) {
		this._tx0 = tx0;
		this._tx1 = tx1;
		this._ty = ty;

		this._pxli = -1;
		this._pxri = -1;

		this._index = -1;
	};

	PlatformMap.prototype.newPlatformObject = function(tx0, tx1, ty) {
		var platform = new PlatformMap._Platform(tx0, tx1, ty);
		this.extendPlatformLeft(platform, this._map.tileToPosX(platform._tx0));
		this.extendPlatformRight(platform, this._map.tileToPosX(platform._tx1));
		return platform;
	};

	PlatformMap.prototype.extendPlatformLeft = function(platform, pxli) {
		if (this._map.tileToPosX(platform._tx0) < pxli) return;
		platform._pxli = pxli;
	};

	PlatformMap.prototype.extendPlatformRight = function(platform, pxri) {
		if (this._map.tileToPosX(platform._tx1) > pxri) return;
		platform._pxri = pxri;
	};

	PlatformMap.prototype.setPlatformLeftTile = function(platform, tx0) {
		var ptx0 = tx0;
		platform._tx0 = tx0;
		platform._pxli = platform._tx0 * this._map.tilesize;
		
		var pi = this._platforms.indexOf(platform);
		if (pi >= 0) {
			var map = this._map;
			var tx;
			for (tx = ptx0; tx < tx0; tx++) {
				map.setTile(tx, ty, undefined);
			}
			for (tx = ptx0-1; tx >= tx0; tx--) {
				map.setTile(tx, ty, platform);
			}
		}
	};

	PlatformMap.prototype.setPlatformRightTile = function(platform, tx1) {
		var map = this._map;
		platform._tx1 = tx1;
		platform._pxri = platform._tx1 * map.tilesize;

		var pi = this._platforms.indexOf(platform);
		if (pi >= 0) {
			var tx;
			for (tx = ptx1; tx < tx1; tx++) {
				map.setTile(tx, ty, platform);
			}
			for (tx = ptx1-1; tx >= tx1; tx--) {
				map.setTile(tx, ty, undefined);
			}
		}
	};

	PlatformMap.prototype.splitPlatformAt = function(platform, tx) {
		if (tx < platform._tx0 || tx >= platform._tx1) return;
		var tx1 = platform._tx1;
		this.setPlatformRightTile(platform, tx);
		var nplatform = new PlatformMap._Platform(tx, tx1, platform._ty);
		return nplatform;
	};

	PlatformMap.prototype.setPlatforms = function(platforms) {
		for (var i = 0; i < platforms.length; i++) {
			this.addPlatform(platforms[i]);
		}
		if (LOGGING) console.log("platformmap - have", this._platforms.length, "platforms");
	};

	PlatformMap.prototype.addPlatform = function(platform) {
		if (this._platforms.indexOf(platform) >= 0) return;

		platform._index = this._platforms.length;
		this._platforms.push(platform);
		
		for (var tx = platform._tx0; tx < platform._tx1; tx++) {
			this._map.setTile(tx, platform._ty, platform);
		}
	};

	var pres = {};
	PlatformMap.prototype.render = function(ctx, bbox) {
		var tilesize = this._map.tilesize;
		this.tileToPos(0, 0, pres);
		this._renderer.render(ctx, pres.x, pres.y, bbox);
	};

	var obbox = {};
	PlatformMap.prototype.getPlatformUnderBody = function(body) {

		var platformMap = this._map;
		var tilesize = this._map.tilesize;
		var bbox = body.getBbox();
		
		this.getOverlappingTileBbox(bbox, obbox);

		var platform;
		for (var ty = obbox.ty1; ty < platformMap._tilesY; ty++) {
			for (var tx = obbox.tx0; tx < obbox.tx1; tx++) {
				platform = platformMap.tileAt(tx, ty);
				if (platform) return platform;
			}
		}
	};

	PlatformMap.prototype.addListener = function(listener) {
		if (this._listeners.indexOf(listener) < 0) {
			this._listeners.push(listener);
		}
	};

	PlatformMap.prototype.onCombinedMapUpdated = function() {
		this.generateMap();
	};

	return PlatformMap;

}();
