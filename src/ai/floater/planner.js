gm.Ai.Floater.Planner = function() {

	var Planner = function(entity, levelObserver, params) {
		this._entity = entity;
		this._levelObserver = levelObserver;
		this._maxDistance = 0;

		if (params) this._setParams(params);
		gm.Ai.Planner.call(this);
	};

	Planner.prototype = Object.create(gm.Ai.Planner.prototype);

	Planner.prototype._setParams = function(params) {
		if (params.maxDistance !== undefined) this._maxDistance = params.maxDistance;
	};

	Planner.prototype._planNextMove = function() {

		var playerEntity = this._levelObserver.findEntityByName("player");

		if (playerEntity) {

			var dx = (playerEntity._body._x - this._entity._body._x);
			var dy = (playerEntity._body._y - this._entity._body._y);

			var up = false;
			var down = false;
			var left = false;
			var right = false;

			var dist = Math.sqrt(dx*dx + dy*dy);
			if (dist > this._maxDistance) {
				var absRatio = Math.abs(dy/dx);
				if (absRatio <= 1+Math.sqrt(2)) {
					if (dx < 0) left = true;
					else right = true;
				} if (absRatio >= (1 / (1+Math.sqrt(2)))) {
					if (dy < 0) up = true;
					else down = true;
				}
			}

			return {
				up: up,
				down: down,
				left: left,
				right: right
			};
		}

		return Planner.prototype.NO_MOVE;
	};

	return Planner;

}();