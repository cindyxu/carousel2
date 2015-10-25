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

		if (this._openNodes.length === 0) return false;

		var map = this._combinedMap._map;

		this._openNodes.sort(this._sortFunction);
		var node = this._openNodes.shift();
		this._closedNodes[node._tx * map._tilesX + node._ty] = true;

		//left
		var ltx = node._tx-1;
		var lty = node._ty;
		var ltile = map.tileAt(ltx, lty);

		if (!this._closedNodes[ltx * map._tilesX + lty]) {
			var lclear = true;
			for (var li = 0; li < this._tilesY; li++) {
				lclear = lclear && !(map.tileAt(ltx, lty+li) & Dir.RIGHT);
			}
			if (lclear) {
				this._openNodes.push(this._createNode(ltx, lty, node));
				if (LOGGING) {
					console.log("%%%%%%%%% add left node %%%%%%%%%");
					console.log("tx:", ltx);
					console.log("ty:", lty);
				}
			}
		}

		//right
		var rtx = node._tx+1;
		var rty = node._ty;
		var rtile = map.tileAt(rty, rty);
		if (!this._closedNodes[rtx * map._tilesX + rty]) {
			var rclear = true;
			for (var ri = 0; ri < this._tilesY; ri++) {
				rclear = rclear && !(map.tileAt(rtx, rty+ri) & Dir.LEFT);
			}
			if (rclear) {
				this._openNodes.push(this._createNode(rtx, rty, node));
				if (LOGGING) {
					console.log("%%%%%%%%% add right node %%%%%%%%%");
					console.log("tx:", rtx);
					console.log("ty:", rty);
				}
			}
		}
		
		//up
		var utx = node._tx;
		var uty = node._ty-1;
		var utile = map.tileAt(utx, uty);
		
		if (!this._closedNodes[utx * map._tilesX + uty]) {
			var uclear = true;
			for (var ui = 0; ui < this._tilesX; ui++) {
				uclear = uclear && !(map.tileAt(utx+ui, uty) & Dir.DOWN);
			}
			if (uclear) {
				this._openNodes.push(this._createNode(utx, uty, node));
				if (LOGGING) {
					console.log("%%%%%%%%% add above node %%%%%%%%%");
					console.log("tx:", utx);
					console.log("ty:", uty);
				}
			}
		}
		
		//down
		var dtx = node._tx;
		var dty = node._ty+1;
		var dtile = map.tileAt(dtx, dty);

		var dclear = true;
		if (!this._closedNodes[dtx * map._tilesX + dty]) {
			for (var di = 0; di < this._tilesX; di++) {
				dclear = dclear && !(map.tileAt(dtx+di, dty) & Dir.UP);
			}
			if (dclear) {
				this._openNodes.push(this._createNode(dtx, dty, node));
				if (LOGGING) {
					console.log("%%%%%%%%% add below node %%%%%%%%%");
					console.log("tx:", dtx);
					console.log("ty:", dty);
				}
			}
		}

		return true;
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

	// TilePathSearch.prototype.optimizeNodeDisplacements = function(path) {

	// 	// end node
	// 	var tx1 = combinedMap.posToTileX(this._x1);
	// 	var ty1 = combinedMap.posToTileY(this._y1);

	// 	var tpx1 = this._combinedMap.tileToPosX(tx1);
	// 	var dispX = tpx1 - this._x1;
	// 	var tpy1 = this._combinedMap.tileToPosY(ty1);
	// 	var dispY = tpy1 - this._y1;

	// 	var endNode = path[path.length-1];
	// 	endNode.assignDisp(dispX, dispY);

	// 	// corner nodes
	// 	var closestCorners = [];
	// 	var prevCorner;
	// 	var nextCorner;
	// 	for (var i = 1; i < path.length - 1; i++) {
	// 		var node = path[i];
	// 		var prevNode = path[i-1];
	// 		var nextNode = path[i+1];
	// 	}
	// };

	// TilePathSearch.prototype._smoothPath = function(path) {
	// 	var smoothPath = [];
	// 	var i = 0;
	// 	while (i < path.length) {
	// 		var node = path[i];
	// 		smoothPath.push(node);
	// 		while(true) {
	// 			i++;
	// 			if (i >= path.length || !this._shortcutClear(node, path[i])) {
	// 				break;
	// 			}
	// 		}
	// 	}
	// 	return smoothPath;
	// };

	// TilePathSearch.prototype._shortcutClear = function(node0, node1) {
	// 	return (this._nextCollisionX(node0, node1) && this._shortcutClearY(node0, node1));
	// };

	// TilePathSearch.prototype._nextCollisionX = function(node0, node1) {
		
	// 	var dispX = this._dispFromTileX();
	// 	var dispY = this._dispFromTileY();

	// 	var tx0 = node0._tx;
	// 	var tx1 = node1._tx;

	// 	var ty0 = node0._ty;
	// 	var ty1 = node1._ty;

	// 	var tx;
	// 	if (tx1 !== tx0) {
	// 		var x0 = this._combinedMap.tileToPosX(tx0) + dispX;
	// 		var x1 = this._combinedMap.tileToPosX(tx1) + dispX;

	// 		var yt0 = this._combinedMap.tileToPosX(ty0) + dispY;
	// 		var yb0 = yt0 + this._sizeY;

	// 		var vslope = (ty1 - ty0) / (tx1 - tx0);
			
	// 		if (tx0 < tx1) {
	// 			x0 += this._sizeX;
	// 			x1 += this._sizeX;
	// 		}

	// 		for (tx = tx0; tx !== tx1; (tx < tx1 ? tx++ : tx--)) {
	// 			var xsect = this._combinedMap.tileToPosX(tx);
	// 			var ytsect = yt0 + (xsect - x0) * vslope;
	// 			var ybsect = yb0 + (xsect - x0) * vslope;

	// 			var ttysect = this._combinedMap.posToTileY(ytsect);
	// 			var tbysect = this._combinedMap.posToTileY(ybsect);

	// 			var collideSide = (tx0 < tx1 ? LEFT : RIGHT);
	// 			for (var tysect = ttysect; tysect < tbysect; tysect++) {
	// 				if (this._combinedMap.tileAt(xsect, tysect) & collideSide) {
	// 					return false;
	// 				}
	// 			}
	// 		}
	// 	}
	// 	return true;
	// };

	return TilePathSearch;

}();