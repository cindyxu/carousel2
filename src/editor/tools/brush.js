if (!gm.Editor) gm.Editor = {};
if (!gm.Editor.Tools) gm.Editor.Tools = {};

var Brush = gm.Editor.Tools.Brush = function(layer, params) {
	this.color = this.defaultColor;
	if (params) {
		if (params.color) this.color = params.color;
	}
	this._build(layer);
};

Brush.prototype = Object.create(gm.Map.prototype);
////
Brush.prototype.defaultColor = "yellow";

Brush.prototype._build = function(layer) {
	var brush = this;
	brush._map = new gm.Map({
		tilesX: 1,
		tilesY: 1,
		tilesize: layer._layerMap._map.tilesize
	});

	var renderer;

	if (layer._isCollision) {
		brush._initCollisionBrush();
		renderer = new gm.Renderer.CollisionMap(brush._map);
	}
	else {
		if (layer._layerMap.renderer) {
			renderer = new gm.Renderer.ImageMap(brush._map, {
				tilesetSrc: layer._layerMap.renderer._tilesetSrc
			});
		}
	}
	brush._renderer = renderer;
	brush._debugRenderer = new gm.Renderer.DebugMap(brush._map, {
		strokeStyle: brush.color
	});

	brush._layer = layer;
};

Brush.prototype._initCollisionBrush = function() {
	this._map.setTile(0, 0, gm.Constants.Collision.SOLID);
};

Brush.prototype.action = function(camera) {
	if (gm.Input.mousedown) this._paint(camera);
};

var tres = {};
var pres = {};
Brush.prototype.render = function(ctx, camera) {
	var layerMap = this._layer._layerMap;

	var mx = gm.Input.mouseX,
		my = gm.Input.mouseY;

	camera.canvasToWorldPos(mx, my, pres);
	var bbox = camera._body.getBbox();

	this._layer.posToObservedTile(pres.x, pres.y, bbox, tres);
	this._layer.tileToObservedPos(tres.tx, tres.ty, bbox, pres);

	if (this._renderer) this._renderer.render(ctx, pres.x, pres.y, bbox);
	if (this._debugRenderer) this._debugRenderer.render(ctx, pres.x, pres.y, bbox);
};

Brush.onLayerChanged = function() {
	this._build(this._layer);
};

Brush.prototype.fromMapArea = function(map, tx, ty, tsx, tsy) {
	var bmap = this._map;
	bmap.resize(tsx, tsy);
	bmap.copyArea(map, 0, 0, tx, ty, tsx, tsy);
};

Brush.prototype._paint = function(camera) {
	var brush = this;
	var bmap = brush._map;
	var layerMap = brush._layer._layerMap;

	var mx = gm.Input.mouseX,
		my = gm.Input.mouseY;

	camera.canvasToWorldPos(mx, my, pres);
	brush._layer.posToObservedTile(pres.x, pres.y, camera._body.getBbox(), tres);

	layerMap._map.copyArea(bmap, 
		tres.tx, 
		tres.ty, 
		0, 
		0, 
		bmap._tilesX, 
		bmap._tilesY);
};