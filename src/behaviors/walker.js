var Dir = gm.Constants.Dir;

gm.Behaviors.Walker = function(body, params) {
	this._body = body;
	this.walkForce = 0;
	this.jumpImpulse = 0;
	this.maxJumps = 0;

	if (params) this.setParams(params);

	this._facing = 0;
	this._jumpCount = 0;
};

gm.Behaviors.Walker.prototype.setParams = function(params) {
	if (params.walkForce !== undefined) this.walkForce = params.walkForce;
	if (params.jumpImpulse !== undefined) this.jumpImpulse = params.jumpImpulse;
	if (params.maxJumps !== undefined) this.maxJumps = params.maxJumps;
};

gm.Behaviors.Walker.prototype.control = function(input) {
	var body = this._body;

	if (input.down.left) {
		body.addForce(-this.walkForce, 0);
		this._facing = Dir.LEFT;
	} 
	else if (input.down.right) {
		body.addForce(this.walkForce, 0);
		this._facing = Dir.RIGHT;
	}

	if (input.pressed.up && this._jumpCount < this.maxJumps) {
		body.addImpulse(0, -this.jumpImpulse);
		this._jumpCount++;
	}	
};

gm.Behaviors.Walker.prototype.post = function() {
	if (this._body._collisionState.down) {
		this._jumpCount = 0;
	}
};