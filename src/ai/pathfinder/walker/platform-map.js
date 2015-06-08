if (!gm.Pathfinder.Walker) gm.Pathfinder.Walker = {};

gm.Pathfinder.Walker.PlatformMap = function() {

	var PlatformMap = function(walkerParams, combinedMap) {
		this._walkerParams = walkerParams;

		this._platforms = [];

		this._map = new gm.Map({
			tilesX: 0,
			tilesY: 0,
			tilesize: 0
		});
		this._renderer = new gm.Renderer.PlatformMap(this._map);
		if (combinedMap) this.fromCombinedMap(combinedMap);

		if (LOGGING) {
			if (isNaN(walkerParams.sizeX) || isNaN(walkerParams.sizeY)) {
				console.log("!!! PlatformMap - body dimensions were", sizeX, ",", walkerParams.sizeY);
			}
			
			if (isNaN(walkerParams.walkSpd)) {
				console.log("!!! PlatformMap - walkSpd was", walkerParams.walkSpd);
			}
			
			if (isNaN(walkerParams.jumpSpd)) {
				console.log("!!! PlatformMap - jumpSpd was", walkerParams.jumpSpd);
			}

			if (isNaN(walkerParams.fallAccel)) {
				console.log("!!! PlatformMap - fallAccel was", walkerParams.fallAccel);
			} else if (walkerParams.fallAccel <= 0) {
				console.log("!!! fallAccel", walkerParams.fallAccel, "<= 0. this will have unexpected results");
			}
			
			if (isNaN(walkerParams.terminalV)) {
				console.log("!!! PlatformMap - terminalV was", walkerParams.terminalV);
			}
		}
	};

	PlatformMap._Platform = function(tx0, tx1, ty) {
		this._tx0 = tx0;
		this._tx1 = tx1;
		this._ty = ty;

		this._pxli = -1;
		this._pxri = -1;

		this._reachable = {};
		this._index = -1;
	};

	PlatformMap.prototype.extendPlatformLeft = function(platform, pxli) {
		if (this._map.tileToPosX(platform._tx0) < pxli) return;
		platform._pxli = pxli;
	};

	PlatformMap.prototype.extendPlatformRight = function(platform, pxri) {
		if (this._map.tileToPosX(platform._tx1) > pxri) return;
		platform._pxri = pxri;
	};

	PlatformMap.prototype.newPlatformObject = function(tx0, tx1, ty) {
		var platform = new PlatformMap._Platform(tx0, tx1, ty);
		this.extendPlatformLeft(platform, this._map.tileToPosX(platform._tx0));
		this.extendPlatformRight(platform, this._map.tileToPosX(platform._tx1));
		return platform;
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

	PlatformMap.prototype.addPlatform = function(platform) {
		if (this._platforms.indexOf(platform) >= 0) return;

		platform._index = this._platforms.length;
		this._platforms.push(platform);
		
		for (var tx = platform._tx0; tx < platform._tx1; tx++) {
			this._map.setTile(tx, ty, platform);
		}
	};

	PlatformMap.prototype.addReachableLink = function(originPlatform, reachedPlatform, patch) {
		var patches = originPlatform._reachable[reachedPlatform._index];
		if (!patches) {
			patches = originPlatform._reachable[reachedPlatform._index] = [];
		}
		patches.push(patch);
	};

	PlatformMap.prototype.fromCombinedMap = function(combinedMap) {
		this._combinedMap = combinedMap;
		var cmap = combinedMap._map;
		var tilesize = cmap.tilesize;

		this._map.resize(cmap._tilesX, cmap._tilesY);
		this._map.tilesize = tilesize;
		this._platforms.length = 0;

		gm.Pathfinder.Walker.PlatformGenerator.generatePlatforms(this);
		gm.Pathfinder.Walker.PlatformScanner.scanPlatforms(this);
	};

	PlatformMap.prototype.render = function(ctx, bbox) {
		var tilesize = this._map.tilesize;
		this._renderer.render(ctx, this._combinedMap._oftx * tilesize, this._combinedMap._ofty * tilesize, bbox);
	};

	var obbox = {};
	var tbbox = {};
	PlatformMap.prototype.getPlatformUnderBody = function(body) {

		var platformMap = this._map;
		var tilesize = this._map.tilesize;
		var bbox = body.getBbox();
		var oftx = this._combinedMap._oftx, 
			ofty = this._combinedMap._ofty;

		obbox.x0 = bbox.x0 + (oftx * tilesize);
		obbox.y0 = bbox.y0 + (ofty * tilesize);
		obbox.x1 = bbox.x1 + (oftx * tilesize);
		obbox.y1 = bbox.y1 + (ofty * tilesize);
		
		platformMap.getOverlappingTileBbox(obbox, tbbox);

		var platform;
		for (var ty = tbbox.ty1; ty < platformMap._tilesY; ty++) {
			for (var tx = tbbox.tx0; tx < tbbox.tx1; tx++) {
				platform = platformMap.tileAt(tx, ty);
				if (platform) return platform;
			}
		}
	};

	return PlatformMap;

}();