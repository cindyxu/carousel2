gm.Layer.Model = {};

gm.Layer.Model._assignLayerMapRenderer = function(layerMap, params, callback) {
	var renderer;

	var onRendererPrepared = function() {
		console.log(params.isCollision, renderer);
		layerMap.setRenderer(renderer);
		if (callback) callback();
	};

	if (params.isCollision) {
		renderer = new gm.Debug.Renderer.Map.Collision(layerMap._map, params.layerMap.renderer);
		onRendererPrepared();
	}
	else if (params.layerMap.renderer.tilesetSrc) {
		if (params.layerMap.renderer.framesPerRow > 1) {
			renderer = new gm.Renderer.SpriteMap(layerMap._map, params.layerMap.renderer);
			renderer.load(onRendererPrepared);
		}
		else {
			renderer = new gm.Renderer.ImageMap(layerMap._map, params.layerMap.renderer);
			renderer.load(onRendererPrepared);
		}
	} else onRendererPrepared();
};

gm.Layer.Model.createLayer = function(params, callback) {

	var map = new gm.Map(params.layerMap.map);
	var layerMap = new gm.LayerMap(map, params.layerMap);
	var layer = new gm.Layer(params.name, layerMap, params);

	if (callback) {
		gm.Layer.Model._assignLayerMapRenderer(layerMap, params, function() {
			callback(layer);
		});

	} else {
		gm.Layer.Model._assignLayerMapRenderer(layerMap, params);
		callback(layer);
	}

	return layer;
};

gm.Layer.Model.updateLayer = function(layer, params, callback) {
	layer.setParams(params);
	layer._layerMap.setParams(params.layerMap);
	layer._layerMap._map.setParams(params.layerMap.map);

	gm.Layer.Model._assignLayerMapRenderer(layer._layerMap, params, callback);
};