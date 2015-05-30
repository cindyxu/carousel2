$(function() {

	var Values = gm.Sample.Pathfinding.Values;
	var ToyWorld = gm.Sample.Pathfinding.ToyWorld;
	var Editor = gm.Sample.Pathfinding.Editor;
	var Search = gm.Sample.Pathfinding.Search;

	var $planPathButton = $("#plan-path");
	var $toggleLevelRendererCheckbox = $("#toggle-level-renderer");
	var $toggleNavGridRendererCheckbox = $("#toggle-nav-grid-renderer");

	var $canvas = $("<canvas/>")
	.prop({
		width: Values.TILESIZE * Values.TILES_X,
		height: Values.TILESIZE * Values.TILES_Y
	});
	$("#game").append($canvas);

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

	$("#plan-path").click(function(e) {
		Search.planPath();
		render();
	});

	var render = function() {
		ToyWorld.render(ctx);
		Editor.render(ctx);
	};

	ctx = $canvas[0].getContext("2d");
	render();

});