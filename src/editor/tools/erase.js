var Erase = gm.Editor.Tools.Erase = function(layer) {
	this.build(layer);
};

Erase.prototype = Object.create(gm.Editor.Tools.Brush.prototype);

Erase.toolName = "ERASE";
gm.Editor.registerTool(Erase.toolName, Erase);

Erase.prototype.build = function(layer) {
	gm.Editor.Tools.Brush.prototype.build.call(this, layer);
	this._debugRenderer.strokeStyle = gm.Settings.Editor.colors.ERASE;
};

var layerErasers = {};
Erase.getToolForLayer = function(layer) {
	var erase = layerErasers[layer._tag];
	if (!erase) {
		erase = layerErasers[layer._tag] = new Erase(layer);
	}
	return erase;
};

Erase.onLayerChanged = function(layer) {
	layerErasers[layer._tag].build(layer);
};

Erase.prototype.shouldSwitchIn = function() {
	return gm.Input.pressed[gm.Settings.Editor.keyBinds.ERASE];
};