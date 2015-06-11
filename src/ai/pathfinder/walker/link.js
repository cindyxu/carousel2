gm.Pathfinder.Walker.Link = function() {

	var Link = function(tailArea, kinematics) {
		this._tail = tailArea;
		var headArea = tailArea;
		while(headArea._parent) headArea = headArea._parent;
		this._head = headArea;

		console.log(tailArea._pyi - headArea._pyi);
		this._totalTime = kinematics.getDeltaTimeFromDeltaY(
			headArea._vyi, tailArea._pyi - headArea._pyi, true);
		this._maxDeltaX = kinematics.getAbsDeltaXFromDeltaY(
			headArea._vyi, tailArea._pyi - headArea._pyi, true);

		console.log(this);
	};

	return Link;
}();