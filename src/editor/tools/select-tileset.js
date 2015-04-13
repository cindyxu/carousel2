var states = {
	IDLE: 0,
	PANNING: 1,
	SELECTING: 2,
	SELECTED: 3
};

var getTilesetMap = function(layerMap) {
	if (!layerMap.renderer || !layerMap.renderer.isValid()) return undefined;

	var map = layerMap.map,
		renderer = layerMap.renderer;

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

	var tilesetLayerMap = new gm.LayerMap();
	tilesetLayerMap.map = tilesetMap;
	tilesetLayerMap.renderer = tilesetRenderer;

	return tilesetLayerMap;
};

var SelectTileset = gm.Editor.Tools.SelectTileset = function(layer) {
	this.state = states.IDLE;
	this.tilesetLayerMap = getTilesetMap(layer.layerMap);
	this.localCamera = new gm.Camera();
	this.pan = new gm.Editor.Util.PanCamera(this.localCamera);
	this.selector = undefined;
};

SelectTileset.toolName = "SELECT_TILESET";
SelectTileset.prototype.holdTool = true;
gm.Editor.registerTool(SelectTileset.toolName, SelectTileset);

var selectTilesets = {};

SelectTileset.getToolForLayer = function(layer) {
	if (!selectTilesets[layer._tag]) {
		selectTilesets[layer._tag] = new SelectTileset(layer);
	}
	return selectTilesets[layer._tag];
};

SelectTileset.prototype.onLayerChanged = function(layer) {
	this.tilesetLayerMap = getTilesetMap(layer.layerMap);
	this.state = states.IDLE;
	if (this.tilesetLayerMap) {
		this.selector = new gm.Editor.Util.Selector(this.tilesetLayerMap);
	}
};

SelectTileset.prototype.shouldSwitchIn = function() {
	return gm.Input.pressed[gm.Settings.Editor.keyBinds.SELECT_TILESET];
};

SelectTileset.prototype.shouldSwitchOut = function() {
	return this.state === states.SELECTED || 
		gm.Input.pressed[gm.Settings.Editor.keyBinds.SELECT_TILESET];
};

SelectTileset.prototype.switchIn = function() {
	this.state = states.IDLE;
	if (this.tilesetLayerMap) {
		this.selector = new gm.Editor.Util.Selector(this.tilesetLayerMap);
	}
};

SelectTileset.prototype.switchOut = function() {
	if (this.isValid() && this.state === states.SELECTED) {
		var brush = gm.Editor._toolPalette[gm.Editor.Tools.Brush.toolName];
		if (brush) {
			var tb = this.selector.finish();
			brush.fromMapArea(this.tilesetLayerMap.map,
				tb.tx0, tb.ty0, tb.tx1 - tb.tx0 + 1, tb.ty1 - tb.ty0 + 1); 
		}
	}
	this.selector = undefined;
};

SelectTileset.prototype.isValid = function() {
	return !!this.tilesetLayerMap;
};

var res = {};
SelectTileset.prototype.action = function() {

	if (!this.isValid()) return;

	var mx = gm.Input.mouseX,
		my = gm.Input.mouseY;
	this.localCamera.canvasToWorldPos(mx, my, res);

	if (this.state === states.IDLE) {

		this.selector.update(res.x, res.y);
		if (gm.Input.mousedown) {
			this.state = states.SELECTING;
			this.selector.start(res.x, res.y);
		}
		else if (gm.Input.down[gm.Settings.Editor.keyBinds.PAN]) {
			this.state = states.PANNING;
			this.pan.start(gm.Input.mouseX, gm.Input.mouseY);
		}

	} else if (this.state === states.PANNING) {

		this.pan.update(gm.Input.mouseX, gm.Input.mouseY);
		if (!gm.Input.down[gm.Settings.Editor.keyBinds.PAN]) {
			this.state = states.IDLE;
		}

	} else if (this.state === states.SELECTING) {
		
		this.selector.update(res.x, res.y);
		if (!gm.Input.mousedown) {
			this.state = states.SELECTED;
		}
	}
};

SelectTileset.prototype.render = function(ctx) {
	
	if (!this.isValid()) {
		gm.Editor.Util.Shapes.X(ctx, gm.Input.mouseX, gm.Input.mouseY);
	}
	else {
		var bbox = this.localCamera._body.getBbox();

		ctx.save();
		ctx.fillStyle = "rgba(0,0,0,0.5)";
		ctx.fillRect(0, 0, bbox.x1 - bbox.x0, bbox.y1 - bbox.y0);
		this.tilesetLayerMap.render(ctx, bbox);
		ctx.restore();

		if (this.state === states.PANNING) {
			gm.Editor.Util.Shapes.O(ctx, gm.Input.mouseX, gm.Input.mouseY);
		}
		else if (this.selector) this.selector.render(ctx, bbox);
	}
};