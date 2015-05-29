if (!gm.Editor) gm.Editor = {};
if (!gm.Editor.Tools) gm.Editor.Tools = {};

var Move = gm.Editor.Tools.Move = function() {
	this._mx = undefined;
	this._my = undefined;
	this._mover = undefined;
	this._layer = undefined;
};

Move.prototype.switchLayer = function(layer) {
	this._layer = layer;
};

Move.prototype.getMoveBody = function(mx, my, camera) {
	camera.canvasToWorldPos(res);
	var bbox = camera._body.getBbox();
	var level = this.level;

	this._layer.transformPointToLocalSpace(res.x, res,y, bbox, lres);
	for (var e = layer._entities.length - 1; e >= 0; e--) {
		var entity = layer._entities[e];
		if (entity._body._overlapsPoint(lres.x, lres.y)) {
			return entity._body;
		}
	}
};

var res = {};
var lres = {};
Move.prototype.switchIn = function(mx, my, camera) {
	var moveBody = this._getMoveBody(mx, my, camera);
	this._mover = new gm.Editor.Util.MoveBody(moveBody);
	this._mover.start(mx, my);
};

Move.prototype.onMouseMove = function(mx, my) {
	this._mx = mx;
	this._my = my;
	this._mover.update(mx, my);
};

Move.prototype.render = function(ctx) {
	gm.Editor.Util.Shapes.O(ctx, this._mx, this._my, "rgba(255,200,0,0.5)");
};