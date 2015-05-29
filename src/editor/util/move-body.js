if (!gm.Editor) gm.Editor = {};
if (!gm.Editor.Util) gm.Editor.Util = {};

var MoveBody = gm.Editor.Util.MoveBody = function(body) {
	this._startX = undefined;
	this._startY = undefined;
	this._body = body;
	this._offsetX = undefined;
	this._offsetY = undefined;
};

MoveBody.prototype.start = function(x, y, body) {
	this._startX = x;
	this._startY = y;
	this._offsetX = this._body._x - x;
	this._offsetY = this._body._y - y;
};

MoveBody.prototype.update = function(x, y) {
	var deltaX = x - this._startX;
	var deltaY = y - this._startY;
	this._body.moveTo(this._startX + deltaX + this._offsetX, this._startY + deltaY + this._offsetY);
};