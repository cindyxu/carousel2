gm.Ai.Floater.PathSearch = function() {

	var Dir = gm.Constants.Dir;

	var PathSearch = function(combinedMap, tx0, ty0, tx1, ty1, tilesX, tilesY) {
		this._tilePathSearch = new gm.Ai.Floater.TilePathSearch(combinedMap, tx0, ty0, tx1, ty1, tilesX, tilesY);
		this._smoothPath = undefined;
		this._path = undefined;
	};

	PathSearch.prototype.step = function() {
		// if (this._tilePathSearch) {
		// 	if (!this._tilePathSearch.step()) {
		// 		if (this._tilePathSearch._path) {
		// 			var tunedPath = gm.Ai.Floater.TunePath.tune();
		// 			this._smoothPath = new gm.Ai.Floater.SmoothPath(tunedPath);
		// 		}
		// 	}
		// } else if (this._smoothPath) {
		// 	if (!this._smoothPath.step()) {

		// 	}
		// }
		return false;
	};

	return PathSearch;

}();