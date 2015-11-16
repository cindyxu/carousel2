if (!gm.Behaviors) gm.Behaviors = {};

gm.Behaviors.Walker = function() {
	var Dir = gm.Constants.Dir;

	var leftKey = gm.Settings.Keys.LEFT;
	var rightKey = gm.Settings.Keys.RIGHT;
	var upKey = gm.Settings.Keys.UP;
	var downKey = gm.Settings.Keys.DOWN;

	var Walker = function(params, body) {

		this._walkForce = 0;
		this._jumpImpulse = 0;
		this._maxJumps = 0;

		if (body) this.setBody(body);
		if (params) this.setParams(params);

		this._facing = Dir.RIGHT;
		this._walking = undefined;
		
		this._jumpCount = 0;
		this._jumped = false;

		this._crouching = false;
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

		if ((!input.down[leftKey] && this._walking === Dir.LEFT) ||
			(!input.down[rightKey] && this._walking === Dir.RIGHT)) {
			this._walking = undefined;
		}

		if (input.pressed[leftKey] || 
			(input.down[leftKey] && this._walking === Dir.LEFT)) {
			body.addForce(-this._walkForce, 0);
			this._facing = Dir.LEFT;
			this._walking = Dir.LEFT;
		}

		if (input.pressed[rightKey] || 
			(input.down[rightKey] && this._walking === Dir.RIGHT)) {
			body.addForce(this._walkForce, 0);
			this._facing = Dir.RIGHT;
			this._walking = Dir.RIGHT;
		}

		this._jumped = false;
		if (body._collisionState.down && input.down[downKey]) {
			this._crouching = true;
		} else {
			this._crouching = false;
			if (input.pressed[upKey] && this._jumpCount < this._maxJumps) {
				body.addImpulse(0, -this._jumpImpulse);
				this._jumpCount++;
				this._jumped = true;
			}
		}
	};

	Walker.prototype.post = function() {
		var body = this._body;
		if (!body) return;

		if (body._collisionState.down) {
			this._jumpCount = 0;
		} else if (!this._jumped && this._jumpCount === 0) {
			this._jumpCount++;
		}
	};

	return Walker;

}();