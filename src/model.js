var model = gm.Level.Model = {};

var assignLayerMapRenderer = function(layerMap, params, callback) {
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

model.createLayer = function(params, callback) {

	var map = new gm.Map(params.layerMap.map);
	var layerMap = new gm.LayerMap(map, params.layerMap);
	var layer = new gm.Layer(params.name, layerMap, params);

	if (callback) {
		assignLayerMapRenderer(layerMap, params, function() {
			callback(layer);
		});
	} else {
		assignLayerMapRenderer(layerMap, params);
	}
	return layer;
};

model.updateLayer = function(layer, params, callback) {
	layer.setParams(params);
	layer._layerMap.setParams(params.layerMap);
	layer._layerMap._map.setParams(params.layerMap.map);

	assignLayerMapRenderer(layer._layerMap, params, callback);
};

model.createEntity = function(className, name, callback) {
	var entityClass = gm.EntityClasses[className];
	console.log(entityClass);
	if (!entityClass) {
		if (callback) callback();
		return;
	}
	var entity = entityClass.create(name, callback);
	entity.className = className;
	return entity;
};