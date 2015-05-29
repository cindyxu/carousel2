if (!gm.Editor) gm.Editor = {};
if (!gm.Editor.Tools) gm.Editor.Tools = {};

var Pan = gm.Editor.Tools.Pan = {
	_mx: undefined,
	_my: undefined
};

Pan.getToolForLayer = function() {
	return Pan;
};

Pan.switchIn = function(mx, my, camera) {
	this._panCamera = new gm.Editor.Util.PanCamera(camera);
	this._panCamera.start(mx, my);
};

Pan.onMouseMove = function(mx, my) {
	this._mx = mx;
	this._my = my;
	this._panCamera.update(mx, my);
};

Pan.render = function(ctx) {
	gm.Editor.Util.Shapes.O(ctx, this._mx, this._my);
};