gm.Ai.Planner = function() {

	var Planner = function() {
		this._lastInput = undefined;
	};

	Planner.prototype.NO_MOVE = {
		up: false,
		down: false,
		left: false,
		right: false
	};

	Planner.prototype._planNextMove = function() {
		return Planner.prototype.NO_MOVE;
	};

	Planner.prototype.planNextInput = function() {
		var move = this._planNextMove();
		var nextInput;
		if (this._lastInput === undefined) {
			nextInput = {
				pressed: {
					up: move.up,
					down: move.down,
					left: move.left,
					right: move.right
				},
				down: {
					up: move.up,
					down: move.down,
					left: move.left,
					right: move.right	
				}
			};
		} else {
			nextInput = {
				pressed: {
					up: move.up && !this._lastInput.down.up,
					down: move.down && !this._lastInput.down.down,
					left: move.left && !this._lastInput.down.left,
					right: move.right && !this._lastInput.down.right
				},
				down: {
					up: move.up,
					down: move.down,
					left: move.left,
					right: move.right	
				}
			};
		}
		this._lastInput = nextInput;
		return nextInput;
	};

	return Planner;

}();