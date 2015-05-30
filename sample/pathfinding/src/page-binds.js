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
	gm.Input.setListener('mousedown', function() {
		Editor.onMouseDown();
		render();
	});
	gm.Input.setListener('mouseup', function() {
		Editor.onMouseUp();
		render();
	});
	gm.Input.setListener('mousemove', function(mx, my) {
		Editor.onMouseMove(mx, my);
		render();
	});
	gm.Input.setListener('keydown', gm.Settings.Editor.keyBinds.MOVE, function() {
		Editor.onMoveKeyDown();
		render();
	});
	gm.Input.setListener('keyup', gm.Settings.Editor.keyBinds.MOVE, function() {
		Editor.onMoveKeyUp();
		render();
	});
	gm.Input.setListener('keydown', gm.Settings.Editor.keyBinds.BRUSH, function() {
		Editor.onBrushKeyDown();
		render();
	});
	gm.Input.setListener('keydown', gm.Settings.Editor.keyBinds.ERASE, function() {
		Editor.onEraseKeyDown();
		render();
	});

	ctx = $canvas[0].getContext("2d");
	render();
});