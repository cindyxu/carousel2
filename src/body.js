var dir = gm.Constants.Dir;
var X = gm.Constants.Dim.X,
	Y = gm.Constants.Dim.Y;

gm.Body = function(params) {
	var body = this;
	
	body.maxVelX = 0;
	body.maxVelY = 0;
	
	body.dampX = 0;
	body.dampY = 0;
	
	body.weight = 0;
	
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
	body.measurementsDirty = false;

	body._collisionState = gm.CollisionRules.createCollisionState();

	if (params) body.setParams(params);
};

gm.Body.prototype.setParams = function(params) {
	var body = this;
	
	if (params.maxVelX !== undefined) body.maxVelX = params.maxVelX;
	if (params.maxVelY !== undefined) body.maxVelY = params.maxVelY;
	
	if (params.dampX !== undefined) body.dampX = params.dampX;
	if (params.dampY !== undefined) body.dampY = params.dampY;

	if (params.weight !== undefined) body.weight = params.weight;
	
	if (params.sizeX !== undefined) {
		body._sizeX = params.sizeX;
		body.measurementsDirty = true;
	}
	if (params.sizeY !== undefined) {
		body._sizeY = params.sizeY;
		body.measurementsDirty = true;
	}
	if (body.measurementsDirty) body.recalculateMeasurements();
};

gm.Body.prototype.moveTo = function(x, y) {
	var body = this;
	
	body._x = x;
	body._y = y;

	body.measurementsDirty = true;
};

gm.Body.prototype.resetAccel = function() {
	this.ax = 0;
	this.ay = 0;
};

gm.Body.prototype.addForce = function(gx, gy) {
	this.ax += gx * this.weight;
	this.ay += gy * this.weight;
};

gm.Body.prototype.addImpulse = function(ix, iy) {
	this.vx += ix * this.weight;
	this.vy += iy * this.weight;
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
	body.measurementsDirty = false;
};

gm.Body.prototype.updateStep = function(delta, dim) {
	var body = this;

	if (dim === X) {
		body._x += body.vx * delta;
		body.vx += (body.ax - (body.vx * body.dampX)) * delta;
		if (body.vx < -body.maxVelX) body.vx = -body.maxVelX;
		else if (body.vx > body.maxVelX) body.vx = body.maxVelX;
	} else {
		body._y += body.vy * delta;
		body.vy += (body.ay - (body.vy * body.dampY)) * delta;
		if (body.vy < -body.maxVelY) body.vy = -body.maxVelY;
		else if (body.vy > body.maxVelY) body.vy = body.maxVelY;
	}

	body.measurementsDirty = true;
};

gm.Body.prototype.getCenter = function() {
	var body = this;
	if (body.measurementsDirty) body.recalculateMeasurements();
	return body.__center;
};

gm.Body.prototype.getBbox = function() {
	var body = this;
	if (body.measurementsDirty) body.recalculateMeasurements();
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

gm.Body.prototype.overlapsAxis = function(other, dim) {
	if (dim === X) {
		return body._x < other._x + other._sizeX &&
			other._x < body._x + body._sizeX;
	} else {
		return body._y < other._y + other._sizeY &&
		other._y < body._y + body._sizeY;
	}
};

gm.Body.prototype.render = function(ctx) {

};