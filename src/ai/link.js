gm.Ai.Link = function() {

	var tag = 0;

	var Link = function(fromPlatform, toPlatform, pxli, pxri, pxlo, pxro, totalTime, maxDeltaX) {
		this._fromPlatform = fromPlatform;
		this._toPlatform = toPlatform;
		this._pxli = pxli;
		this._pxri = pxri;
		this._pxlo = pxlo;
		this._pxro = pxro;
		this._totalTime = totalTime;
		this._maxDeltaX = maxDeltaX;

		this._tag = tag++;

		if (LOGGING) {
			if (isNaN(this._totalTime)) console.log("!!! link - totalTime was NaN");
			if (isNaN(this._maxDeltaX)) console.log("!!! link - maxDeltaX was NaN");
		}
	};
	return Link;
}();

gm.Ai.Link.Platform = function() {
	
	var Link = gm.Ai.Link;
	
	var PlatformLink = function(fromPlatform, toPlatform, tailArea, kinematics) {
		
		var headArea = tailArea;
		while(headArea._parent) headArea = headArea._parent;

		var pxli = headArea._pxli;
		var pxri = headArea._pxri;

		var pxlo = tailArea._pxlo;
		var pxro = tailArea._pxro;

		var totalTime = kinematics.getDeltaTimeFromDeltaY(
			headArea._vyi, tailArea._pyi - headArea._pyi, true);
		var maxDeltaX = kinematics.getAbsDeltaXFromDeltaY(
			headArea._vyi, tailArea._pyi - headArea._pyi, true);

		Link.call(this, fromPlatform, toPlatform, pxli, pxri, pxlo, pxro, totalTime, maxDeltaX);
		this._tail = tailArea;
		this._head = headArea;
	};

	PlatformLink.prototype = Object.create(Link.prototype);

	return PlatformLink;

}();