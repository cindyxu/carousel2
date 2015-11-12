gm.Ai.Walker.Planner = function() {

	var Planner = function(levelInfo, params) {
		gm.Ai.Planner.call(this);
		this._levelInfo = levelInfo;
		if (params) this._setParams(params);
	};

	Planner.prototype = Object.create(gm.Ai.Planner.prototype);

	Planner.prototype.setParams = function(params) {

	};

	Planner.prototype._planNextMove = function() {
		return Planner.prototype.NO_MOVE;
	};

	return Planner;

}();