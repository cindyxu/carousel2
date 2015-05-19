if (!gm.Editor) gm.Editor = {};
var editor = gm.Editor;

var editorSettings = gm.Settings.Editor,
	editorDefaults = gm.Settings.Editor.Defaults;

editor._level = undefined;
editor._layer = undefined;
editor._entity = undefined;

editor.init = function() {
	editor._level = gm.Game._activeLevel;
	editor.renderer.init();
};

editor.addNewLayer = function(params, callback) {
	var level = editor._level;
	var layer = level.addNewLayer(params, function(layer) {
		editor.onLayerParamsChanged(layer);
		if (callback) callback(layer);
	});
	return layer;
};

editor.updateLayer = function(layer, params, callback) {
	var level = editor._level;
	level.updateLayer(layer, params, function() {
		editor.onLayerParamsChanged(layer);
		// force refresh
		level.resolveLevelChange();
		if (callback) callback(true);
	});
};

editor.onLayerParamsChanged = function(layer) {
	editor.renderer.onLayerParamsChanged(layer);
	editor.toolbox.onLayerChanged(layer);
};

editor.onEntityChanged = function(entity) {
	editor.renderer.onEntityChanged(entity);
};

editor.selectLayer = function(layer) {
	editor._layer = layer;
	editor.toolbox.onLayerSwitched(layer);
};

editor.selectEntity = function(entity) {
	editor._entity = entity;
};

editor.addNewEntity = function(className, name, callback) {
	var level = editor._level;
	
	if (!editor._layer) {
		if (callback) callback(); 
		return;
	}
	var entity = level.addNewEntity(className, name, editor._layer, function(entity) {
		if (!entity) {
			if (callback) callback(); 
			return;
		}
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
		editor.toolbox.action(gm.Game._camera);
	}
};

editor.render = function(ctx) {
	// if (gm.Game._playing) return;

	var camera = gm.Game._camera;
	var bbox = camera._body.getBbox();

	editor.renderer.render(ctx, bbox);
	editor.toolbox.render(ctx, camera);
};

editor.Tools = {};
editor.Util = {};
editor.Renderer = {};