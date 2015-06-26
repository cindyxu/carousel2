gm.PosMapTile = function() {

	var PosMapTile = function(map) {
		this._map = map;
		this._ptx = 0;
		this._pty = 0;
	};

	PosMapTile.prototype.posToTile = function(px, py, res) {
		var tilesize = this._map.tilesize;
		this._map.posToTile(px - this._ptx*tilesize, py - this._pty*tilesize, res);
	};

	PosMapTile.prototype.posToTileX = function(px) {
		var tilesize = this._map.tilesize;
		return this._map.posToTileX(px - this._ptx*tilesize);
	};

	PosMapTile.prototype.posToTileY = function(py) {
		var tilesize = this._map.tilesize;
		return this._map.posToTileY(py - this._pty*tilesize);
	};

	PosMapTile.prototype.posToTileCeil = function(px, py, res) {
		var tilesize = this._map.tilesize;
		this._map.posToTileCeil(px - this._ptx*tilesize, py - this._pty*tilesize, res);
	};

	PosMapTile.prototype.posToTileCeilX = function(px) {
		var tilesize = this._map.tilesize;
		return this._map.posToTileCeilX(px - this._ptx*tilesize);
	};

	PosMapTile.prototype.posToTileCeilY = function(py) {
		var tilesize = this._map.tilesize;
		return this._map.posToTileCeilY(py - this._pty*tilesize);
	};

	PosMapTile.prototype.tileToPos = function(tx, ty, res) {
		var tilesize = this._map.tilesize;
		this._map.tileToPos(tx, ty, res);
		res.x += this._ptx*tilesize;
		res.y += this._pty*tilesize;
	};

	PosMapTile.prototype.tileToPosX = function(tx) {
		var tilesize = this._map.tilesize;
		return this._map.tileToPosX(tx) + this._ptx*tilesize;
	};

	PosMapTile.prototype.tileToPosY = function(ty) {
		var tilesize = this._map.tilesize;
		return this._map.tileToPosY(ty) + this._pty*tilesize;
	};

	PosMapTile.prototype.translateBboxToWorld = function(bbox, rbbox) {
		var tilesize = this._map.tilesize;
		rbbox.x0 = bbox.x0 + this._ptx*tilesize;
		rbbox.y0 = bbox.y0 + this._pty*tilesize;
		rbbox.x1 = bbox.x1 + this._ptx*tilesize;
		rbbox.y1 = bbox.y1 + this._pty*tilesize;
	};

	PosMapTile.prototype.translateBboxToLocal = function(bbox, rbbox) {
		var tilesize = this._map.tilesize;
		rbbox.x0 = bbox.x0 - this._ptx*tilesize;
		rbbox.y0 = bbox.y0 - this._pty*tilesize;
		rbbox.x1 = bbox.x1 - this._ptx*tilesize;
		rbbox.y1 = bbox.y1 - this._pty*tilesize;
	};

	var obbox = {};
	PosMapTile.prototype.getOverlappingTileBbox = function(bbox, res) {
		this.translateBboxToLocal(bbox, obbox);
		var tilesize = this._map.tilesize;
		this._map.getOverlappingTileBbox(obbox, res);
	};

	return PosMapTile;
}();
