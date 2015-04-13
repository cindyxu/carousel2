var Brush = gm.Editor.Tools.Brush = function(layer) {
	this.build(layer);
};

Brush.toolName = "BRUSH";
gm.Editor.registerTool(Brush.toolName, Brush);

Brush.prototype = Object.create(gm.Map.prototype);
////

Brush.prototype.build = function(layer) {
	this._map = new gm.Map({
		tilesX: 1,
		tilesY: 1,
		tilesize: layer.layerMap.map.tilesize
	});

	if (layer.layerMap.renderer) {
		this._renderer = new gm.Renderer.ImageMap(this._map, {
			tilesetSrc: layer.layerMap.renderer._tilesetSrc
		});
	}
	this._debugRenderer = new gm.Editor.Renderer.Map(this._map, {
		strokeStyle: gm.Settings.Editor.colors.BRUSH
	});
	this._layer = layer;
};

Brush.prototype.action = function(camera) {
	if (gm.Input.mousedown) this.paint(camera);
};

var tres = {};
var pres = {};
Brush.prototype.render = function(ctx, camera) {
	var layerMap = this._layer.layerMap;

	var mx = gm.Input.mouseX,
		my = gm.Input.mouseY;

	camera.canvasToWorldPos(mx, my, pres);
	var bbox = camera._body.getBbox();

	this._layer.posToObservedTile(pres.x, pres.y, bbox, tres);
	this._layer.tileToObservedPos(tres.tx, tres.ty, bbox, pres);

	if (this._renderer) this._renderer.render(ctx, pres.x, pres.y, bbox);
	this._debugRenderer.render(ctx, pres.x, pres.y, bbox);
};

Brush.prototype.switchIn = function() {

};

Brush.prototype.switchOut = function() {

};

Brush.prototype.shouldSwitchIn = function() {
	return gm.Input.pressed[gm.Settings.Editor.keyBinds.BRUSH];
};

var layerBrushes = {};
Brush.getToolForLayer = function(layer) {
	var brush = layerBrushes[layer._tag];
	if (!brush) {
		brush = layerBrushes[layer._tag] = new Brush(layer);
	}
	return brush;
};

Brush.prototype.onLayerChanged = function(layer) {
	layerBrushes[layer._tag].build(layer);
};

Brush.prototype.fromMapArea = function(map, tx, ty, tsx, tsy) {
	var bmap = this._map;
	bmap.resize(tsx, tsy);
	bmap.copyArea(map, 0, 0, tx, ty, tsx, tsy);
};

Brush.prototype.paint = function(camera) {
	var brush = this;
	var bmap = brush._map;
	var layerMap = brush._layer.layerMap;

	var mx = gm.Input.mouseX,
		my = gm.Input.mouseY;

	camera.canvasToWorldPos(mx, my, pres);
	brush._layer.posToObservedTile(pres.x, pres.y, camera._body.getBbox(), tres);

	layerMap.map.copyArea(bmap, 
		tres.tx, 
		tres.ty, 
		0, 
		0, 
		bmap._tilesX, 
		bmap._tilesY);
};