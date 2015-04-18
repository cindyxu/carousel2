var editor = gm.Editor = {};
var editorSettings = gm.Settings.Editor,
	editorDefaults = gm.Settings.Editor.Defaults;
var game = gm.Game;

var toolTypes = {};

editor._layer = undefined;
editor._entity = undefined;

editor._toolPalette = {};
editor._tool = undefined;
editor._holdTool = undefined;

editor.init = function() {
	editor.checkChangeTool();
};

editor.registerTool = function(name, tool) {
	toolTypes[name] = tool;
};

editor.addNewLayer = function(params, callback) {
	var layer = editor.manager.createLayer(params, function(layer) {
		gm.Game.addLayer(layer);
		editor.renderer.onLayerChanged(layer);
		if (callback) callback(layer);
	});
	return layer;
};

editor.updateLayer = function(layer, params, callback) {
	editor.manager.updateLayer(layer, params, function() {
		editor.onLayerChanged(layer);
		if (callback) callback(true);
	});
};

editor.onLayerChanged = function(layer) {
	editor.renderer.onLayerChanged(layer);

	var tool;
	for (var t in toolTypes) {
		if (toolTypes[t].onLayerChanged) toolTypes[t].onLayerChanged(layer);
	}
};

editor.onEntityChanged = function(entity) {
	editor.renderer.onEntityChanged(entity);
};

editor.selectLayer = function(layer) {
	editor._layer = layer;
	editor.createToolPalette();
};

editor.createToolPalette = function() {
	if (editor._layer) {
		for (var t in toolTypes) {
			var tool = toolTypes[t].getToolForLayer(editor._layer);

			if (editor._toolPalette[t]) {
				if (editor._toolPalette[t] === editor._holdTool) {
					editor._holdTool.switchOut();
					editor._holdTool = tool;
					editor._holdTool.switchIn(gm.Game._camera);
				}
				else if (editor._toolPalette[t] === editor._tool) {
					editor._tool.switchOut();
					editor._tool = tool;
					editor._tool.switchIn(gm.Game._camera);
				}
			}

			editor._toolPalette[t] = tool;
		}
	} else {
		editor._toolPalette = {};
		if (editor._holdTool) {
			editor._holdTool.switchOut();
			editor._holdTool = undefined;
			editor._tool = undefined;
		}
		else if (editor._tool) {
			editor._tool.switchOut();
			editor._tool = undefined;
		}
	}
};

editor.selectEntity = function(entity) {
	editor._entity = entity;
};

editor.addNewEntity = function(className, name, callback) {
	if (!editor._layer) {
		if (callback) callback(); 
		return;
	}
	var entity = editor.manager.createEntity(className, name, function(entity) {
		if (!entity) {
			if (callback) callback(); 
			return;
		}
		gm.Game.addEntity(entity, editor._layer);
		editor.onEntityChanged(entity);
		if (callback) callback(entity);
	});
};

editor.playGame = function() {
	gm.Game.play();
};

editor.pauseGame = function() {
	gm.Game.pause();
};

editor.update = function() {
	if (gm.Game._playing) {
		if (gm.Input.pressed[gm.Settings.Editor.keyBinds.TOGGLE_PLAY]) {
			editor.pauseGame();
		}
		else return;
	} else {
		if (gm.Input.pressed[gm.Settings.Editor.keyBinds.TOGGLE_PLAY]) {
			editor.playGame();
			return;
		}
	}

	if (editor._layer) {
		if (editor._holdTool) editor._holdTool.action(gm.Game._camera);
		else if (editor._tool) editor._tool.action(gm.Game._camera);
		editor.checkChangeTool();
	}
};

editor.checkChangeTool = function() {
	if (editor._holdTool && editor._holdTool.shouldSwitchOut()) {
		editor._holdTool.switchOut();
		if (editor._tool) editor._tool.switchIn(gm.Game._camera);
		editor._holdTool = undefined;
	} else {
		for (var t in editor._toolPalette) {
			var tool = editor._toolPalette[t];
			if (tool !== editor._holdTool && tool !== editor.tool &&
				tool.shouldSwitchIn()) {
				
				if (editor._tool) editor._tool.switchOut();
				tool.switchIn(gm.Game._camera);
				
				if (tool.holdTool) editor._holdTool = tool;
				else editor._tool = tool;
			}
		}
	}
};

editor.render = function(ctx) {
	// if (gm.Game._playing) return;

	var camera = gm.Game._camera;
	var bbox = camera._body.getBbox();

	editor.renderer.render(ctx, bbox);
	if (editor._holdTool) editor._holdTool.render(ctx, camera);
	else if (editor._tool) editor._tool.render(ctx, camera);
};

editor.Tools = {};
editor.Util = {};
editor.Renderer = {};