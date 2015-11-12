if (!gm.Behaviors) gm.Behaviors = {};

gm.Behaviors.Floater = function() {
	var Dir = gm.Constants.Dir;

	var leftKey = gm.Settings.Keys.LEFT;
	var rightKey = gm.Settings.Keys.RIGHT;
	var upKey = gm.Settings.Keys.UP;
	var downKey = gm.Settings.Keys.DOWN;

	var Floater = function(params, body) {

		this._floatForce = 0;

		if (body) this.setBody(body);
		if (params) this.setParams(params);

		this._facing = Dir.RIGHT;

		// this is a combination of directional flags
		this._floating = 0;
	};

	Floater.prototype.setParams = function(params) {
		if (params.floatForce !== undefined) this._floatForce = params.floatForce;
	};

	Floater.prototype.setBody = function(body) {
		this._body = body;
	};

	Floater.prototype.control = function(input) {

		var body = this._body;
		if (!body) return;

		if (!input.down[leftKey] && (this._floating & Dir.LEFT)) {
			this._floating = this._floating ^ Dir.LEFT;
		}
		if (!input.down[rightKey] && (this._floating & Dir.RIGHT)) {
			this._floating = this._floating ^ Dir.RIGHT;
		}
		if (!input.down[upKey] && (this._floating & Dir.UP)) {
			this._floating = this._floating ^ Dir.UP;
		}
		if (!input.down[downKey] && (this._floating & Dir.DOWN)) {
			this._floating = this._floating ^ Dir.DOWN;
		}

		if (input.pressed[leftKey] || 
			(input.down[leftKey] && this._floating & Dir.LEFT)) {
			body.addForce(-this._floatForce, 0);
			this._facing = Dir.LEFT;
			this._floating = (this._floating | Dir.LEFT) ^ Dir.RIGHT;
		}

		if (input.pressed[rightKey] || 
			(input.down[rightKey] && this._floating & Dir.RIGHT)) {
			body.addForce(this._floatForce, 0);
			this._facing = Dir.RIGHT;
			this._floating = (this._floating | Dir.RIGHT) ^ Dir.LEFT;
		}

		if (input.pressed[upKey] || 
			(input.down[upKey] && this._floating & Dir.UP)) {
			body.addForce(0, -this._floatForce);
			this._floating = (this._floating | Dir.UP) ^ Dir.DOWN;
		}

		if (input.pressed[downKey] || 
			(input.down[downKey] && this._floating & Dir.DOWN)) {
			body.addForce(0, this._floatForce);
			this._floating = (this._floating | Dir.DOWN) ^ Dir.UP;
		}
	};

	Floater.prototype.post = function() {
	};

	return Floater;

}();