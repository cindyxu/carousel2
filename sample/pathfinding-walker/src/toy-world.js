gm.Sample.WalkerPathfinding.ToyWorld = (function(values) {

	var TILES_X = values.TILES_X;
	var TILES_Y = values.TILES_Y;
	var TILESIZE = values.TILESIZE;
	var SIZE_X = values.SIZE_X;
	var SIZE_Y = values.SIZE_Y;
	var WALK_SPD = values.WALK_SPD;
	var JUMP_SPD = values.JUMP_SPD;
	var TERMINAL_V = values.TERMINAL_V;
	var FALL_ACCEL = values.FALL_ACCEL;

	var camera = new gm.Camera({
		sizeX : TILES_X * TILESIZE, 
		sizeY: TILES_Y * TILESIZE
	});

	var level = new gm.Level();

	var layer;
	var map = new gm.Map({
		tilesX: TILES_X,
		tilesY: TILES_Y,
		tilesize: TILESIZE
	});
	var layerMap = new gm.LayerMap(map, new gm.Debug.Renderer.Map.Collision(map));
	layer = new gm.Layer("map", layerMap, {
		isCollision: true
	});

	var startEntity;
	(function() {
		var body = new gm.Body({
			sizeX: SIZE_X,
			sizeY: SIZE_Y,
			maxVelX: WALK_SPD,
			maxVelY: TERMINAL_V,
			weight: FALL_ACCEL
		});
		var bodyRenderer = new gm.Debug.Renderer.Entity.Frame();
		bodyRenderer._color = "#ffaaee";
		startEntity = new gm.Entity("player");
		startEntity.setBody(body);
		startEntity.setRenderer(bodyRenderer);
	})();

	var endEntity;
	(function() {
		var body = new gm.Body({
			sizeX: SIZE_X,
			sizeY: SIZE_Y
		});
		var bodyRenderer = new gm.Debug.Renderer.Entity.Frame();
		bodyRenderer._color = "#00eeaa";
		endEntity = new gm.Entity("object");
		endEntity.setBody(body);
		endEntity.setRenderer(bodyRenderer);
	})();

	level.addLayer(layer);
	level.addEntity(startEntity, layer);
	level.addEntity(endEntity, layer);

	var ToyWorld = {
		_layer: layer,
		_startEntity: startEntity,
		_endEntity: endEntity,
		_level: level,
		_camera: camera
	};

	ToyWorld.render = function(ctx) {
		gm.Level.Renderer.render(ctx, level, camera);
	};

	return ToyWorld;
})(gm.Sample.WalkerPathfinding.values);