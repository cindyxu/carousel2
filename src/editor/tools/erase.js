if (!gm.Editor) gm.Editor = {};
if (!gm.Editor.Tools) gm.Editor.Tools = {};

var Erase = gm.Editor.Tools.Erase = function(layer, params) {
	this.color = this.defaultColor;
	if (params) {
		if (params.color) this.color = params.color;
}
	this._build(layer);
};

Erase.prototype = Object.create(gm.Editor.Tools.Brush.prototype);

Erase.prototype._initCollisionBrush = function() {
	this._map.setTile(0, 0, undefined);
};

Erase.prototype.defaultColor = "red";

Erase.prototype._build = function(layer) {
	gm.Editor.Tools.Brush.prototype._build.call(this, layer);
};

Erase.onLayerChanged = function(layer) {
	this._build(layer);
};