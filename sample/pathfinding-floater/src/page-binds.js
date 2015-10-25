$(function() {

	var values = gm.Sample.Ai.Floater.Pathfinding.values;
	var ToyWorld = gm.Sample.Ai.Floater.Pathfinding.ToyWorld;
	var Pathfinding = gm.Sample.Ai.Floater.Pathfinding.Pathfinding;
	var Recorder = gm.Sample.Recorder;
	
	var editor = new gm.Sample.SimpleEditor(ToyWorld._layer, ToyWorld._camera);

	var $searchPathButton = $("#search-path");
	var $stepButton = $("#step");
	var $recordingDiv = $("#recording");

	var editorActive = false;
	var recording = false;

	var $canvas = $("<canvas/>")
	.prop({
		width: values.TILESIZE * values.TILES_X,
		height: values.TILESIZE * values.TILES_Y
	});
	$("#game").append($canvas);

	gm.Input.bind($canvas);
	gm.Input.setListener('mousedown', function() {
		if (editorActive) {
			editor.onMouseDown();
			render();
		}
	});
	gm.Input.setListener('mouseup', function() {
		if (editorActive) {
			editor.onMouseUp();
			render();
		}
	});
	gm.Input.setListener('mousemove', function(mx, my) {
		editor.onMouseMove(mx, my);
		render();
	});
	gm.Input.setListener('keydown', gm.Settings.Editor.keyBinds.MOVE, function() {
		editorActive = true;
		editor.onMoveKeyDown();
		render();
	});
	gm.Input.setListener('keyup', gm.Settings.Editor.keyBinds.MOVE, function() {
		editor.onMoveKeyUp();
		render();
	});
	gm.Input.setListener('keydown', gm.Settings.Editor.keyBinds.BRUSH, function() {
		editorActive = true;
		editor.onBrushKeyDown();
		render();
	});
	gm.Input.setListener('keydown', gm.Settings.Editor.keyBinds.ERASE, function() {
		editorActive = true;
		editor.onEraseKeyDown();
		render();
	});

	$searchPathButton.click(function(e) {
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
		if (editorActive) editor.render(ctx);
	};

	ctx = $canvas[0].getContext("2d");
	render();

});