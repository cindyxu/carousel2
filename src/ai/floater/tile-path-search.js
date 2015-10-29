gm.Ai.Floater.TilePathSearch = function() {

	var Dir = gm.Constants.Dir;

	var _Node = function(tx, ty, parent, gscore, fscore) {
		this._tx = tx;
		this._ty = ty;
		this._parent = parent;
		this._gscore = gscore;
		this._fscore = fscore;
	};

	var TilePathSearch = function(combinedMap, tx0, ty0, tx1, ty1, tilesX, tilesY) {

		this._combinedMap = combinedMap;
		
		this._tx0 = tx0;
		this._ty0 = ty0;
		this._tx1 = tx1;
		this._ty1 = ty1;

		this._tilesX = tilesX;
		this._tilesY = tilesY;

		this._openNodes = [];
		this._openNodes.push(new _Node(tx0, ty0, undefined, 0, this._heuristicFunction(tx0, ty0)));
		this._closedNodes = {};

		this._path = undefined;

		if (LOGGING) {
			console.log("%%%%%%%%% start node %%%%%%%%%");
			console.log("tx:", tx0);
			console.log("ty:", ty0);
		}
	};

	TilePathSearch.prototype._sortFunction = function(n1, n2) {
		return n1._fscore - n2._fscore;
	};

	TilePathSearch.prototype._gscoreFunction = function(tx, ty, parentNode) {
		var dtx = (tx - parentNode._tx);
		var dty = (ty - parentNode._ty);
		return Math.sqrt(dtx*dtx + dty*dty);
	};

	TilePathSearch.prototype._heuristicFunction = function(tx, ty) {
		var dtx = (tx - this._tx1);
		var dty = (ty - this._ty1);
		return Math.sqrt(dtx*dtx + dty*dty);
	};

	TilePathSearch.prototype._createNode = function(tx, ty, parentNode) {
		var gscore = this._gscoreFunction(tx, ty, parentNode);
		var fscore = gscore + this._heuristicFunction(tx, ty);
		return new _Node(tx, ty, parentNode, gscore, fscore);
	};

	TilePathSearch.prototype.step = function() {

		if (LOGGING) {
			console.log("STEP *************************************");
		}

		if (this._path || this._openNodes.length === 0) return false;

		var map = this._combinedMap._map;

		this._openNodes.sort(this._sortFunction);
		var node = this._openNodes.shift();
		this._closedNodes[node._tx * map._tilesX + node._ty] = true;

		if (node._tx === this._tx1 && node._ty === this._ty1) {
			this._path = this._createPath(node);
			return false;
		}

		this._checkNeighbor(node, Dir.LEFT);
		this._checkNeighbor(node, Dir.RIGHT);
		this._checkNeighbor(node, Dir.UP);
		this._checkNeighbor(node, Dir.DOWN);

		return true;
	};

	TilePathSearch.prototype._checkNeighbor = function(node, dir) {
		var map = this._combinedMap._map;

		var ntx = node._tx;
		var nty = node._ty;

		if (dir === Dir.LEFT) ntx--;
		else if (dir === Dir.RIGHT) ntx++;
		else if (dir === Dir.UP) nty--;
		else nty++;

		if (ntx < 0 || ntx >= map._tilesX || nty < 0 || nty >= map._tilesY) return;

		var clear = true;
		var ti;
		if (!this._closedNodes[ntx * map._tilesX + nty]) {
			if (dir === Dir.LEFT || dir === Dir.RIGHT) {
				for (ti = 0; ti < this._tilesY; ti++) {
					clear = clear && !(map.tileAt(ntx, nty+ti) & (dir === Dir.LEFT ? Dir.RIGHT : Dir.LEFT));
				}
			} else {
				for (ti = 0; ti < this._tilesX; ti++) {
					clear = clear && !(map.tileAt(ntx+ti, nty) & (dir === Dir.UP ? Dir.DOWN : Dir.UP));
				}
			}
			if (clear) {
				if (LOGGING) {
					console.log("%%%%%%%%% add node %%%%%%%%%");
					console.log("tx:", ntx);
					console.log("ty:", nty);
				}
				this._openNodes.push(this._createNode(ntx, nty, node));
			}
		}
	};

	TilePathSearch.prototype.createPath = function(node) {
		var path = [];
		var cnode = node;
		while (cnode) {
			path.push(cnode);
			cnode = cnode._parent;
		}
		return path;
	};

	return TilePathSearch;

}();