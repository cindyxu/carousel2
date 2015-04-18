var Dir = gm.Constants.Dir;

gm.Behaviors.Runner = function(body, params) {
	this._body = body;
	this.runForce = 0;
	this.jumpImpulse = 0;
	this.maxJumps = 0;

	if (params) this.setParams(params);

	this._facing = 0;
	this._jumpCount = 0;
};

gm.Behaviors.Runner.prototype.setParams = function(params) {
	if (params.runForce !== undefined) this.runForce = params.runForce;
	if (params.jumpImpulse !== undefined) this.jumpImpulse = params.jumpImpulse;
	if (params.maxJumps !== undefined) this.maxJumps = params.maxJumps;
};

gm.Behaviors.Runner.prototype.control = function(input) {
	var body = this._body;

	if (input.down.left) {
		body.addForce(-this.runForce, 0);
		this._facing = Dir.LEFT;
	} 
	else if (input.down.right) {
		body.addForce(this.runForce, 0);
		this._facing = Dir.RIGHT;
	}

	if (input.pressed.up && this._jumpCount < this.maxJumps) {
		body.addImpulse(0, -this.jumpImpulse);
		this._jumpCount++;
	}	
};

gm.Behaviors.Runner.prototype.post = function() {
	if (this._body._collisionState.down) {
		this._jumpCount = 0;
	}
};