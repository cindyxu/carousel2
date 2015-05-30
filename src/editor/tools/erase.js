if (!gm.Editor) gm.Editor = {};
if (!gm.Editor.Tools) gm.Editor.Tools = {};

gm.Editor.Tools.Erase = function() {

	var Erase = function(layer, params) {
		this.color = this.defaultColor;
		this._mx = undefined;
		this._my = undefined;
		if (params) {
			if (params.color) this.color = params.color;
		}
		this.build(layer);
	};

	Erase.prototype = Object.create(gm.Editor.Tools.Brush.prototype);

	Erase.prototype._initCollisionBrush = function() {
		this._map.setTile(0, 0, undefined);
	};

	Erase.prototype.defaultColor = "red";

	Erase.prototype.build = function(layer) {
		gm.Editor.Tools.Brush.prototype.build.call(this, layer);
	};

	Erase.prototype.onLayerChanged = function(layer) {
		this.build(layer);
	};

	return Erase;

}();