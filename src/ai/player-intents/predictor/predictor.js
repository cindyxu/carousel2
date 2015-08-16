var DROP_DISTANCE = 48;
var LINK_MERGE_DISTANCE = 16;
var LINK_OVERLAP_DISTANCE = 3;

gm.Ai.PlayerIntent.Predictor = function() {

	var Dir = gm.Constants.Dir;

	var Predictor = function(observer, listener) {
		this._predictedLinks = [];
		this._discardedLinks = {};

		this._listener = listener;
		this._observer = observer;
		this._platform = observer._currentPlatform;
	};

	Predictor.prototype.startListening = function() {
		console.log("start listening");
		this._observer.addListener(this);
	};

	Predictor.prototype.stopListening = function() {
		this._observer.removeListener(this);
		this.resetPredictions();
	};

	Predictor.prototype.resetPredictions = function() {
		this._predictedLinks = [];
		this._discardedLinks = {};
	};

	Predictor.prototype.onJump = Predictor.prototype.onDrop = function() {
		if (this._isUnexpectedJump()) {
			if (this._listener) this._listener.onUnexpectedJump();
			this._resetLinks();
		}
		this._filterLinks(this._linkInDirection);
		this._filterLinks(this._linkOverlapsJump);
	};

	Predictor.prototype.onLand = function() {
		var lastGroundX = this._observer._lastGroundX;
		var lastLandX = this._observer._lastLandX;

		var lastPlatform = this._platform;
		var overlappedLinks = [];
		if (lastPlatform) {
			var lreachable = this._observer._levelInfo._reachable[lastPlatform._index];
			if (lreachable) {
				var lreachableLinks = lreachable._links;
				for (var l = 0; l < lreachableLinks.length; l++) {
					var llink = lreachableLinks[l];
					if (llink._pxli <= lastGroundX + LINK_OVERLAP_DISTANCE && 
						llink._pxri >= lastGroundX + this._observer._body._sizeX - LINK_OVERLAP_DISTANCE) {
						if (llink._pxlo <= lastLandX + LINK_OVERLAP_DISTANCE && 
							llink._pxro >= lastLandX + this._observer._body._sizeX - LINK_OVERLAP_DISTANCE) {
							overlappedLinks.push(llink);
						}
					}
				}
			}
		}

		var platform = this._observer._currentPlatform;

		this._predictedLinks = [];
		var preachable = this._observer._levelInfo._reachable[platform._index];
		if (preachable) {
			var preachableLinks = preachable._links;
			loop1:
			for (var p = 0; p < preachableLinks.length; p++) {
				var plink = preachableLinks[p];
				if (!this._discardedLinks[plink._tag]) {
					if (plink._fromPlatform === platform && plink._toPlatform === lastPlatform) {
						loop2:
						for (var pl = 0; pl < overlappedLinks.length; pl++) {
							var pllink = overlappedLinks[pl];
							if (pllink._pxro > plink._pxli - LINK_OVERLAP_DISTANCE && 
								pllink._pxlo < plink._pxri + LINK_OVERLAP_DISTANCE) {
								if (pllink._pxri > plink._pxlo - LINK_OVERLAP_DISTANCE && 
									pllink._pxli < plink._pxro + LINK_OVERLAP_DISTANCE) {
									continue loop1;
								}
							}
						}
					}
					this._predictedLinks.push(plink);
				}
			}
		}
		this._platform = platform;
	};

	Predictor.prototype.onTurn = function() {
		this._filterLinks(this._linkInDirection);

		if (this._predictedLinks.length === 0) {
			if (this._listener) this._listener.onUnexpectedTurn();
			this._resetLinks();
			this._filterLinks(this._linkInDirection);
		}
	};

	Predictor.prototype.postUpdate = function() {
		if (this._observer._walking !== undefined) {
			this._filterLinks(this._linkInRange);
		}
	};

	Predictor.prototype._linkInDirection = function(link, observer) {
		var body = observer._body;
		if (!body) return;
		var walking = observer._walking;
		return (body._x + body._sizeX < link._pxri && walking === Dir.RIGHT) ||
			(body._x > link._pxli && walking === Dir.LEFT);
	};

	Predictor.prototype._linkInRange = function(link, observer) {
		var body = observer._body;
		if (!body) return;
		var walking = observer._walking;
		return !walking || (walking === Dir.RIGHT && link._pxri > body._x - DROP_DISTANCE) ||
			(walking === Dir.LEFT && link._pxli < body._x + body._sizeX + DROP_DISTANCE);
	};

	Predictor.prototype._linkOverlapsJump = function(link, observer) {
		var body = observer._body;
		if (!body) return;
		return link._pxli - (body._x + body._sizeX) > LINK_MERGE_DISTANCE || 
				body._x - link._pxri > LINK_MERGE_DISTANCE;
	};

	Predictor.prototype._resetLinks = function() {
		var platform = this._observer._currentPlatform;
		this._discardedLinks = {};
		var preachable = platform ? this._observer._levelInfo._reachable[platform._index] : undefined;
		if (preachable) {
			this._predictedLinks = preachable._links;
		} else {
			this._predictedLinks = [];
		}
	};

	Predictor.prototype._filterLinks = function(filter) {
		var newPlatformLinks = [];
		for (var i = 0; i < this._predictedLinks.length; i++) {
				
			var link = this._predictedLinks[i];
			if (filter(link, this._observer)) {
				newPlatformLinks.push(link);
			} else {
				this._discardedLinks[link._tag] = true;
			}
		}
		this._predictedLinks = newPlatformLinks;
	};

	Predictor.prototype._isUnexpectedJump = function() {
		var body = this._observer._body;
		if (!body) return;
		for (var i = 0; i < this._predictedLinks.length; i++) {
			var link = this._predictedLinks[i];
			if (link._pxli <= body._x &&
				link._pxri >= body._x + body._sizeX) {
				return false;
			}
		}
		return true;
	};

	return Predictor;
}();