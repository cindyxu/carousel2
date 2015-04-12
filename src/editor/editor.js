var editor = gm.Editor = {};
var editorSettings = gm.Settings.Editor,
	editorDefaults = gm.Settings.Editor.Defaults;
var game = gm.Game;

var toolTypes = {};

editor._layer = undefined;

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
	var layer = editor.createLayer(params, function(layer) {
		gm.Game.addLayer(layer);
		editor.renderer.onLayerChanged(layer);
		if (callback) callback(layer);
	});
	return layer;
};

var assignLayerMapRenderer = function(layerMap, params, callback) {
	var renderer;

	var onRendererPrepared = function() {
		layerMap.renderer = renderer;
		if (callback) callback();
	};

	if (params.map.isCollision) {
		renderer = new gm.Renderer.CollisionMap(layerMap.map, params.renderer);
		onRendererPrepared();
	}
	else if (params.renderer.tilesetSrc) {
		if (params.renderer.framesPerRow > 1) {
			renderer = new gm.Renderer.SpriteMap(layerMap.map, params.renderer, onRendererPrepared);
		}
		else renderer = new gm.Renderer.ImageMap(layerMap.map, params.renderer, onRendererPrepared);
	} else onRendererPrepared();
	
};

editor.updateLayer = function(layer, params, callback) {
	layer.setParams(params);
	layer.layerMap.setParams(params.layerMap);
	layer.layerMap.map.setParams(params.layerMap.map);

	assignLayerMapRenderer(layer.layerMap, params.layerMap, function() {
		editor.onLayerChanged(layer);
		if (callback) callback();
	});
};

editor.onLayerChanged = function(layer) {
	editor.renderer.onLayerChanged(layer);

	var tool;
	for (var t in editor._toolPalette) {
		tool = editor._toolPalette[t];
		if (tool.onLayerChanged) tool.onLayerChanged(layer);
	}
};

editor.createLayer = function(params, callback) {
	var map = new gm.Map(params.layerMap.map);
	var layerMap = new gm.LayerMap(params.layerMap);
	layerMap.map = map;
	var layer = new gm.Layer(params.name, layerMap);

	if (callback) {
		assignLayerMapRenderer(layerMap, params.layerMap, function() {
			callback(layer);
		});
	} else {
		assignLayerMapRenderer(layerMap, params.layerMap);
	}
	return layer;
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
					editor._holdTool.switchIn();
				}
				else if (editor._toolPalette[t] === editor._tool) {
					editor._tool.switchOut();
					editor._tool = tool;
					editor._tool.switchIn();
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

editor.createEntity = function(className, name) {
	var entity = new gm.EntityClasses[className](name);
};

editor.selectEntity = function(entity) {

};

editor.update = function() {
	if (editor._layer) {
		if (editor._holdTool) editor._holdTool.action(gm.Game._camera);
		else if (editor._tool) editor._tool.action(gm.Game._camera);
		editor.checkChangeTool();
	}
};

editor.checkChangeTool = function() {
	if (editor._holdTool && editor._holdTool.shouldSwitchOut()) {
		editor._holdTool.switchOut();
		if (editor._tool) editor._tool.switchIn();
		editor._holdTool = undefined;
	} else {
		for (var t in editor._toolPalette) {
			var tool = editor._toolPalette[t];
			if (tool !== editor._holdTool && tool !== editor.tool &&
				tool.shouldSwitchIn()) {
				
				if (editor._tool) editor._tool.switchOut();
				tool.switchIn();
				
				if (tool.holdTool) editor._holdTool = tool;
				else editor._tool = tool;
			}
		}
	}
};

editor.render = function(ctx) {
	var camera = gm.Game._camera;
	var bbox = camera._body.getBbox();

	editor.renderer.render(ctx, bbox);
	if (editor._holdTool) editor._holdTool.render(ctx, camera);
	else if (editor._tool) editor._tool.render(ctx, camera);
};

editor.Tools = {};
editor.Util = {};
editor.Renderer = {};