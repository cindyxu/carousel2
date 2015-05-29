var Pathfinding = gm.Sample.Pathfinding;
var ToyWorld = Pathfinding.ToyWorld;
var Editor = Pathfinding.Editor;
var Search = Pathfinding.Search;

$(function() {
	var $canvas = $("<canvas/>")
	.prop({
		width: TILESIZE * TILES_X,
		height: TILESIZE * TILES_Y
	});
	$("#game").append($canvas);

	var render = function() {
		Pathfinding.ToyWorld.render(ctx);
		Pathfinding.Editor.render(ctx);
	};

	gm.Input.bind($canvas);
	gm.Input.setListener('mousedown', function(mx, my) {
		Editor.onMouseDown(mx, my);
		render();
	});
	gm.Input.setListener('mouseup', function(mx, my) {
		Editor.onMouseUp(mx, my);
		render();
	});
	gm.Input.setListener('mousemove', function(mx, my) {
		Editor.onMouseMove(mx, my);
		render();
	});
	gm.Input.setListener('keydown', function() {
		Editor.onKeyDown();
		render();
	});
	gm.Input.setListener('keyup', function() {
		Editor.onKeyUp();
		render();
	});

	ctx = $canvas[0].getContext("2d");
	render();
});