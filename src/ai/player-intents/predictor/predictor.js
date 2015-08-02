var DROP_DISTANCE = 48;
var LINK_MERGE_DISTANCE = 16;

gm.Ai.PlayerIntent.Predictor = function() {

	var Predictor = function(observer, listener) {
		this._lastVisiblePlatform = undefined;

		this._predictedLinks = [];
		this._discardedLinks = {};

		this._listener = listener;
		this._observer = observer;
	};

	Predictor.prototype.startListening = function() {
		this._observer.addListener(this);
	};

	Predictor.prototype.stopListening = function() {
		this._observer.removeListener(this);
		this.resetPredictions();
	};

	Predictor.prototype.resetPredictions = function() {
		this._lastVisiblePlatform = undefined;
		this._predictedLinks = [];
		this._discardedLinks = {};
	};

	Predictor.prototype.onJump = function() {
		if (this._isUnexpectedJump()) {
			this._listener.onUnexpectedJump();
			this._resetLinks();
		}
		this._filterLinks(this._linkInDirection);
		this._filterLinks(this._linkOverlapsJump);
	};

	Predictor.prototype.onLand = function() {
		var platform = this._observer._currentPlatform;

		this._predictedLinks = [];
		var preachable = this._observer._levelInfo._reachable[platform._index];
		if (preachable) {
			var reachableLinks = preachable._links;
			for (var l = 0; l < reachableLinks.length; l++) {
				var link = reachableLinks[l];
				if (!this._discardedLinks[link._tag]) {
					this._predictedLinks.push(l);
				}
			}
		}
	};

	Predictor.prototype.onTurn = function() {
		this._filterLinks(this._linkInDirection);

		if (this._predictedLinks.length === 0) {
			this._listener.onUnexpectedTurn();
			this._resetLinks();
			this._filterLinks(this._linkInDirection);
		}
	};

	Predictor.prototype.postUpdate = function() {
		if (this._observer._walking !== undefined) {
			this._predictedLinks = _.filter(this._predictedLinks, this._linkInRange);
		}
	};

	Predictor.prototype._linkInDirection = function(link) {
		var body = this._observer._body;
		if (!body) return;
		var walking = this._observer._walking;
		return (body._x + body._sizeX < link._pxri && walking > 0) ||
			(body._x > link._pxli && walking < 0);
	};

	Predictor.prototype._linkInRange = function(link) {
		var body = this._observer._body;
		if (!body) return;
		var walking = this._observer._walking;
		return (walking > 0 && link._pxri < body._x - DROP_DISTANCE) ||
			(walking < 0 && link._pxli > body._x + body._sizeX + DROP_DISTANCE);
	};

	Predictor.prototype._linkOverlapsJump = function(link) {
		var body = this._observer._body;
		if (!body) return;
		return link._pxli - (body._x + body._sizeX) > LINK_MERGE_DISTANCE || 
				body._x - link._pxri > LINK_MERGE_DISTANCE;
	};

	Predictor.prototype._resetLinks = function() {
		var platform = this._observer._currentPlatform;
		this._discardedLinks = {};
		var preachable = this._observer._levelInfo._reachable[platform._index];
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
			if (filter(link)) {
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