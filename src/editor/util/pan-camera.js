var PanCamera = gm.Editor.Util.PanCamera = function(camera) {
	this._startX = undefined;
	this._startY = undefined;
	this._startCameraX = undefined;
	this._startCameraY = undefined;
	this._camera = camera;
};

PanCamera.prototype.start = function(x, y) {
	this._startX = x;
	this._startY = y;
	this._startCameraX = this._camera._body._x;
	this._startCameraY = this._camera._body._y;
};

PanCamera.prototype.update = function(x, y) {
	var deltaX = x - this._startX;
	var deltaY = y - this._startY;
	this._camera._body.moveTo(this._startCameraX - deltaX, this._startCameraY - deltaY);
};