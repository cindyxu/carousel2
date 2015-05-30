if (!gm.Behaviors) gm.Behaviors = {};

gm.Behaviors.Walker = function() {
	var Dir = gm.Constants.Dir;

	var Walker = function(params, body) {

		this._walkForce = 0;
		this._jumpImpulse = 0;
		this._maxJumps = 0;

		if (body) this.setBody(body);
		if (params) this.setParams(params);

		this._facing = 0;
		this._jumpCount = 0;
	};

	Walker.prototype.setParams = function(params) {
		if (params.walkForce !== undefined) this._walkForce = params.walkForce;
		if (params.jumpImpulse !== undefined) this._jumpImpulse = params.jumpImpulse;
		if (params.maxJumps !== undefined) this._maxJumps = params.maxJumps;
	};

	Walker.prototype.setBody = function(body) {
		this._body = body;
	};

	Walker.prototype.control = function(input) {

		var body = this._body;
		if (!body) return;

		if (input.down.left) {
			body.addForce(-this._walkForce, 0);
			this._facing = Dir.LEFT;
		} 
		else if (input.down.right) {
			body.addForce(this._walkForce, 0);
			this._facing = Dir.RIGHT;
		}

		if (input.pressed.up && this._jumpCount < this._maxJumps) {
			body.addImpulse(0, -this._jumpImpulse);
			this._jumpCount++;
		}	
	};

	Walker.prototype.post = function() {
		var body = this._body;
		if (!body) return;

		if (body._collisionState.down) {
			this._jumpCount = 0;
		}
	};

	return Walker;

}();