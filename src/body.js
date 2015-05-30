var LOGGING = gm.Settings.LOGGING;

gm.Body = function(params) {
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

	body.__center = {
		x: 0,
		y: 0
	};
	body.__bbox = {
		x0: 0,
		y0: 0,
		x1: 0,
		y1: 0
	};
	body._measurementsDirty = false;

	body._collisionState = gm.CollisionRules.createCollisionState();

	if (params) body.setParams(params);
};

gm.Body.prototype.setParams = function(params) {
	var body = this;
	
	if (params.maxVelX !== undefined) body._maxVelX = params.maxVelX;
	if (params.maxVelY !== undefined) body._maxVelY = params.maxVelY;
	
	if (params.dampX !== undefined) body._dampX = params.dampX;
	if (params.dampY !== undefined) body._dampY = params.dampY;

	if (params.weight !== undefined) body._weight = params.weight;
	
	if (params.sizeX !== undefined) {
		body._sizeX = params.sizeX;
		body._measurementsDirty = true;
	}
	if (params.sizeY !== undefined) {
		body._sizeY = params.sizeY;
		body._measurementsDirty = true;
	}
	if (body._measurementsDirty) body.recalculateMeasurements();

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

gm.Body.prototype.writeState = function(state) {
	state.x = this._x;
	state.y = this._x;
	state.vx = this.vx;
	state.vy = this.vy;
	state.ax = this.ax;
	state.ay = this.ay;

	state.collisionState = gm.CollisionRules.copyCollisionState(state.collisionState || {});
};

gm.Body.prototype.readState = function(state) {
	this._x = state.x;
	this._x = state.y;
	this.vx = state.vx;
	this.vy = state.vy;
	this.ax = state.ax;
	this.ay = state.ay;

	gm.CollisionRules.copyCollisionState(state.collisionState, this._collisionState);

	this._measurementsDirty = true;
};

gm.Body.prototype.moveTo = function(x, y) {
	var body = this;
	
	body._x = x;
	body._y = y;

	body._measurementsDirty = true;

	if (LOGGING && (isNaN(body._x) || isNaN(body._y))) {
		console.log("!!! body - moved to", body._x, body._y);
	}
};

gm.Body.prototype.resetAccel = function() {
	this.ax = 0;
	this.ay = 0;
};

gm.Body.prototype.addForce = function(gx, gy) {
	this.ax += gx * this._weight;
	this.ay += gy * this._weight;

	if (LOGGING && (isNaN(gx) || isNaN(gy))) {
		console.log("!!! body - added force", gx, gy);
	}
};

gm.Body.prototype.addImpulse = function(ix, iy) {
	this.vx += ix * this._weight;
	this.vy += iy * this._weight;
	
	if (LOGGING && (isNaN(ix) || isNaN(iy))) {
		console.log("!!! body - added force", ix, iy);
	}
};

gm.Body.prototype.clampVelLeft = function() {
	this.vx = Math.max(0, this.vx);
};

gm.Body.prototype.clampVelRight = function() {
	this.vx = Math.min(0, this.vx);
};

gm.Body.prototype.clampVelUp = function() {
	this.vy = Math.max(0, this.vy);
};

gm.Body.prototype.clampVelDown = function() {
	this.vy = Math.min(0, this.vy);
};

gm.Body.prototype.recalculateBbox = function() {
	var body = this;

	var bbox = body.__bbox;

	bbox.x0 = body._x;
	bbox.y0 = body._y;
	bbox.x1 = body._x + body._sizeX;
	bbox.y1 = body._y + body._sizeY;
};

gm.Body.prototype.recalculateCenter = function() {
	var body = this;
	
	body.__center.x = body._x + body._sizeX/2;
	body.__center.y = body._y + body._sizeY/2;
};

gm.Body.prototype.recalculateMeasurements = function() {
	var body = this;
	body.recalculateBbox();
	body.recalculateCenter();
	body._measurementsDirty = false;
};

gm.Body.prototype.updateStepX = function(delta) {
	var body = this;

	body._x += body.vx * delta;
	body.vx += (body.ax - (body.vx * body._dampX)) * delta;
	if (body.vx < -body._maxVelX) body.vx = -body._maxVelX;
	else if (body.vx > body._maxVelX) body.vx = body._maxVelX;

	body._measurementsDirty = true;
};

gm.Body.prototype.updateStepY = function(delta) {
	var body = this;

	body._y += body.vy * delta;
	body.vy += (body.ay - (body.vy * body._dampY)) * delta;
	if (body.vy < -body._maxVelY) body.vy = -body._maxVelY;
	else if (body.vy > body._maxVelY) body.vy = body._maxVelY;

	body._measurementsDirty = true;
};

gm.Body.prototype.getCenter = function() {
	var body = this;
	if (body._measurementsDirty) body.recalculateMeasurements();
	return body.__center;
};

gm.Body.prototype.getBbox = function() {
	var body = this;
	if (body._measurementsDirty) body.recalculateMeasurements();
	return body.__bbox;
};

gm.Body.prototype.overlaps = function(other) {
	var body = this;
	var bbox = body.getBbox();
	var obbox = other.getBbox();

	return (bbox.x0 < obbox.x1 && bbox.x1 > obbox.x0 && 
		bbox.y0 < obbox.y1 && bbox.y1 > obbox.y0);
};

gm.Body.prototype.overlapsBbox = function(obbox) {
	var body = this;
	var bbox = body.getBbox();

	return (bbox.x0 < obbox.x1 && bbox.x1 > obbox.x0 && 
		bbox.y0 < obbox.y1 && bbox.y1 > obbox.y0);
};

gm.Body.prototype.overlapsAxisX = function(other) {
	return body._x < other._x + other._sizeX &&
		other._x < body._x + body._sizeX;
};

gm.Body.prototype.overlapsAxis = function(other) {
	return body._y < other._y + other._sizeY &&
	other._y < body._y + body._sizeY;
};

gm.Body.prototype.overlapsPoint = function(x, y) {
	var bbox = this.getBbox();
	return (bbox.x0 <= x && bbox.y0 <= y && bbox.x1 > x && bbox.y1 > y);
};