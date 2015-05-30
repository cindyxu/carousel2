if (!gm.Sample) gm.Sample = {};
if (!gm.Sample.Pathfinding) gm.Sample.Pathfinding = {};

var TILES_X = 15;
var TILES_Y = 15;
var TILESIZE = 32;
var SIZE_X = 48;
var SIZE_Y = 48;
var WALK_SPD = 60;
var JUMP_SPD = 0.5 * 200;
var TERMINAL_V = 200;
var FALL_ACCEL = 200;

var camera = new gm.Camera({
	sizeX : TILES_X * TILESIZE, 
	sizeY: TILES_Y * TILESIZE
});

var level = new gm.Level();

var layer;
(function() {
	var map = new gm.Map({
		tilesX: TILES_X,
		tilesY: TILES_Y,
		tilesize: TILESIZE
	});
	var layerMap = new gm.LayerMap(map, new gm.Renderer.CollisionMap(map));
	layer = new gm.Layer("map", layerMap, {
		isCollision: true
	});
})();

var entity;
(function() {
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
})();

level.addLayer(layer);
level.addEntity(entity, layer);

gm.Sample.Pathfinding.ToyWorld = {
	_layer: layer,
	_entity: entity,
	_level: level,
	_camera: camera
};

gm.Sample.Pathfinding.ToyWorld.render = function(ctx) {
	ctx.fillStyle = "black";
	ctx.fillRect(0, 0, TILES_X * TILESIZE, TILES_Y * TILESIZE);

	gm.Level.Renderer.render(ctx, level, camera);
};