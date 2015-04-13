var Pan = gm.Editor.Tools.Pan = {};

Pan.toolName = "PAN";
Pan.holdTool = true;
gm.Editor.registerTool(Pan.toolName, Pan);

Pan.getToolForLayer = function() {
	return Pan;
};

Pan.shouldSwitchIn = function() {
	return gm.Input.down[gm.Settings.Editor.keyBinds.PAN];
};

Pan.shouldSwitchOut = function() {
	return !gm.Input.down[gm.Settings.Editor.keyBinds.PAN];
};

Pan.switchIn = function(camera) {
	panCamera = new gm.Editor.Util.PanCamera(camera);
	panCamera.start(gm.Input.mouseX, gm.Input.mouseY);
};

Pan.switchOut = function() {};

Pan.action = function() {
	panCamera.update(gm.Input.mouseX, gm.Input.mouseY);
};

Pan.render = function(ctx) {
	gm.Editor.Util.Shapes.O(ctx, gm.Input.mouseX, gm.Input.mouseY);
};