if (!gm.Editor.Tools) gm.Editor.Tools = {};

gm.Editor.Tools.Pan = {
	_mx: undefined,
	_my: undefined
};

gm.Editor.Tools.Pan.getToolForLayer = function() {
	return Pan;
};

gm.Editor.Tools.Pan.switchIn = function(mx, my, camera) {
	this._panCamera = new gm.Editor.Util.PanCamera(camera);
	this._panCamera.start(mx, my);
};

gm.Editor.Tools.Pan.onMouseMove = function(mx, my) {
	this._mx = mx;
	this._my = my;
	this._panCamera.update(mx, my);

	if (LOGGING && (isNaN(this._mx) || isNaN(this._my))) {
		console.log("!!! brush - mx: ", mx, ", my:", my);
	}
};

gm.Editor.Tools.Pan.render = function(ctx) {
	gm.Editor.Util.Shapes.O(ctx, this._mx, this._my);
};