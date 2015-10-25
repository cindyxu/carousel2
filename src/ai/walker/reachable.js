gm.Ai.Walker.Reachable = function() {

	var _PlatformLinks = function(fromLinks) {
		this._links = [];
		this._linksByPlatform = [];
		this._fromLinks = fromLinks;
	};

	_PlatformLinks.prototype.addLink = function(link) {
		if (this._links.indexOf(link) < 0) {
			this._links.push(link);

			var targetPlatform = (this._fromLinks ? link._toPlatform : link._fromPlatform);
			var linksByPlatform = this._linksByPlatform[targetPlatform._index];
			if (!linksByPlatform) {
				linksByPlatform = this._linksByPlatform[targetPlatform._index] = [];
			}
			linksByPlatform.push(link);
		}
	};

	var Reachable = function() {
		this._from = [];
		this._to = [];
	};

	Reachable.prototype.addLink = function(link) {
		var fromPlatformIndex = link._fromPlatform._index;
		var toPlatformIndex = link._toPlatform._index;

		var freachable = this._from[fromPlatformIndex];
		if (!freachable) {
			freachable = this._from[fromPlatformIndex] = new _PlatformLinks(true);
		}
		freachable.addLink(link);

		var treachable = this._to[toPlatformIndex];
		if (!treachable) {
			treachable = this._to[toPlatformIndex] = new _PlatformLinks(false);
		}
		treachable.addLink(link);
	};

	return Reachable;

}();