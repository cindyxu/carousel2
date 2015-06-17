gm.Pathfinder.Walker.Link = function() {

	var tag = 0;

	var Link = function(fromPlatform, toPlatform, tailArea, kinematics) {
		this._fromPlatform = fromPlatform;
		this._toPlatform = toPlatform;
		this._tail = tailArea;
		var headArea = tailArea;
		while(headArea._parent) headArea = headArea._parent;
		this._head = headArea;

		this._totalTime = kinematics.getDeltaTimeFromDeltaY(
			headArea._vyi, tailArea._pyi - headArea._pyi, true);
		this._maxDeltaX = kinematics.getAbsDeltaXFromDeltaY(
			headArea._vyi, tailArea._pyi - headArea._pyi, true);

		if (LOGGING) {
			if (isNaN(this._totalTime)) console.log("!!! link - totalTime was NaN");
			if (isNaN(this._maxDeltaX)) console.log("!!! link - maxDeltaX was NaN");
		}

		this._tag = tag++;
	};

	return Link;
}();