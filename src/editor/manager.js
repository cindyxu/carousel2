var editor = gm.Editor;

var manager = editor.manager = {};

var assignLayerMapRenderer = function(layerMap, params, callback) {
	var renderer;

	var onRendererPrepared = function() {
		layerMap.renderer = renderer;
		if (callback) callback();
	};

	if (params.isCollision) {
		renderer = new gm.Renderer.CollisionMap(layerMap.map, params.layerMap.renderer);
		onRendererPrepared();
	}
	else if (params.layerMap.renderer.tilesetSrc) {
		if (params.layerMap.renderer.framesPerRow > 1) {
			renderer = new gm.Renderer.SpriteMap(layerMap.map, params.layerMap.renderer);
			renderer.load(onRendererPrepared);
		}
		else {
			renderer = new gm.Renderer.ImageMap(layerMap.map, params.layerMap.renderer);
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
		assignLayerMapRenderer(layerMap, params, function() {
			callback(layer);
		});
	} else {
		assignLayerMapRenderer(layerMap, params);
	}
	return layer;
};

manager.updateLayer = function(layer, params, callback) {
	layer.setParams(params);
	layer.layerMap.setParams(params.layerMap);
	layer.layerMap.map.setParams(params.layerMap.map);

	assignLayerMapRenderer(layer.layerMap, params, callback);
};

manager.createEntity = function(className, name, callback) {
	var entityClass = gm.EntityClasses[className];
	if (!entityClass) {
		if (callback) callback();
		return;
	}
	var entity = entityClass.create(name, callback);
	entity.className = className;
	return entity;
};