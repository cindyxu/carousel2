$(function() {

	var values = gm.Sample.Pathfinding.values;
	var ToyWorld = gm.Sample.Pathfinding.ToyWorld;
	var Editor = gm.Sample.Pathfinding.Editor;
	var Pathfinding = gm.Sample.Pathfinding.Pathfinding;

	var $scanPlatformButton = $("#scan-platform");
	var $searchPlatformsButton = $("#search-platforms");
	var $stepButton = $("#step");
	var $toggleLevelRendererCheckbox = $("#toggle-level-renderer");
	var $togglePlatformRendererCheckbox = $("#toggle-platform-renderer");

	var $canvas = $("<canvas/>")
	.prop({
		width: values.TILESIZE * values.TILES_X,
		height: values.TILESIZE * values.TILES_Y
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

	$scanPlatformButton.click(function(e) {
		Pathfinding.regeneratePlatforms();
		Pathfinding.startScan();
		render();
	});

	$searchPlatformsButton.click(function(e) {
		Pathfinding.regeneratePlatforms();
		Pathfinding.startSearch();
		render();
	});

	$stepButton.click(function(e) {
		Pathfinding.step();
		render();
	});

	var render = function() {
		ToyWorld.render(ctx);
		Pathfinding.render(ctx);
		Editor.render(ctx);
	};

	ctx = $canvas[0].getContext("2d");
	render();

});