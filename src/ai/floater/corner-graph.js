gm.Ai.Floater.CornerGraph = function() {

	var Dir = gm.Constants.Dir;

	var _Node = function(tx, ty) {
		this._tx = tx;
		this._ty = ty;
		this._neighbors = [];
	};

	_Node.prototype.addNeighbor = function(onode) {
		if (this._neighbors.indexOf(node) < 0) {
			this._neighbors.push(node);
		}
	};

	var _Area = function(tx0, ty0, tx1, ty1) {
		this._tx0 = tx0;
		this._ty0 = ty0;
		this._tx1 = tx1;
		this._ty1 = ty1;
		this._child1 = undefined;
		this._child2 = undefined;
	};

	_Area.prototype._split = function(d, dir) {
		if (dir === LEFT && d <= this._tx0 || d >= this._tx1) return;
		if (dir === RIGHT && d < this._tx0 || d >= this._tx1-1) return;
		if (dir === UP && d <= this._ty0 || d >= this._ty1) return;
		if (dir === DOWN && d < this._ty0 || d >= this._ty1-1) return;

		if (this._child1 || this._child2) {
			this._child1._split(d, dir);
			this._child2._split(d, dir);
		} else {
			if (dir === LEFT) {
				this._child1 = new _Area(this._tx0, this._ty0, d, this._ty1);
				this._child2 = new _Area(d, this._ty0, this._tx1, this._ty1);
			} else if (dir === RIGHT) {
				this._child1 = new _Area(this._tx0, this._ty0, d+1, this._ty1);
				this._child2 = new _Area(d+1, this._ty0, this._tx1, this._ty1);
			} else if (dir === UP) {
				this._child1 = new _Area(this._tx0, this._ty0, this._tx1, d);
				this._child2 = new _Area(this._tx0, d, this._tx1, this._ty1);
			} else {
				this._child1 = new _Area(this._tx0, this._ty0, this._tx1, d+1);
				this._child2 = new _Area(this._tx0, d+1, this._tx1, this._ty1);
			}
		}
	};

	var CornerGraph = function(map) {
		this._map = map;
		this._generateGraph();
	}();

	CornerGraph.prototype._generateGraph = function() {
		this._graphMap = [];
		this._graphArr = [];

		this._areaMap = [];
		this._rootArea = undefined;
		
		var seamsLeft = this._gatherSeams(Dir.LEFT);
		var seamsRight = this._gatherSeams(Dir.RIGHT);
		var seamsUp = this._gatherSeams(Dir.UP);
		var seamsDown = this._gatherSeams(Dir.DOWN);

		this._addNodesFromSeams(seamsLeft, Dir.LEFT);
		this._addNodesFromSeams(seamsRight, Dir.RIGHT);
		this._addNodesFromSeams(seamsUp, Dir.UP);
		this._addNodesFromSeams(seamsDown, Dir.DOWN);

		this._generateAreasFromSeams(seamsLeft, seamsRight, seamsUp, seamsDown);
	};

	CornerGraph.prototype._gatherSeams = function(dir) {

		var tx, ty;
		var seams = [];
		if (dir === Dir.UP || dir === Dir.DOWN) {
			for (ty = 0; ty < this._map._tilesY; ty++) {
				var tsegx0 = -1;
				for (tx = 0; tx < this._map._tilesX; tx++) {
					var hasSegX = (this._map.tileAt(tx, ty) & DIR);
					if (tsegx0 < 0 && hasSegX) {
						tsegx0 = tx;
					} else if (segx >= 0 && !hasSegX) {
						seams.push([ty, tsegx0, tx]);
						tsegx0 = -1;
					}
				}
			}
		} else {
			for (tx = 0; tx < this._map._tilesY; tx++) {
				var tsegy0 = -1;
				for (ty = 0; ty < this._map._tilesX; ty++) {
					var hasSegY = (this._map.tileAt(tx, ty) & DIR);
					if (tsegy0 < 0 && hasSegY) {
						tsegy0 = ty;
					} else if (segy >= 0 && !hasSegY) {
						seams.push([tx, tsegy0, ty]);
						tsegy0 = -1;
					}
				}
			}
		}

		return seams;
	};

	CornerGraph.prototype.addNodesFromSeams = function(seams, dir) {
		for (var s = 0; s < seams.length; s++) {
			var seam = seams[s];
			if (dir === LEFT) {
				this._addNodeAt(seam[0]-1, seam[1]);
				this._addNodeAt(seam[0]-1, seam[2]);
			} else if (dir === RIGHT) {
				this._addNodeAt(seam[0]+1, seam[1]);
				this._addNodeAt(seam[0]+1, seam[2]);
			} else if (dir === UP) {
				this._addNodeAt(seam[1], seam[0]-1);
				this._addNodeAt(seam[2], seam[0]-1);
			} else {
				this._addNodeAt(seam[1], seam[0]+1);
				this._addNodeAt(seam[2], seam[0]+1);
			}
		}
	};

	CornerGraph.prototype._addNodeAt = function(tx, ty) {
		if (!this._graphMap[ty * this._map._tilesX + tx]) {
			var node = new _Node(tx, ty);
			this._graphMap[ty * this._map._tilesX + tx] = node;
			this._graphArr.push(node);
		}
	};

	CornerGraph.prototype._generateAreasFromSeams = function(seamsLeft, seamsRight, seamsUp, seamsDown) {
		this._rootArea = new _Area(0, 0, this._map._tilesX, this._map._tilesY);

		var i;
		for (i = 0; i < seamsLeft.length; i++) {
			this._rootArea._split(seamsLeft[i]);
		}
		for (i = 0; i < seamsRight.length; i++) {
			this._rootArea._split(seamsRight[i]);
		}
		for (i = 0; i < seamsUp.length; i++) {
			this._rootArea._split(seamsUp[i]);
		}
		for (i = 0; i < seamsDown.length; i++) {
			this._rootArea._split(seamsDown[i]);
		}
	};

	return CornerGraph;

}();