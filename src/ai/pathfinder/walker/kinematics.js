if (!gm.Pathfinder) gm.Pathfinder = {};
if (!gm.Pathfinder.Walker) gm.Pathfinder.Walker = {};

gm.Pathfinder.Walker.Kinematics = function() {

	var Kinematics = function(params) {
		this._walkSpd = params.walkSpd;
		this._jumpSpd = params.jumpSpd;
		this._fallAccel = params.fallAccel;
		this._terminalV = params.terminalV;
	};

	Kinematics.prototype.getDeltaYFromVyFinal = function(vyi, vyf) {
		var dt = this.getDeltaTimeFromVyFinal(vyi, vyf);
		return (vyi + vyf) / 2 * dt;
	};

	Kinematics.prototype.getVyFinalFromDeltaY = function(vyi, dy) {
		// if we hit terminalv before reaching dy,
		// then deltav is really just delta to terminalv
		if (vyi === this._terminalV) {
			return vyi;
		}
		var dyTerminal = this.getDeltaYFromVyFinal(vyi, this._terminalV);
		if (dyTerminal < dy) {
			return this._terminalV;
		}

		// there are always two possibilities for vyf
		// we will take the one closest to vyi, after vyi
		var absVyf = Math.sqrt(Math.max(0, vyi * vyi + 2 * this._fallAccel * dy));
		var vyf = vyi < -absVyf ? -absVyf : absVyf;
		vyf = Math.min(this._terminalV, vyf);

		return vyf;
	};

	Kinematics.prototype.getAbsDeltaXFromDeltaY = function(vyi, dy, longer) {
		var dt = this.getDeltaTimeFromDeltaY(vyi, dy, longer);
		return dt * this._walkSpd;
	};

	Kinematics.prototype.getDeltaTimeFromDeltaY = function(vyi, dy, longer) {
		if (vyi >= this._terminalV) {
			return dy / this._terminalV;
		}

		var dyTerminal = this.getDeltaYFromVyFinal(vyi, this._terminalV);
		if (dyTerminal < dy) {
			var dtPreTerm = this.getDeltaTimeFromDeltaY(vyi, dyTerminal, longer);
			var dtPostTerm = this.getDeltaTimeFromDeltaY(this._terminalV, (dy - dyTerminal));
			return dtPreTerm + dtPostTerm;
		}

		// there are two potential solutions for time.
		var dtdeterminant = Math.sqrt(Math.max(0, vyi * vyi + 2 * this._fallAccel * dy));
		var dt;
		if (longer) dt = (-vyi + dtdeterminant) / this._fallAccel;
		else {
			dt = (-vyi - dtdeterminant) / this._fallAccel;
			if (dt < 0) dt = (-vyi + dtdeterminant) / this._fallAccel;
		}
		return dt;
	};

	Kinematics.prototype.getDeltaTimeFromVyFinal = function(vyi, vyf) {
		if (LOGGING && vyf > this._terminalV) {
			console.log("!!! Kinematics - end velocity", vyf, 
				"greater than terminal velocity", this._terminalV, 
				" - result will be inaccurate");
		}
		return (vyf - vyi) / this._fallAccel;
	};

	Kinematics.prototype.getDeltaYFromDeltaX = function(vyi, dx) {
		return this.getDeltaYFromDeltaTime(vyi, Math.abs(dx / this._walkSpd));
	};

	Kinematics.prototype.getDeltaYFromDeltaTime = function(vyi, dt) {
		if (vyi >= this._terminalV) return this._terminalV * dt;
		var vyf = vyi + this._fallAccel * dt;
		if (vyf > this._terminalV) {
			var dtTerminal = this.getDeltaTimeFromVyFinal(vyi, this._terminalV);
			var dyPreTerminal = this.getDeltaYFromVyFinal(vyi, this._terminalV);
			var dyPostTerminal = this._terminalV * (dt - dtTerminal);
			return dyPreTerminal + dyPostTerminal;
		}
		return (vyi + vyf) / 2 * dt;
	};

	return Kinematics;
}();