gm.Level.Model = {};

gm.Level.Model.assignLayerMapRenderer = function(layerMap, params, callback) {
	var renderer;

	var onRendererPrepared = function() {
		layerMap.setRenderer(renderer);
		if (callback) callback();
	};

	if (params.isCollision) {
		renderer = new gm.Renderer.CollisionMap(layerMap._map, params.layerMap.renderer);
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

gm.Level.Model.createLayer = function(params, callback) {

	var map = new gm.Map(params.layerMap.map);
	var layerMap = new gm.LayerMap(map, params.layerMap);
	var layer = new gm.Layer(params.name, layerMap, params);

	if (callback) {
		gm.Level.Model.assignLayerMapRenderer(layerMap, params, function() {
			callback(layer);
		});
	} else {
		gm.Level.Model.assignLayerMapRenderer(layerMap, params);
	}
	return layer;
};

gm.Level.Model.updateLayer = function(layer, params, callback) {
	layer.setParams(params);
	layer._layerMap.setParams(params.layerMap);
	layer._layerMap._map.setParams(params.layerMap.map);

	gm.Level.Model.assignLayerMapRenderer(layer._layerMap, params, callback);
};

gm.Level.Model.createEntity = function(className, name, callback) {
	var entityClass = gm.EntityClasses[className];
	if (!entityClass) {
		if (LOGGING) console.log("!!! no such entity class", entityClass);
		if (callback) callback();
		return;
	}
	var entity = entityClass(name);
	entity.className = className;
	if (callback) {
		// entity.renderer.load(function() { callback(entity); });
		callback(entity);
	}
	return entity;
};