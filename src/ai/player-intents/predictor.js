var DROP_DISTANCE = 48;
var LINK_MERGE_DISTANCE = 16;

gm.Ai.PlayerIntent.Predictor = function() {

	var Predictor = function(observer) {
		this._lastVisiblePlatform = undefined;

		this._predictedPlatformLinks = [];
		this._discardedLinks = {};
		this._listener = undefined;

		this._observer = observer;
	};

	Predictor.prototype.startListening = function() {
		this._observer.addListener(this);
	};

	Predictor.prototype.stopListening = function() {
		this._observer.removeListener(this);
		this.resetPredictions();
	};

	Predictor.prototype.resetPredictions = Predictor.prototype.onLevelChanged = function() {
		this._lastVisiblePlatform = undefined;
		this._predictedPlatformLinks = [];
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

		var reachableLinks = this._observer._reachable[platform._index]._links;
		this._predictedPlatformLinks = [];
		for (var l = 0; l < reachableLinks.length; l++) {
			var link = reachableLinks[l];
			if (!this._discardedLinks[link._tag]) {
				this._predictedPlatformLinks.push(l);
			}
		}
	};

	Predictor.prototype.onTurn = function() {
		this._filterLinks(this._linkInDirection);

		if (this._predictedPlatformLinks.length === 0) {
			this._listener.onUnexpectedTurn();
			this._resetLinks();
			this._filterLinks(this._linkInDirection);
		}
	};

	Predictor.prototype.postUpdate = function() {
		if (this._observer._dir !== undefined) {
			this._predictedPlatformLinks = _.filter(this._predictedPlatformLinks, this._linkInRange);
		}
	};

	Predictor.prototype._linkInDirection = function(link) {
		var dir = this._observer._dir;
		var body = this._observer._targetBody;
		if (!body) return;
		return (body._x + body._sizeX < link._pxri && dir > 0) ||
			(body._x > link._pxli && dir < 0);
	};

	Predictor.prototype._linkInRange = function(link) {
		var body = this._observer._targetBody;
		if (!body) return;
		return (dir > 0 && link._pxri < body._x - DROP_DISTANCE) ||
			(dir < 0 && link._pxli > body._x + body._sizeX + DROP_DISTANCE);
	};

	Predictor.prototype._linkOverlapsJump = function(link) {
		var body = this._observer._targetBody;
		if (!body) return;
		return link._pxli - (body._x + body._sizeX) > LINK_MERGE_DISTANCE || 
				body._x - link._pxri > LINK_MERGE_DISTANCE;
	};

	Predictor.prototype._resetLinks = function() {
		var platform = this._observer.getCurrentPlatform();
		this._discardedLinks = {};
		this._predictedPlatformLinks = this._observer._reachable[platform._index]._links;
	};

	Predictor.prototype._filterLinks = function(filter) {
		var newPlatformLinks = [];
		for (var i = 0; i < this._predictedPlatformLinks.length; i++) {
				
			var link = this._predictedPlatformLinks[i];
			if (filter(link)) {
				newPlatformLinks.push(link);
			} else {
				this._discardedLinks[link._tag] = true;
			}
		}
		this._predictedPlatformLinks = newPlatformLinks;
	};

	Predictor.prototype._isUnexpectedJump = function() {
		var body = this._observer._targetBody;
		if (!body) return;
		for (var i = 0; i < this._predictedPlatformLinks.length; i++) {
			var link = this._predictedPlatformLinks[i];
			if (link._pxli <= body._x &&
				link._pxri >= body._x + body._sizeX) {
				return false;
			}
		}
		return true;
	};

	return Predictor;
}();