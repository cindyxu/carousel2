gm.Ai.Walker = function(entity, walker) {
	this._approxJumpHeight = -1;
	this._jumpHeightCertainty = 0;

	this._approxJumpWidth = -1;
	this._jumpWidthCertainty = 0;

	this.approxFallAccel = -1;
	this._fallAccelCertainty = 0;

	// simpify and ignore walk accel ...
	this._approxMoveVel = -1;
	this._moveVelCertainty = 0;
};

gm.Ai.Walker.prototype.update = function() {

};

gm.Ai.Walker.prototype.analyzeTraversible = function(splatform, tplatform, tilesize, res) {
	
	var deltaY = ((tplatform.sty - splatform.sty) * tilesize);
	
	if (splatform.etx < tplatform.stx) {

	} else {

	}

	// sorted by out range
	res.ranges = [
		{
			out1: 0,
			out2: 0,
			in1: 0,
			in2: 0,
			canReach: "maybe",
			canReachBy: "jump"
		}
	];

};

