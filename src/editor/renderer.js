var editor = gm.Editor;

var renderer = editor.renderer = {};

var mapRenderers = {};
var entityRenderers = {};

var renderLayerDebug = function(layer, ctx, bbox) {
	renderLayerMapDebug(layer, ctx, bbox);
	for (var e = 0; e < layer._entities.length; e++) {
		renderEntityDebug(layer._entities[e], ctx, bbox);
	}
};

var renderLayerMapDebug = function(layer, ctx, bbox) {
	var pos = layer.layerMap._pos;
	mapRenderers[layer._tag].render(ctx, pos.x, pos.y, bbox);
};

var renderEntityDebug = function(entity, ctx, bbox) {
	entityRenderers[entity._tag].render(ctx, entity.body._x, entity.body._y, bbox);
};

renderer.render = function(ctx, bbox) {
	var game = gm.Game;

	var layers = game._layers;

	for (var l = 0; l < layers.length; l++) {
		renderLayerDebug(layers[l], ctx, bbox);
	}
};

renderer.onGameCleared = function() {
	mapRenderers = {};
	entityRenderers = {};
};

renderer.onLayerChanged = function(layer) {
	mapRenderers[layer._tag] = new gm.Editor.Renderer.Map(layer.layerMap.map, {
		strokeStyle: gm.Settings.Editor.colors.MAP
	});
};

renderer.onEntityChanged = function(entity) {
	entityRenderers[entity._tag] = new gm.Editor.Renderer.Entity(entity);
};

renderer.onLayerRemoved = function(layer) {
	mapRenderers[layer._tag] = undefined;
};

renderer.onEntityRemoved = function(entity) {
	entityRenderers[entity._tag] = undefined;
};