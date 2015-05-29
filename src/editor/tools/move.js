if (!gm.Editor) gm.Editor = {};
if (!gm.Editor.Tools) gm.Editor.Tools = {};

var Move = gm.Editor.Tools.Move = {
	_mx: undefined,
	_my: undefined,
	_mover: undefined
};

Move.getToolForLayer = function() {
	return Move;
};

Move.switchIn = function(mx, my, entity, camera) {
	this._mover = new gm.Editor.Util.MoveEntity(entity);
	this._mover.start(mx, my);
};

Move.onMouseMove = function(mx, my) {
	this._mx = mx;
	this._my = my;
	this._mover.update(mx, my);
};

Move.render = function(ctx) {
	gm.Editor.Util.Shapes.O(ctx, this._mx, this._my);
};