gm.Editor._renderer = function(editor) {

	var renderer = {};

	var mapRenderers = {};
	var entityRenderers = {};

	var tbbox = {};

	var renderLayerDebug = function(layer, ctx, bbox) {
		ctx.save();

		layer.transformBboxToLocalSpace(bbox, tbbox);
		
		renderLayerMapDebug(layer, ctx, tbbox);
		for (var e = 0; e < layer._entities.length; e++) {
			renderEntityDebug(layer._entities[e], ctx, tbbox);
		}
		
		ctx.restore();
	};

	var renderLayerMapDebug = function(layer, ctx, bbox) {
		mapRenderers[layer._tag].render(ctx, layer._layerMap._px, layer._layerMap._py, bbox);
	};

	var renderEntityDebug = function(entity, ctx, bbox) {
		entityRenderers[entity._tag].render(ctx, entity._body._x - bbox.x0, entity._body._y - bbox.y0);
	};

	renderer.init = function() {
	};

	renderer.render = function(ctx, bbox) {
		var level = editor._level;
		var layers = level._layers;
		for (var l = 0; l < layers.length; l++) {
			renderLayerDebug(layers[l], ctx, bbox);
		}
	};

	renderer.onGameCleared = function() {
		mapRenderers = {};
		entityRenderers = {};
	};

	renderer.onLayerParamsChanged = function(layer) {
		mapRenderers[layer._tag] = new gm.Renderer.DebugMap(layer._layerMap._map, {
			strokeStyle: gm.Settings.Editor.colors.MAP
		});
	};

	renderer.onEntityChanged = function(entity) {
		entityRenderers[entity._tag] = new gm.Renderer.DebugEntity(entity._body);
	};

	renderer.onLayerRemoved = function(layer) {
		mapRenderers[layer._tag] = undefined;
	};

	renderer.onEntityRemoved = function(entity) {
		entityRenderers[entity._tag] = undefined;
	};

	return renderer;

}(gm.Editor);