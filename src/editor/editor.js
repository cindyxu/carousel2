if (!gm.Editor) gm.Editor = {};

gm.Editor._level = undefined;
gm.Editor._layer = undefined;
gm.Editor._entity = undefined;

gm.Editor.init = function() {
	gm.Editor._level = gm.Game._activeLevel;
	gm.Editor._renderer.init();
};

gm.Editor.addNewLayer = function(params, callback) {
	var level = gm.Editor._level;
	var layer = level.addNewLayer(params, function(layer) {
		gm.Editor.onLayerParamsChanged(layer);
		if (callback) callback(layer);
	});
	return layer;
};

gm.Editor.updateLayer = function(layer, params, callback) {
	var level = gm.Editor._level;
	level.updateLayer(layer, params, function() {
		gm.Editor.onLayerParamsChanged(layer);
		// force refresh
		level.resolveLevelChange();
		if (callback) callback(true);
	});
};

gm.Editor.onLayerParamsChanged = function(layer) {
	gm.Editor._renderer.onLayerParamsChanged(layer);
	gm.Editor._toolbox.onLayerChanged(layer);
};

gm.Editor.onEntityChanged = function(entity) {
	gm.Editor._renderer.onEntityChanged(entity);
};

gm.Editor.selectLayer = function(layer) {
	gm.Editor._layer = layer;
	gm.Editor._toolbox.onLayerSwitched(layer);
};

gm.Editor.selectEntity = function(entity) {
	gm.Editor._entity = entity;
};

gm.Editor.addNewEntity = function(className, name, callback) {
	var level = gm.Editor._level;
	
	if (!gm.Editor._layer) {
		if (callback) callback(); 
		return;
	}
	var entity = level.addNewEntity(className, name, gm.Editor._layer, function(entity) {
		if (!entity) {
			if (callback) callback(); 
			return;
		}
		gm.Editor.onEntityChanged(entity);
		if (callback) callback(entity);
	});
};

gm.Editor.playGame = function() {
	gm.Game.play();
};

gm.Editor.pauseGame = function() {
	gm.Game.pause();
};

gm.Editor.update = function() {
	if (gm.Game._playing) {
		if (gm.Input.pressed[gm.Settings.Editor.keyBinds.TOGGLE_PLAY]) {
			gm.Editor.pauseGame();
		}
		else return;
	} else {
		if (gm.Input.pressed[gm.Settings.Editor.keyBinds.TOGGLE_PLAY]) {
			gm.Editor.playGame();
			return;
		}
	}

	if (gm.Editor._layer) {
		gm.Editor._toolbox.action(gm.Game._camera);
	}
};

gm.Editor.render = function(ctx) {
	// if (gm.Game._playing) return;

	var camera = gm.Game._camera;
	var bbox = camera._body.getBbox();

	gm.Editor._renderer.render(ctx, bbox);
	gm.Editor._toolbox.render(ctx, camera);
};