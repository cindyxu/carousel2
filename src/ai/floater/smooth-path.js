gm.Ai.Floater.SmoothPath = function() {

	var Dir = gm.Constants.Dir;

	var SmoothPath = function(combinedMap, sizeX, sizeY, path) {
		this._combinedMap = combinedMap;
		this._sizeX = sizeX;
		this._sizeY = sizeY;
		this._path = path;

		this._pathIndex0 = 0;
		this._pathIndex1 = 1;
		
		this._smoothedPath = [];
		
		var x0 = this._combinedMap.tileToPosX(path[0]._tx) + path[0]._dx;
		var y0 = this._combinedMap.tileToPosY(path[0]._ty) + path[0]._dy;
		this._smoothedPath.push([x0, y0]);
	};

	SmoothPath.prototype.step = function() {
		var intersection = this._findNextIntersection(this._path[this._pathIndex0],
			this._path[this._pathIndex1],
			this._path[this._pathIndex1+1]);
		if (!intersection) {
			this._pathIndex1++;
		} else {
			this._smoothedPath.push(intersection);
			this._pathIndex0 = this._pathIndex1;
			this._pathIndex1++;
		}
	};

	SmoothPath.prototype.findNextIntersection = function(node0, node1, node2) {

		var nx0 = this._combinedMap.tileToPosX(node0._tx) + node0._dx;
		var ny0 = this._combinedMap.tileToPosY(node0._ty) + node0._dy;

		var slope1 = (node1._ty - node0._ty) / (node1._tx - node0._tx);
		var slope2 = (node2._ty - node0._ty) / (node2._tx - node0._tx);
		
		var tx, ty, hdir, vdir;

		if (node1._tx !== node2._tx) {
			var ty0;
			if (node1._ty < node2._ty) {
				ty0 = node1._ty+1;
			} else {
				ty0 = node1._ty;
			}

			for (ty = ty0; ty !== node2._ty; (ty < node2._ty ? ty++ : ty--)) {
				var dy = this._combinedMap._tileToPosY(ty) - ny0;
				vdir = (ty < node2._ty ? Dir.UP : Dir.DOWN);
				
				var xsect1 = nx0 + (dy / slope1);
				var xsect2 = nx0 + (dy / slope2);
				
				var txsect1, txsect2;
				if (xsect1 < xsect2) {
					txsect1 = this._combinedMap.posToTileCeilX(xsect1);
					txsect2 = this._combinedMap.posToTileCeilX(xsect2);
					hdir = Dir.LEFT;
				} else {
					txsect1 = this._combinedMap.posToTileX(xsect1)-1;
					txsect2 = this._combinedMap.posToTileX(xsect2)-1;
					hdir = Dir.RIGHT;
				}
				for (tx = txsect1; tx !== txsect2; (tx < txsect2 ? tx++ : tx--)) {
					if (this._combinedMap._map.tileAt(tx, ty) & (hdir | vdir)) {
						return [tx, ty];
					}
				}
			}

		} else {
			var tx0;
			if (node1._tx < node2._tx) {
				tx0 = node1._tx+1;
			} else {
				tx0 = node1._tx;
			}

			for (tx = tx0; tx !== node2._tx; (tx < node2._tx ? tx++ : tx--)) {
				var dx = this._combinedMap._tileToPosX(tx) - nx0;
				hdir = (tx < node2._tx ? Dir.LEFT : Dir.RIGHT);
				
				var ysect1 = nx0 + (dx * slope1);
				var ysect2 = nx0 + (dx * slope2);
				
				var tysect1, tysect2;
				if (ysect1 < ysect2) {
					tysect1 = this._combinedMap.posToTileCeilX(ysect1);
					tysect2 = this._combinedMap.posToTileCeilX(ysect2);
					vdir = Dir.UP;
				} else {
					tysect1 = this._combinedMap.posToTileX(ysect1)-1;
					tysect2 = this._combinedMap.posToTileX(ysect2)-1;
					vdir = Dir.DOWN;
				}
				for (ty = tysect1; ty !== tysect2; (ty < tysect2 ? ty++ : ty--)) {
					if (this._combinedMap._map.tileAt(tx, ty) & (vdir | hdir)) {
						return [tx, ty];
					}
				}
			}
		}
	};

	return SmoothPath;

}();