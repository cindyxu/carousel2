if (!gm.Sample) gm.Sample = {};
if (!gm.Sample.Pathfinding) gm.Sample.Pathfinding = {};

gm.Sample.Pathfinding.ToyWorld = (function(Values) {

	var TILES_X = Values.TILES_X;
	var TILES_Y = Values.TILES_Y;
	var TILESIZE = Values.TILESIZE;
	var SIZE_X = Values.SIZE_X;
	var SIZE_Y = Values.SIZE_Y;
	var WALK_SPD = Values.WALK_SPD;
	var JUMP_SPD = Values.JUMP_SPD;
	var TERMINAL_V = Values.TERMINAL_V;
	var FALL_ACCEL = Values.FALL_ACCEL;

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
	var layerMap = new gm.LayerMap(map, new gm.Renderer.CollisionMap(map));
	layer = new gm.Layer("map", layerMap, {
		isCollision: true
	});

	var entity;
	var body = new gm.Body({
		sizeX: SIZE_X,
		sizeY: SIZE_Y,
		maxVelX: WALK_SPD,
		maxVelY: TERMINAL_V,
		weight: FALL_ACCEL
	});
	var bodyRenderer = new gm.Renderer.DebugEntity();
	entity = new gm.Entity("player");
	entity.setBody(body);
	entity.setRenderer(bodyRenderer);

	level.addLayer(layer);
	level.addEntity(entity, layer);

	var ToyWorld = {
		_layer: layer,
		_entity: entity,
		_level: level,
		_camera: camera
	};

	ToyWorld.render = function(ctx) {
		ctx.fillStyle = "black";
		ctx.fillRect(0, 0, TILES_X * TILESIZE, TILES_Y * TILESIZE);

		gm.Level.Renderer.render(ctx, level, camera);
	};

	return ToyWorld;
})(gm.Sample.Pathfinding.Values);