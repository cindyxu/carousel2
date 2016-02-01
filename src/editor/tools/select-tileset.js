if (!gm.Editor.Tools) gm.Editor.Tools = {};

gm.Editor.Tools.SelectTileset = function() {

	var states = {
		IDLE: 0,
		PANNING: 1,
		SELECTING: 2,
		SELECTED: 3
	};

	var getTilesetMap = function(layer) {
		if (layer._isCollision) return undefined;

		var layerMap = layer._layerMap;
		if (!layerMap._renderer || !layerMap._renderer.isValid()) return undefined;

		var map = layerMap._map,
			renderer = layerMap._renderer;

		var tilesX = renderer._imageTilesX / (renderer._framesPerRow || 1);
		var tilesY = renderer._imageTilesY;

		var tiles = [];
		for (var y = 0; y < tilesY; y++) {
			for (var x = 0; x < tilesX; x++) {
				tiles[y * tilesX + x] = y * tilesX + x;
			}
		}

		var tilesetMap = new gm.Map({
			tilesX: tilesX,
			tilesY: tilesY,
			tilesize: map.tilesize,
			tiles: tiles
		});

		var tilesetRenderer = new gm.Renderer.ImageMap(tilesetMap, {
			tilesetSrc: renderer._tilesetSrc
		});

		var tilesetLayerMap = new gm.LayerMap(tilesetMap, tilesetRenderer);

		return tilesetLayerMap;
	};

	var SelectTileset = function(layer) {
		this._state = states.IDLE;
		this._layer = layer;
		this._tilesetLayerMap = getTilesetMap(layer);
		this._localCamera = new gm.Camera();
		this._pan = new gm.Editor.Util.PanCamera(this._localCamera);
		this._selector = undefined;
		this._tb = undefined;
		this._mx = undefined;
		this._my = undefined;
	};

	SelectTileset.prototype.onLayerChanged = function(layer) {
		this._tilesetLayerMap = getTilesetMap(layer);
		if (this._tilesetLayerMap) {
			this._selector = new gm.Editor.Util.Selector(this._tilesetLayerMap);
		}
	};

	SelectTileset.prototype.switchIn = function() {
		this._state = states.IDLE;
		if (this._tilesetLayerMap) {
			this._selector = new gm.Editor.Util.Selector(this._tilesetLayerMap);
		}
	};

	SelectTileset.prototype.switchOut = function(brush) {
		var tb;
		if (this.isValid() && this._state === states.SELECTED) {
			tb = this._selector.finish();
		}
		this._selector = undefined;
		return tb;
	};

	SelectTileset.prototype.copyToBrush = function(brush, tb) {
		brush.fromMapArea(this._tilesetLayerMap._map,
				tb.tx0, tb.ty0, tb.tx1 - tb.tx0 + 1, tb.ty1 - tb.ty0 + 1); 
	};

	SelectTileset.prototype.isValid = function() {
		return !!this._tilesetLayerMap;
	};

	var res = {};
	SelectTileset.prototype.onMouseMove = function(mx, my) {

		this._mx = mx;
		this._my = my;

		if (!this.isValid()) return;

		if (this._state === states.IDLE) {
			this._localCamera.canvasToWorldPos(mx, my, res);
			this._selector.update(res.x, res.y);

		} else if (this._state === states.PANNING) {
			this._pan.update(mx, my);

		} else if (this._state === states.SELECTING) {
			this._localCamera.canvasToWorldPos(mx, my, res);
			this._selector.update(res.x, res.y);
		}

		if (LOGGING && (isNaN(this._mx) || isNaN(this._my))) {
			console.log("!!! brush - mx: ", mx, ", my:", my);
		}
	};

	SelectTileset.prototype.isIdle = function() {
		return this._state === states.IDLE;
	};

	SelectTileset.prototype.isPanning = function() {
		return this._state === states.PANNING;
	};

	SelectTileset.prototype.isSelecting = function() {
		return this._state === states.SELECTING;
	};

	SelectTileset.prototype.hasSelected = function() {
		return this._state === states.SELECTED;
	};

	SelectTileset.prototype.startSelecting = function() {
		if (!this._tilesetLayerMap) return;
		this._state = states.SELECTING;
		this._localCamera.canvasToWorldPos(this._mx, this._my, res);
		this._selector.start(res.x, res.y);
	};

	SelectTileset.prototype.finishSelecting = function() {
		this._state = states.SELECTED;
	};

	SelectTileset.prototype.startPanning = function() {
		this._state = states.PANNING;
		this._pan.start(this._mx, this._my);
	};

	SelectTileset.prototype.finishPanning = function() {
		this._state = states.IDLE;
	};

	var bbox = {};
	SelectTileset.prototype.render = function(ctx) {
		
		if (!this.isValid()) {
			gm.Editor.Util.Shapes.X(ctx, this._mx, this._my);
		}
		else {
			this._localCamera._body.getBbox(bbox);

			ctx.save();
			ctx.fillStyle = "rgba(0,0,0,0.5)";
			ctx.fillRect(0, 0, bbox.x1 - bbox.x0, bbox.y1 - bbox.y0);
			this._tilesetLayerMap.render(ctx, bbox);
			ctx.restore();

			if (this._state === states.PANNING) {
				gm.Editor.Util.Shapes.O(ctx, this._mx, this._my);
			}
			else if (this._selector) this._selector.render(ctx, bbox);
		}
	};

	return SelectTileset;

}();