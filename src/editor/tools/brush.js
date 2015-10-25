if (!gm.Editor) gm.Editor = {};
if (!gm.Editor.Tools) gm.Editor.Tools = {};

gm.Editor.Tools.Brush = function() {
	
	var Brush = function(layer, params) {
		this.color = this.defaultColor;
		this._mx = undefined;
		this._my = undefined;
		if (params) {
			if (params.color) this.color = params.color;
		}
		this.build(layer);
	};

	Brush.prototype.defaultColor = "yellow";

	Brush.prototype.build = function(layer) {
		var brush = this;

		brush._map = new gm.Map({
			tilesX: 1,
			tilesY: 1,
			tilesize: layer._layerMap._map.tilesize
		});

		var renderer;

		if (layer._isCollision) {
			brush._initCollisionBrush();
			renderer = new gm.Debug.Renderer.Map.Collision(brush._map);
		}
		else {
			if (layer._layerMap._renderer) {
				renderer = new gm.Renderer.ImageMap(brush._map, {
					tilesetSrc: layer._layerMap._renderer._tilesetSrc
				});
			}
		}
		brush._renderer = renderer;
		brush._debugRenderer = new gm.Debug.Renderer.Map.Frame(brush._map, {
			strokeStyle: brush.color
		});

		brush._layer = layer;
	};

	Brush.prototype._initCollisionBrush = function() {
		this._map.setTile(0, 0, gm.Constants.Collision.SOLID);
	};

	var tres = {};
	var pres = {};
	Brush.prototype.render = function(ctx, camera) {

		var layerMap = this._layer._layerMap;

		camera.canvasToWorldPos(this._mx, this._my, pres);
		var bbox = camera._body.getBbox();

		this._layer.posToObservedTile(pres.x, pres.y, bbox, tres);
		this._layer.tileToObservedPos(tres.tx, tres.ty, bbox, pres);
		if (this._renderer) this._renderer.render(ctx, pres.x, pres.y, bbox);
		if (this._debugRenderer) this._debugRenderer.render(ctx, pres.x, pres.y, bbox);
	};

	Brush.prototype.onLayerChanged = function() {
		this.build(this._layer);
	};

	Brush.prototype.fromMapArea = function(map, tx, ty, tsx, tsy) {
		var bmap = this._map;
		bmap.resize(tsx, tsy);
		bmap.copyArea(map, 0, 0, tx, ty, tsx, tsy);
	};

	Brush.prototype.onMouseMove = function(mx, my) {
		this._mx = mx;
		this._my = my;
		
		if (LOGGING && (isNaN(this._mx) || isNaN(this._my))) {
			console.log("!!! brush - mx: ", mx, ", my:", my);
		}
	};

	Brush.prototype.paint = function(camera) {
		var brush = this;
		var bmap = brush._map;
		var layerMap = brush._layer._layerMap;

		camera.canvasToWorldPos(this._mx, this._my, pres);
		brush._layer.posToObservedTile(pres.x, pres.y, camera._body.getBbox(), tres);

		layerMap._map.copyArea(bmap, 
			tres.tx, 
			tres.ty, 
			0, 
			0, 
			bmap._tilesX, 
			bmap._tilesY);
	};

	return Brush;
}();