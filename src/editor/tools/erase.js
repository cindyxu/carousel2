var Erase = gm.Editor.Tools.Erase = function() {};

Erase.prototype = Object.create(gm.Editor.Tools.Brush.prototype);

Erase.toolName = "ERASE";

gm.Editor.registerTool(Erase.toolName, Erase);

var layerErasers = {};
Erase.getToolForLayer = function(layer) {
	var erase = layerErasers[layer._tag];
	if (!erase) {
		erase = layerErasers[layer._tag] = new Erase(layer);
	}
	return erase;
};