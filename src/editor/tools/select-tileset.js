var states = {
	IDLE: 0,
	DRAGGING: 1,
	SELECTING: 2,
	SELECTED: 3
};

var SelectTileset = gm.Editor.Tools.SelectTileset = function(layer) {
	this.state = states.IDLE;
	this.tilesetLayerMap = getTilesetMap(layer.layerMap);
	this.selector = undefined;
};

SelectTileset.toolName = "SELECT_TILESET";
SelectTileset.prototype.holdTool = true;
gm.Editor.registerTool(SelectTileset.toolName, SelectTileset);

var selectTilesets = {};

var getTilesetMap = function(layerMap) {

	if (!layerMap.renderer || !layerMap.renderer.isValid) return undefined;

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

SelectTileset.getToolForLayer = function(layer) {
	if (!selectTilesets[layer.tag]) {
		selectTilesets[layer.tag] = new SelectTileset(layer);
	}
	return selectTilesets[layer.tag];
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
	return this.state === states.SELECTED;
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
			brush.fromMapArea(this.tilesetLayerMap.map, tb.tx0, tb.ty0, tb.tx1 - tb.tx0, tb.ty1 - tb.ty0);
		}
	}
	this.selector = undefined;
};

SelectTileset.prototype.isValid = function() {
	return !!this.tilesetLayerMap;
};

var pres = {};
SelectTileset.prototype.action = function(camera) {

	if (!this.isValid()) return;

	var mx = gm.Input.mouseX,
		my = gm.Input.mouseY;
	camera.canvasToWorldPos(mx, my, pres);
	var bbox = camera._body.getBbox();

	if (this.state === states.IDLE) {

		this.selector.update(pres.x, pres.y);
		if (gm.Input.mousedown) {
			this.state = states.SELECTING;
			this.selector.start(pres.x, pres.y);
		}

	} else if (this.state === states.SELECTING) {
		
		this.selector.update(pres.x, pres.y);
		if (!gm.Input.mousedown) {
			this.state = states.SELECTED;
		}
	}
};

SelectTileset.prototype.render = function(ctx, camera) {
	
	if (!this.isValid()) {
		gm.Editor.Util.Shapes.X(ctx, gm.Input.mouseX, gm.Input.mouseY);
	}
	else {
		ctx.save();
		var bbox = camera._body.getBbox();
		ctx.fillStyle = "rgba(0,0,0,0.5)";
		ctx.fillRect(bbox.x0, bbox.y0, bbox.x1 - bbox.x0, bbox.y1 - bbox.y0);
		this.tilesetLayerMap.render(ctx, bbox);
		ctx.restore();

		if (this.selector) this.selector.render(ctx);
	}
};