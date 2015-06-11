gm.Pathfinder.Walker.PlatformSearch = function() {

	var PlatformSearch = function(platformMap, txi, tyi, goalPlatform) {
		this._platformMap = platformMap;
		this._kinematics = platformMap._kinematics;
		this._txi = txi;
		this._tyi = tyi;
		this._originPlatform = platformMap.findPlatformUnderTile(txi, tyi);
		this._goalPlatform = goalPlatform;

		this._openNodes = [];
		this._closedNodes = [];

		this._openNodes.push(new Node());
	};

	var Node = PlatformSearch._Node = function(platform, link, pxi, gx, hx, parent) {
		this._platform = platform;
		this._link = link;
		this._pxi = pxi;
		this._gx = gx;
		this._hx = hx;
		this._parent = parent;
	};

	PlatformSearch.prototype.step = function() {
		var node = this._openNodes.pop();
		var platform = node._platform;
		var preachable = platform._reachable;
		for (var i = 0; i < preachable.length; i++) {
			var nlinks = preachable[i];
			for (var l = 0; l < nlinks.length; l++) {
				var nlink = nlinks[l];
				this.addNeighborLink(node, nlink);
			}
		}
	};

	PlatformSearch.prototype.addNeighborLink = function(node, link) {

	};

	PlatformSearch.distanceToNextLink = function(plink, nlink) {
		if (plink._head._pxli);
		var maxDeltaX = plink._maxDeltaX;
	};

	return PlatformSearch;
}();