if (!gm.Editor) gm.Editor = {};
if (!gm.Editor.Tools) gm.Editor.Tools = {};

var Pan = gm.Editor.Tools.Pan = {};

Pan.getToolForLayer = function() {
	return Pan;
};

Pan.switchIn = function(camera) {
	panCamera = new gm.Editor.Util.PanCamera(camera);
	panCamera.start(gm.Input.mouseX, gm.Input.mouseY);
};

Pan.action = function() {
	panCamera.update(gm.Input.mouseX, gm.Input.mouseY);
};

Pan.render = function(ctx) {
	gm.Editor.Util.Shapes.O(ctx, gm.Input.mouseX, gm.Input.mouseY);
};