gm.Body = function() {
	
	var Body = function(params) {
		var body = this;
		
		body._maxVelX = 0;
		body._maxVelY = 0;
		
		body._dampX = 0;
		body._dampY = 0;
		
		body._weight = 0;
		
		body._sizeX = 0;
		body._sizeY = 0;

		body._x = 0;
		body._y = 0;
		body.vx = 0;
		body.vy = 0;
		body.ax = 0;
		body.ay = 0;

		body._collisionState = gm.CollisionRules.createCollisionState();

		if (params) body.setParams(params);
	};

	Body.prototype.setParams = function(params) {
		var body = this;
		
		if (params.maxVelX !== undefined) body._maxVelX = params.maxVelX;
		if (params.maxVelY !== undefined) body._maxVelY = params.maxVelY;
		
		if (params.dampX !== undefined) body._dampX = params.dampX;
		if (params.dampY !== undefined) body._dampY = params.dampY;

		if (params.weight !== undefined) body._weight = params.weight;
		
		if (params.sizeX !== undefined) body._sizeX = params.sizeX;
		if (params.sizeY !== undefined) body._sizeY = params.sizeY;

		if (LOGGING) {
			if (isNaN(body._sizeX) || isNaN(body._sizeY)) {
				console.log("!!! body - size:", body._sizeX, ",", body._sizeY);
			}
			if (isNaN(body._maxVelX) || isNaN(body._maxVelY)) {
				console.log("!!! body - maxvel:", body._maxVelX, ",", body._maxVelY);
			}
			if (isNaN(body._dampX) || isNaN(body._dampY)) {
				console.log("!!! body - damp:", body._dampX, ",", body._dampY);
			}
			if (isNaN(body._weight)) {
				console.log("!!! body - weight:", body._weight);
			}
		}
	};

	Body.prototype.moveTo = function(x, y) {
		var body = this;
		
		body._x = x;
		body._y = y;
		
		if (LOGGING && (isNaN(body._x) || isNaN(body._y))) {
			console.log("!!! body - moved to", body._x, body._y);
		}
	};

	Body.prototype.moveToBbox = function(bbox, anchor) {
		var x, y;
		
		if (anchor & Dir.LEFT) x = bbox.x0;
		else if (anchor & Dir.RIGHT) x = bbox.x1;
		else x = bbox.x0 + (bbox.x1 - bbox.x0)/2 - this._sizeX/2;
		
		if (anchor & Dir.UP) y = bbox.y0;
		else if (anchor & Dir.DOWN) y = bbox.y1;
		else y = bbox.y0 + (bbox.y1 - bbox.y0)/2 - this._sizeY/2;

		this.moveTo(x, y);
	};

	var obbox = {};
	Body.prototype.moveToBody = function(other, anchor) {
		other.getBbox(obbox);
		this._moveToBbox(obbox);
	};

	Body.prototype.resetAccel = function() {
		this.ax = 0;
		this.ay = 0;
	};

	Body.prototype.addForce = function(gx, gy) {
		this.ax += gx * this._weight;
		this.ay += gy * this._weight;

		if (LOGGING && (isNaN(gx) || isNaN(gy))) {
			console.log("!!! body - added force", gx, gy);
		}
	};

	Body.prototype.addImpulse = function(ix, iy) {
		this.vx += ix * this._weight;
		if (this.vx < -this._maxVelX) this.vx = -this._maxVelX;
		else if (this.vx > this._maxVelX) this.vx = this._maxVelX;

		this.vy += iy * this._weight;
		if (this.vy < -this._maxVelY) this.vy = -this._maxVelY;
		else if (this.vy > this._maxVelY) this.vy = this._maxVelY;

		if (LOGGING && (isNaN(ix) || isNaN(iy))) {
			console.log("!!! body - added force", ix, iy);
		}
	};

	Body.prototype.clampVelLeft = function() {
		this.vx = Math.max(0, this.vx);
	};

	Body.prototype.clampVelRight = function() {
		this.vx = Math.min(0, this.vx);
	};

	Body.prototype.clampVelUp = function() {
		this.vy = Math.max(0, this.vy);
	};

	Body.prototype.clampVelDown = function() {
		this.vy = Math.min(0, this.vy);
	};

	Body.prototype.updateStepX = function(dt) {
		var body = this;

		var dmpax = body.ax - (body.vx * body._dampX);
		body._x += body.vx * dt;
		body.vx += dmpax * dt;
		if (body.vx < -body._maxVelX) body.vx = -body._maxVelX;
		else if (body.vx > body._maxVelX) body.vx = body._maxVelX;
	};

	Body.prototype.updateStepY = function(dt) {

		var body = this;

		var dmpay = body.ay - (body.vy * body._dampY);
		body.vy += dmpay * dt;
		if (body.vy < -body._maxVelY) body.vy = -body._maxVelY;
		else if (body.vy > body._maxVelY) body.vy = body._maxVelY;
		body._y += body.vy * dt;
	};

	Body.prototype.postUpdate = function() {
	};

	Body.prototype.getCenter = function(rcen) {
		rcen.x = this._x + this._sizeX/2;
		rcen.y = this._y + this._sizeY/2;
	};

	Body.prototype.getBbox = function(rbbox) {
		rbbox.x0 = this._x;
		rbbox.y0 = this._y;
		rbbox.x1 = this._x + this._sizeX;
		rbbox.x1 = this._y + this._sizeY;
	};

	var bbox = {};
	Body.prototype.overlaps = function(other) {
		var body = this;
		body.getBbox(bbox);
		other.getBbox(obbox);

		return gm.Math.bboxesOverlap(bbox, obbox);
	};

	Body.prototype.overlapsBbox = function(obbox) {
		var body = this;
		body.getBbox(bbox);

		return gm.Math.bboxesOverlap(bbox, obbox);
	};

	Body.prototype.overlapsAxisX = function(other) {
		return this._x < other._x + other._sizeX &&
			other._x < this._x + this._sizeX;
	};

	Body.prototype.overlapsAxisY = function(other) {
		return this._y < other._y + other._sizeY &&
			other._y < this._y + this._sizeY;
	};

	Body.prototype.overlapsAxis = function(other) {
		return this._y < other._y + other._sizeY &&
		other._y < this._y + this._sizeY;
	};

	Body.prototype.overlapsPoint = function(x, y) {
		this.getBbox(bbox);
		return (bbox.x0 <= x && bbox.y0 <= y && bbox.x1 > x && bbox.y1 > y);
	};

	return Body;
}();