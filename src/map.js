gm.Map = function(params) {
	var map = this;
	
	map._tilesX = 0;
	map._tilesY = 0;
	map.tilesize = 0;
	
	map._tiles = [];

	map.listener = undefined;

	if (params) map.setParams(params);
};

gm.Map.prototype.onChanged = function() {
	if (LOGGING) {
		if (isNaN(this._tilesX) || isNaN(this._tilesY) || isNaN(this.tilesize)) {
			console.log("!!! map - tilesX:", this._tilesX, "tilesY:", this._tilesY, ", tilesize", this.tilesize);
			var err = new Error();
			console.log(err.stack);
		}
	}
	if (this.listener) this.listener.onMapChanged();
};

gm.Map.prototype.setParams = function(params) {

	var map = this;
	
	if (params.tiles) {
		if (params.tilesX !== undefined) map._tilesX = params.tilesX;
		if (params.tilesY !== undefined) map._tilesY = params.tilesY;
		map._tiles = params.tiles;
	}
	else {
		if ((params.tilesX !== undefined && params.tilesX !== map._tilesX) ||
			(params.tilesY !== undefined && params.tilesY !== map._tilesY)) {
			map.resize(params.tilesX, params.tilesY);
		}
	}
	if (params.tilesize !== undefined) map.tilesize = params.tilesize;
	
	map.onChanged();
};

gm.Map.prototype.posToTile = function(x, y, res) {
	res.tx = Math.floor(x / this.tilesize);
	res.ty = Math.floor(y / this.tilesize);
};

gm.Map.prototype.tileToPos = function(tx, ty, res) {
	res.x = tx * this.tilesize;
	res.y = ty * this.tilesize;
};

gm.Map.prototype.clampTile = function(tx, ty, res) {
	res.tx = Math.min(Math.max(0, tx), this._tilesX);
	res.ty = Math.min(Math.max(0, ty), this._tilesY);
};

gm.Map.prototype.clampTileDim = function(td, dim) {
	if (dim === gm.Constants.Dim.X) return Math.min(Math.max(td, 0), this._tilesX);
	else return Math.min(Math.max(td, 0), this._tilesY);
};

gm.Map.prototype.inRange = function(tx, ty) {
	return tx >= 0 && tx < this._tilesX &&
		ty >= 0 && ty < this._tilesY;
};

gm.Map.prototype.tileAt = function(tx, ty) {
	return this._tiles[ty * this._tilesX + tx];
};

gm.Map.prototype.fill = function(val, x0, y0, x1, y1) {
	var map = this;
	
	var sizeX = map._tilesX;
	var sizeY = map._tilesY;
	var tiles = map._tiles;

	if (x0 === undefined || y0 === undefined || x1 === undefined || y1 === undefined) {
		x0 = 0;
		y0 = 0;
		x1 = map._tilesX;
		y1 = map._tilesY;
	}

	x0 = Math.min(Math.max(x0, 0), sizeX);
	x1 = Math.min(Math.max(x1, 0), sizeX);
	y0 = Math.min(Math.max(y0, 0), sizeY);
	y1 = Math.min(Math.max(y1, 0), sizeY);

	var ti;
	for (var y = y0; y < y1; y++) {
		for (var x = x0; x < x1; x++) {
			ti = y * map._tilesX + x;
			tiles[ti] = val;
		}
	}

	map.onChanged();
};

gm.Map.prototype.setTile = function(tx, ty, val) {
	this._tiles[ty * this._tilesX + tx] = val;
	this.onChanged();
};

gm.Map.prototype.resize = function(nsx, nsy, repeat) {
	var map = this;

	var ntiles = [];
	var otiles = map._tiles;

	var osx = map._tilesX,
		osy = map._tilesY;

	var to, tn;
	for (var ty = 0; ty < nsy; ty++) {
		for (var tx = 0; tx < nsx; tx++) {
			if (repeat) to = (ty % osy) * osy + (tx % osx);
			else to = ty * osy + tx;
			tn = ty * nsx + tx;
			ntiles[tn] = otiles[to];
		}
	}
	map._tilesX = nsx;
	map._tilesY = nsy;
	map._tiles = ntiles;

	map.onChanged();
};

gm.Map.prototype.copyArea = function(cmap, tstx, tsty, ctstx, ctsty, tszx, tszy, onlyContent) {
	var tx, ty, ctx, cty;

	var map = this;

	var tiles = map._tiles;
	var ctiles = cmap._tiles;
	var tilesX = map._tilesX;
	var ctilesX = cmap._tilesX;

	// out of bounds
	if (tstx > map._tilesX || tsty > map._tilesY || 
		ctstx > cmap._tilesX || ctsty > cmap._tilesY) return;

	// clamp to both maps
	if (tstx < 0) {
		tszx += tstx;
		ctstx -= tstx;
		tstx = 0;
	}
	if (tsty < 0) {
		tszy += tsty;
		ctsty -= tsty;
		tsty = 0;
	}
	if (ctstx < 0) {
		tszx += ctstx;
		tstx -= ctstx;
		ctstx = 0;
	}
	if (ctsty < 0) {
		tszy += ctsty;
		tsty -= ctsty;
		ctsty = 0;
	}
	
	tszx = Math.min(cmap._tilesX - ctstx, Math.min(map._tilesX - tstx, tszx));
	tszy = Math.min(cmap._tilesY - ctsty, Math.min(map._tilesY - tsty, tszy));

	// copy viable area
	for (var toy = 0; toy < tszy; toy++) {
		ty = tsty + toy;
		cty = ctsty + toy;
		for (var tox = 0; tox < tszx; tox++) {
			tx = tstx + tox;
			ctx = ctstx + tox;
			if (!onlyContent || ctiles[cty * ctilesX + ctx] !== undefined) {
				tiles[ty * tilesX + tx] = ctiles[cty * ctilesX + ctx];
			}
		}
	}

	map.onChanged();
};