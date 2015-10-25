if (!gm.Behaviors) gm.Behaviors = {};

gm.Behaviors.Floater = function() {
	var Dir = gm.Constants.Dir;

	var Floater = function(params, body) {

		this._floatForce = 0;

		if (body) this.setBody(body);
		if (params) this.setParams(params);

		this._facing = Dir.RIGHT;
		this._floating = 0;
	};

	Floater.prototype.setParams = function(params) {
		console.log(params.floatForce);
		if (params.floatForce !== undefined) this._floatForce = params.floatForce;
	};

	Floater.prototype.setBody = function(body) {
		this._body = body;
	};

	Floater.prototype.control = function(input) {

		var body = this._body;
		if (!body) return;

		if (!input.down.left && (this._floating & Dir.LEFT)) {
			this._floating = this._floating ^ Dir.LEFT;
		}
		if (!input.down.right && (this._floating & Dir.RIGHT)) {
			this._floating = this._floating ^ Dir.RIGHT;
		}
		if (!input.down.up && (this._floating & Dir.UP)) {
			this._floating = this._floating ^ Dir.UP;
		}
		if (!input.down.down && (this._floating & Dir.DOWN)) {
			this._floating = this._floating ^ Dir.DOWN;
		}

		if (input.pressed.left || 
			(input.down.left && this._floating & Dir.LEFT)) {
			body.addForce(-this._floatForce, 0);
			this._facing = Dir.LEFT;
			this._floating = (this._floating | Dir.LEFT) ^ Dir.RIGHT;
		}

		if (input.pressed.right || 
			(input.down.right && this._floating & Dir.RIGHT)) {
			body.addForce(this._floatForce, 0);
			this._facing = Dir.RIGHT;
			this._floating = (this._floating | Dir.RIGHT) ^ Dir.LEFT;
		}

		if (input.pressed.up || 
			(input.down.up && this._floating & Dir.UP)) {
			body.addForce(0, -this._floatForce);
			this._facing = Dir.UP;
			this._floating = (this._floating | Dir.UP) ^ Dir.DOWN;
		}

		if (input.pressed.down || 
			(input.down.down && this._floating & Dir.DOWN)) {
			body.addForce(0, this._floatForce);
			this._facing = Dir.DOWN;
			this._floating = (this._floating | Dir.DOWN) ^ Dir.UP;
		}
	};

	Floater.prototype.post = function() {
		var body = this._body;
		if (!body) return;

		if (body._collisionState.down) {
			this._jumpCount = 0;
		} else if (!this._jumped && this._jumpCount === 0) {
			this._jumpCount++;
		}
	};

	return Floater;

}();