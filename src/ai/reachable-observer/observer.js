gm.Ai.ReachableObserver = function() {
	var ReachableObserver = function(observedPlatformMap, sourceReachable, targetReachable) {
		this._observedPlatformMap = observedPlatformMap;
		this._targetReachable = targetReachable;
		this._sourceReachable = sourceReachable;

		this._observedPlatformMap.setListener(this);
	};

	var lbbox = {};
	ReachableObserver.prototype._onPlatformsSeen = function(abbox, seenPlatforms) {

		var opmap = this._observedPlatformMap._map;
		for (var i = 0; i < seenPlatforms.length; i++) {
			platform = seenPlatforms[i];
			
			var spreachable = this._sourceReachable[platform._index];
			var tpreachable = this._targetReachable[platform._index];
			if (!spreachable) continue;

			var slinks = spreachable._links;

			for (var l = 0; l < slinks.length; l++) {
				
				var link = slinks[l];
				if (tpreachable && tpreachable._links.indexOf(link) >= 0) continue;

				this._setBboxToLinkHead(lbbox, link);
				if (!gm.Math.bboxesOverlap(abbox, lbbox)) continue;

				this._setBboxToLinkTail(lbbox, link);
				if (!gm.Math.bboxesOverlap(abbox, lbbox)) continue;

				Reachable.addLink(this._targetReachable, link);
			}
		}
	};

	ReachableObserver.prototype._setBboxToLinkHead = function(bbox, link) {
		var opmap = this._observedPlatformMap._map;

		bbox.x0 = link._pxli;
		bbox.y0 = opmap.tileToPosY(link._fromPlatform._ty);
		bbox.x1 = link._pxri;
		bbox.y1 = opmap.tileToPosY(link._fromPlatform._ty+1);
	};

	ReachableObserver.prototype._setBboxToLinkTail = function(bbox, link) {
		var opmap = this._observedPlatformMap._map;

		bbox.x0 = Math.max(link._pxlo, opmap.tileToPosX(link._toPlatform._tx0));
		bbox.y0 = opmap.tileToPosY(link._toPlatform._ty);
		bbox.x1 = Math.min(link._pxro, opmap.tileToPosX(link._toPlatform._tx1));
		bbox.y1 = opmap.tileToPosY(link._toPlatform._ty+1);
	};

}();