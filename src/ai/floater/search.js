gm.Ai.Floater.PathSearch = function() {

	var _Node = function(tx, ty, dx, dy, parent, gscore, fscore) {
		this._tx = tx;
		this._ty = ty;
		this._parent = parent;
		this._gscore = gscore;
		this._fscore = fscore;
		this._dx = dx;
		this._dy = dy;
	};

	_Node.prototype.assignDisp = function(dx, dy) {
		this._dx = dx;
		this._dy = dy;
	};

	var PathSearch = function(layerMap, x0, y0, x1, y1, sizeX, sizeY) {
		this._layerMap = layerMap;
		this._body = body;
		
		this._x0 = x0;
		this._y0 = y0;
		this._x1 = x1;
		this._y1 = y1;

		this._sizeX = sizeX;
		this._sizeY = sizeY;

		var tx0 = layerMap._posToTileX(x0);
		var ty0 = layerMap._posToTileY(y0);

		var tpx0 = this._layerMap._tileToPosX(tx0);
		var dispX = tpx0 - x0;
		var tpy0 = this._layerMap._tileToPosY(ty0);
		var dispY = tpy0 - y0;

		this._openNodes = [];
		this._openNodes.push(new _Node(tx0, ty0, dispX, dispY, undefined, 0, this._heuristicFunction(tx0, tx1)));
		this._closedNodes = {};
	};

	PathSearch.prototype._sortFunction = function(n1, n2) {
		return n1._fscore - n2._fscore;
	};

	PathSearch.prototype._gscoreFunction = function(tx, ty, parentNode) {
		var dtx = (tx - parentNode._tx);
		var dty = (ty - parentNode._ty);
		return Math.sqrt(dtx*dtx + dty*dty);
	};

	PathSearch.prototype._heuristicFunction = function(tx, ty) {
		var tx1 = this._layerMap._posToTileX(this._x1);
		var ty1 = this._layerMap._posToTileY(this._y1);
		var dtx = (tx - tx1);
		var dty = (ty - ty1);
		return Math.sqrt(dtx*dtx + dty*dty);
	};

	PathSearch.prototype._createNode = function(tx, ty, parentNode) {
		var gscore = this._gscoreFunction(tx, ty, parentNode);
		var fscore = gscore + this._heuristicFunction(tx, ty);
		return new _Node(tx, ty, parentNode._dx, parentNode._dy, parentNode, gscore, fscore);
	};

	PathSearch.prototype.step = function() {

		if (this._openNodes.length === 0) return false;

		this._openNodes.sort(this._sortFunction);
		var node = this._openNodes.shift();
		this._closedNodes[node._tx * this._map._sizeX + node._ty] = true;

		//left
		var ltx = node._tx-1;
		var lty = node._ty;
		var ltile = this._map.tileAt(ltx, lty);

		var lclear = true;
		for (var li = 0; li < this._th; li++) {
			lclear = lclear && !(this._map.tileAt(ltx, lty+li) & RIGHT);
		}
		if (!this._closedNodes[ltx * this._map._sizeX + lty] && lclear) {
			this._openNodes.push(this._createNode(ltx, lty, node));
		}

		//right
		var rtx = node._tx+1;
		var rty = node._ty;
		var rtile = this._map.tileAt(rty, rty);

		var rclear = true;
		for (var ri = 0; ri < this._th; ri++) {
			rclear = rclear && !(this._map.tileAt(rtx, rty+ri) & LEFT);
		}
		if (!this._closedNodes[rtx * this._map._sizeX + rty] && rclear) {
			this._openNodes.push(this._createNode(rtx, rty, node));
		}
		
		//up
		var utx = node._tx;
		var uty = node._ty-1;
		var utile = this._map.tileAt(utx, uty);
		
		var uclear = true;
		for (var ui = 0; ui < this._tw; ui++) {
			uclear = uclear && !(this._map.tileAt(utx+ui, uty) & DOWN);
		}
		if (!this._closedNodes[utx * this._map._sizeX + uty] && uclear) {
			this._openNodes.push(this._createNode(utx, uty, node));
		}
		
		//down
		var dtx = node._tx;
		var dty = node._ty+1;
		var dtile = this._map.tileAt(dtx, dty);

		var dclear = true;
		for (var di = 0; di < this._tw; di++) {
			dclear = dclear && !(this._map.tileAt(dtx+di, dty) & UP);
		}
		if (!this._closedNodes[dtx * this._map._sizeX + dty] && dclear) {
			this._openNodes.push(this._createNode(dtx, dty, node));
		}

		return true;
	};

	PathSearch.prototype.createPath = function(node) {
		var path = [];
		var cnode = node;
		while (cnode) {
			path.push(cnode);
			cnode = cnode._parent;
		}
		return path;
	};

	PathSearch.prototype.optimizeNodeDisplacements = function(path) {

		// end node
		var tx1 = layerMap._posToTileX(this._x1);
		var ty1 = layerMap._posToTileY(this._y1);

		var tpx1 = this._layerMap._tileToPosX(tx1);
		var dispX = tpx1 - this._x1;
		var tpy1 = this._layerMap._tileToPosY(ty1);
		var dispY = tpy1 - this._y1;

		var endNode = path[path.length-1];
		endNode.assignDisp(dispX, dispY);

		// corner nodes
		var closestCorners = [];
		var prevCorner;
		var nextCorner;
		for (var i = 1; i < path.length - 1; i++) {
			var node = path[i];
			var prevNode = path[i-1];
			var nextNode = path[i+1];
		}
	};

	PathSearch.prototype._smoothPath = function(path) {
		var smoothPath = [];
		var i = 0;
		while (i < path.length) {
			var node = path[i];
			smoothPath.push(node);
			while(true) {
				i++;
				if (i >= path.length || !this._shortcutClear(node, path[i])) {
					break;
				}
			}
		}
		return smoothPath;
	};

	PathSearch.prototype._shortcutClear = function(node0, node1) {
		return (this._nextCollisionX(node0, node1) && this._shortcutClearY(node0, node1));
	};

	PathSearch.prototype._nextCollisionX = function(node0, node1) {
		
		var dispX = this._dispFromTileX();
		var dispY = this._dispFromTileY();

		var tx0 = node0._tx;
		var tx1 = node1._tx;

		var ty0 = node0._ty;
		var ty1 = node1._ty;

		var tx;
		if (tx1 !== tx0) {
			var x0 = this._layerMap.tileToPosX(tx0) + dispX;
			var x1 = this._layerMap.tileToPosX(tx1) + dispX;

			var yt0 = this._layerMap.tileToPosX(ty0) + dispY;
			var yb0 = yt0 + this._sizeY;

			var vslope = (ty1 - ty0) / (tx1 - tx0);
			
			if (tx0 < tx1) {
				x0 += this._sizeX;
				x1 += this._sizeX;
			}

			for (tx = tx0; tx !== tx1; (tx < tx1 ? tx++ : tx--)) {
				var xsect = this._layerMap.tileToPosX(tx);
				var ytsect = yt0 + (xsect - x0) * vslope;
				var ybsect = yb0 + (xsect - x0) * vslope;

				var ttysect = this._layerMap.posToTileY(ytsect);
				var tbysect = this._layerMap.posToTileY(ybsect);

				var collideSide = (tx0 < tx1 ? LEFT : RIGHT);
				for (var tysect = ttysect; tysect < tbysect; tysect++) {
					if (this._layerMap.tileAt(xsect, tysect) & collideSide) {
						return false;
					}
				}
			}
		}
		return true;
	};

};