gm.PosMap = function() {

	var PosMap = function(map) {
		this._map = map;
		this._px = 0;
		this._py = 0;
	};

	PosMap.prototype.posToTile = function(px, py, res) {
		this._map.posToTile(px - this._px, py - this._py, res);
	};

	PosMap.prototype.tileToPos = function(tx, ty, res) {
		this._map.tileToPos(tx, ty, res);
		res.x += this._px;
		res.y += this._py;
	};

	PosMap.prototype.tileToPosX = function(tx) {
		return this._map.tileToPosX(tx) + this._px;
	};

	PosMap.prototype.tileToPosY = function(ty) {
		return this._map.tileToPosY(ty) + this._py;
	};

	PosMap.prototype.translateBboxToLocal = function(bbox, obbox) {
		obbox.x0 = bbox.x0 - this._px;
		obbox.y0 = bbox.y0 - this._py;
		obbox.x1 = bbox.x1 - this._px;
		obbox.y1 = bbox.y1 - this._py;
	};

	var obbox = {};
	PosMap.prototype.getOverlappingTileBbox = function(bbox, res) {
		this.translateBboxToLocal(bbox, obbox);
		this._map.getOverlappingTileBbox(obbox, res);
	};

	return PosMap;

}();
