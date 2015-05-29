var TILES_X = 15;
var TILES_Y = 15;
var TILESIZE = 32;
var SIZE_X = 24;
var SIZE_Y = 24;
var WALK_SPD = 60;
var JUMP_SPD = 0.5 * 200;
var TERMINAL_V = 200;
var FALL_ACCEL = 200;

var camera = new gm.Camera({
	sizeX : TILES_X * TILESIZE, 
	sizeY: TILES_Y * TILESIZE
});

var tileLayer;

// create tile layer
(function() {
	var tileMap = new gm.Map({
		tilesX: TILES_X,
		tilesY: TILES_Y,
		tilesize: TILESIZE
	});
	var tileLayerMap = new gm.LayerMap();
	tileLayerMap.setMap(tileMap);
	tileLayer = new gm.Layer("tileMap", tileLayerMap, {
		isCollision: true
	});
})();


var navGrid = new gm.NavGrid();
navGrid.fromLayers([tileLayer]);

var body = new gm.Body({
	sizeX: SIZE_X,
	sizeY: SIZE_Y,
	maxVelX: WALK_SPD,
	maxVelY: TERMINAL_V,
	weight: FALL_ACCEL
});
var entity = new gm.Entity("player", body);

var brush = new gm.Editor.Tools.Brush(tileLayer);
var mousedown = false;

var render = function(ctx) {
	ctx.fillStyle = "black";
	ctx.fillRect(0, 0, TILES_X * TILESIZE, TILES_Y * TILESIZE);
	navGrid.render(ctx, camera._body.getBbox());
	brush.render(ctx, camera);
};

var handleBrush = function(mx, my) {
	brush.onMouseMove(mx, my);
	if (mousedown) brush.paint(camera);
};

var platformSearch;
var startSearch = function(originPlatform) {
	platformSearch = new gm.Pathfinder.Walker.PlatformSearch(
		navGrid._platformMap,
		SIZE_X,
		SIZE_Y, 
		WALK_SPD,
		JUMP_SPD,
		FALL_ACCEL,
		TERMINAL_V,
		originPlatform);
};

var onMouseMove = function(e) {
	var mouseX = e.pageX - this.offsetLeft;
	var mouseY = e.pageY - this.offsetTop;

	handleBrush(mouseX, mouseY);
};

var onMouseDown = function(e) {
	mousedown = true;
};

var onMouseUp = function(e) {
	mousedown = false;
};

$(function() {
	var $canvas = $("<canvas/>")
	.prop({
		width: TILESIZE * TILES_X,
		height: TILESIZE * TILES_Y
	});
	$("#game").append($canvas);

	$canvas.mousemove(onMouseMove);
	$canvas.mousedown(onMouseDown);
	$canvas.mouseup(onMouseUp);

	ctx = $canvas[0].getContext("2d");
	render(ctx);
});