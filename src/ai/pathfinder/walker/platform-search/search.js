gm.Pathfinder.Walker.PlatformSearch = function() {

	var PlatformSearch = function(platformMap, body, pxf, pyf) {
		this._platformMap = platformMap;
		this._kinematics = platformMap._kinematics;
		this._pxf = pxf;
		this._pyf = pyf;
		
		this._openNodes = [];
		this._closedLinks = {};

		this._originPlatform = platformMap.getPlatformUnderBody(body);

		if (this._originPlatform) {
			this._openNodes.push({
				_platform: this._originPlatform,
				_pnode: undefined,
				_link: undefined,
				_pxli: body._x,
				_pxri: body._x,
				_pxlo: body._x,
				_pxro: body._x,
				_gx: 0,
				_fx: this.euclideanDistance(body._x, platformMap._map.tileToPosY(this._originPlatform._ty))
			});
		}
	};

	PlatformSearch.prototype.euclideanDistance = function(px, py) {
		var dx = this._pxf - px;
		var dy = this._pyf - py;
		return Math.sqrt(dx*dx + dy*dy);
	};

	PlatformSearch.prototype.getNeighborNode = function(node, nlink) {
		var lpxli = nlink._head._pxli;
		var lpxri = nlink._head._pxri;

		var pxli = Math.min(Math.max(node._pxlo, lpxli), lpxri);
		var pxri = Math.min(Math.max(node._pxro, lpxli), lpxri);

		var walkDist = Math.max(0, Math.min(pxli - node._pxlo, node._pxro - pxri));
		var walkTime = walkDist / this._kinematics._walkSpd;

		var pxlo = Math.min(Math.max(pxli - nlink._maxDeltaX, nlink._tail._pxlo), nlink._tail._pxro);
		var pxro = Math.min(Math.max(pxri + nlink._maxDeltaX, nlink._tail._pxlo), nlink._tail._pxro);

		var gx = node._gx + walkTime + nlink._totalTime;

		return {
			_platform: nlink._toPlatform,
			_pnode: node,
			_link: nlink,
			_pxli: pxli,
			_pxri: pxri,
			_pxlo: pxlo,
			_pxro: pxro,
			_gx: gx,
			_fx: gx + this.euclideanDistance((pxlo + pxro) / 2,
				this._platformMap._map.tileToPosY(nlink._toPlatform._ty)) / this._kinematics._walkSpd
		};
	};

	var sortFunction = function(n1, n2) {
		return n1._fx - n2._fx;
	};

	PlatformSearch.prototype.step = function() {

		if (this._openNodes.length === 0) return;

		this._openNodes.sort(sortFunction);
		var node = this._openNodes.shift();
		var platform = node._platform;
		
		var preachable = platform._reachable;
		var nlinks;
		var lfx;

		for (var i in preachable) {
			nlinks = preachable[i];
			for (var l = 0; l < nlinks.length; l++) {
				var nlink = nlinks[l];

				lfx = Number.POSITIVE_INFINITY;
				if (this._closedLinks[nlink._tag] !== undefined) {
					lfx = this._closedLinks[nlink._tag];
				}

				var neighborNode = this.getNeighborNode(node, nlink);
				if (neighborNode._fx < lfx) {
					this._openNodes.push(neighborNode);
					this._closedLinks[nlink._tag] = neighborNode._fx;
				}
			}
		}
	};

	return PlatformSearch;
}();