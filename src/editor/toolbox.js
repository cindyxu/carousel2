var LOGGING = gm.Settings.LOGGING;

var toolWrappers = [];

var Brush = gm.Editor.Tools.Brush;

var layerBrushes = {};
var activeBrush;

var brushWrapper = {
	onLayerSwitched : function(layer) {
		activeBrush = layerBrushes[layer._tag];
		if (!activeBrush) {
			activeBrush = layerBrushes[layer._tag] = new Brush(layer);
		}
	},
	shouldSwitchIn: function() {
		return gm.Input.pressed[gm.Settings.Editor.keyBinds.BRUSH];
	},
	onLayerChanged: function(layer) {
		var brush = layerBrushes[layer._tag];
		if (!brush) {
			brush = layerBrushes[layer._tag] = new Brush(layer);
		} else {
			brush.build(layer);
		}
	},
	switchIn: function() {
		if (LOGGING) console.log("active tool: brush");
	},
	switchOut: function() {
	},
	action: function(camera) {
		activeBrush.onMouseMove(gm.Input.mouseX, gm.Input.mouseY);
		if (gm.Input.mousedown) activeBrush.paint(camera);
	},
	render: function(ctx, camera) {
		activeBrush.render(ctx, camera);
	},
	getSelection: function(selectTileset, layer, tb) {
		var brush = layerBrushes[layer._tag];
		if (!brush) {
			brush = layerBrushes[layer._tag] = new Brush(layer);
		}
		selectTileset.copyToBrush(brush, tb);
	}
};

toolWrappers.push(brushWrapper);

///////////////////////////////////////////////

var Erase = gm.Editor.Tools.Erase;

var layerErasers = {};
var activeErase;

var eraseWrapper = {
	onLayerSwitched: function(layer) {
		activeErase = layerErasers[layer._tag];
		if (!activeErase) {
			activeErase = layerErasers[layer._tag] = new Erase(layer);
		}
		return activeErase;
	},
	shouldSwitchIn: function() {
		return gm.Input.pressed[gm.Settings.Editor.keyBinds.ERASE];
	},
	onLayerChanged: function(layer) {
		var erase = layerErasers[layer._tag];
		if (!erase) {
			erase = layerErasers[layer._tag] = new Erase(layer);
		} else {
			erase.build(layer);
		}
	},
	switchIn: function() {
		if (LOGGING) console.log("active tool: erase");
	},
	switchOut: function() {
	},
	action: function(camera) {
		activeErase.onMouseMove(gm.Input.mouseX, gm.Input.mouseY);
		if (gm.Input.mousedown) activeErase.paint(camera);
	},
	render: function(ctx, camera) {
		activeErase.render(ctx, camera);
	}
};

toolWrappers.push(eraseWrapper);

///////////////////////////////////////////////

var SelectTileset = gm.Editor.Tools.SelectTileset;

var selectTilesets = {};
var activeSelectTileset;

var selectTilesetWrapper = {
	onLayerSwitched: function(layer) {
		activeSelectTileset = selectTilesets[layer._tag];
		if (!activeSelectTileset) {
			activeSelectTileset = selectTilesets[layer._tag] = new SelectTileset(layer);
		}
	},
	shouldSwitchIn: function() {
		return gm.Input.pressed[gm.Settings.Editor.keyBinds.SELECT_TILESET];
	},
	shouldSwitchOut: function() {
		return gm.Input.pressed[gm.Settings.Editor.keyBinds.SELECT_TILESET] ||
			(activeSelectTileset !== undefined && activeSelectTileset.hasSelected());
	},
	onLayerChanged: function(layer) {
		var selectTileset = selectTilesets[layer._tag];
		if (!selectTileset) {
			selectTileset = selectTilesets[layer._tag] = new SelectTileset(layer);
		} else {
			selectTileset.onLayerChanged(layer);
		}
	},
	action: function(camera) {
		if (activeSelectTileset) {
			activeSelectTileset.onMouseMove(gm.Input.mouseX, gm.Input.mouseY, camera);
			if (gm.Input.down[gm.Settings.Editor.keyBinds.PAN] && activeSelectTileset.isIdle()) {
				activeSelectTileset.startPanning();
			} else if (!gm.Input.down[gm.Settings.Editor.keyBinds.PAN] && activeSelectTileset.isPanning()) {
				activeSelectTileset.finishPanning();
			} else if (gm.Input.mousedown && activeSelectTileset.isIdle()) {
				activeSelectTileset.startSelecting();
			} else if (!gm.Input.mousedown && activeSelectTileset.isSelecting()) {
				activeSelectTileset.finishSelecting();
			}
		}
	},
	switchIn: function(camera) {
		activeSelectTileset.switchIn(camera);
		if (LOGGING) console.log("active tool: select from tileset");
	},
	switchOut: function() {
		var tb = activeSelectTileset.switchOut();
		if (tb) {
			var layer = activeSelectTileset._layer;
			brushWrapper.getSelection(activeSelectTileset, layer, tb);
		}
	},
	render: function(ctx, camera) {
		activeSelectTileset.render(ctx, camera);
	}
};

