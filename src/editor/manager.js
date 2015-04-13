var editor = gm.Editor;

var manager = editor.manager = {};

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
			renderer = new gm.Renderer.SpriteMap(layerMap.map, params.renderer);
			renderer.load(onRendererPrepared);
		}
		else {
			renderer = new gm.Renderer.ImageMap(layerMap.map, params.renderer);
			renderer.load(onRendererPrepared);
		}
	} else onRendererPrepared();
};

manager.createLayer = function(params, callback) {
	var map = new gm.Map(params.layerMap.map);
	var layerMap = new gm.LayerMap(params.layerMap);
	layerMap.map = map;
	var layer = new gm.Layer(params.name, layerMap, params);

	if (callback) {
		assignLayerMapRenderer(layerMap, params.layerMap, function() {
			callback(layer);
		});
	} else {
		assignLayerMapRenderer(layerMap, params.layerMap);
	}
	return layer;
};

manager.updateLayer = function(layer, params, callback) {
	layer.setParams(params);
	layer.layerMap.setParams(params.layerMap);
	layer.layerMap.map.setParams(params.layerMap.map);

	assignLayerMapRenderer(layer.layerMap, params.layerMap, callback);
};