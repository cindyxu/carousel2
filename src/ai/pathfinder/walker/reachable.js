gm.Pathfinder.Walker.Reachable = function() {

	var _PlatformLinks = function() {
		this._links = [];
		this._linksByPlatform = [];
	};

	var Reachable = {};

	Reachable.newInstance = function() {
		return [];
	};

	Reachable.addLink = function(reachable, link) {
		var fromPlatformIndex = link._fromPlatform._index;

		var freachable = reachable[fromPlatformIndex];
		if (!freachable) {
			freachable = reachable[fromPlatformIndex] = new _PlatformLinks();
		}

		if (freachable._links.indexOf(link) < 0) {
			freachable._links.push(link);

			var linksByPlatform = freachable._linksByPlatform[link._toPlatform._index];
			if (!linksByPlatform) {
				linksByPlatform = freachable._linksByPlatform[link._toPlatform._index] = [];
			}
			linksByPlatform.push(link);
		}
	};

	return Reachable;

}();