toolWrappers.push(selectTilesetWrapper);

///////////////////////////////////////////////

var Pan = gm.Editor.Tools.Pan;

var panWrapper = {
	onLayerSwitched: function(layer) { },
	shouldSwitchIn: function() {
		return gm.Input.down[gm.Settings.Editor.keyBinds.PAN];
	},
	shouldSwitchOut: function() {
		return !gm.Input.down[gm.Settings.Editor.keyBinds.PAN];
	},
	onLayerChanged: function(layer) { },
	switchIn: function(camera) {
		Pan.switchIn(gm.Input.mouseX, gm.Input.mouseY, camera);
		if (LOGGING) console.log("active tool: pan");
	},
	action: function() {
		Pan.onMouseMove(gm.Input.mouseX, gm.Input.mouseY);
	},
	switchOut: function() { },
	render: function(ctx, camera) {
		Pan.render(ctx, camera);
	}
};

toolWrappers.push(panWrapper);

///////////////////////////////////////////////

console.log(gm.Editor.Tools);
var Move = gm.Editor.Tools.Move;

var move = new Move();
var moveWrapper = {
	onLayerSwitched: function(layer) {
		move.switchLayer(layer);
	},
	shouldSwitchIn: function(camera) {
		return gm.Input.pressed[gm.Settings.Editor.keyBinds.MOVE] &&
		move.getMoveObject(gm.Input.mouseX, gm.Input.mouseY, camera);
	},
	shouldSwitchOut: function(camera) {
		return !gm.Input.down[gm.Settings.Editor.keyBinds.MOVE];
	},
	switchIn: function(camera) {
		move.switchIn(gm.Input.mouseX, gm.Input.mouseY, camera);
	},
	switchOut: function() {},
	action: function() {
		move.onMouseMove(gm.Input.mouseX, gm.Input.mouseY);
	},
	render: function(ctx, camera) {
		move.render(ctx, camera);
	}
};

///////////////////////////////////////////////

var holdWrapper;
var baseWrapper;

gm.Editor.toolbox = {};

gm.Editor.toolbox.onLayerSwitched = function(layer) {
	for (var i = 0; i < toolWrappers.length; i++) {
		var wrapper = toolWrappers[i];

		if ((holdWrapper && holdWrapper === wrapper) ||
			(!holdWrapper && baseWrapper && baseWrapper === wrapper)) {
			wrapper.switchOut();
		}
		
		wrapper.onLayerSwitched(layer);
		
		if ((holdWrapper && holdWrapper === wrapper) ||
			(!holdWrapper && baseWrapper && baseWrapper === wrapper)) {
			wrapper.switchIn();
		}
	}
};

gm.Editor.toolbox.action = function(camera) {
	if (holdWrapper !== undefined) {
		holdWrapper.action(camera);
	}
	else if (baseWrapper !== undefined) {
		baseWrapper.action(camera);
	}
	checkActiveTool(camera);
};

var checkActiveTool = function(camera) {
	if (holdWrapper) {
		if (holdWrapper.shouldSwitchOut && holdWrapper.shouldSwitchOut()) {
			holdWrapper.switchOut();
			holdWrapper = undefined;
			if (baseWrapper) baseWrapper.switchIn(camera);
		}
	}
	else {
		for (var i = 0; i < toolWrappers.length; i++) {
			if (toolWrappers[i].shouldSwitchIn(camera)) {
				var isHoldTool = toolWrappers[i].shouldSwitchOut;
				if (isHoldTool) {
					holdWrapper = toolWrappers[i];
					if (baseWrapper) baseWrapper.switchOut();
					holdWrapper.switchIn(camera);
				} else {
					if (baseWrapper) baseWrapper.switchOut();
					baseWrapper = toolWrappers[i];
					baseWrapper.switchIn(camera);
				}
			}
		}
	}
};

gm.Editor.toolbox.render = function(ctx, camera) {
	if (holdWrapper) holdWrapper.render(ctx, camera);
	else if (baseWrapper) baseWrapper.render(ctx, camera);
};

gm.Editor.toolbox.onLayerChanged = function(layer) {
	for (var i = 0; i < toolWrappers.length; i++) {
		toolWrappers[i].onLayerChanged(layer);
	}
};