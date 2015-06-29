$(function() {

	var values = gm.Sample.Pathfinding.values;
	var ToyWorld = gm.Sample.Pathfinding.ToyWorld;
	var Editor = gm.Sample.Pathfinding.Editor;
	var Pathfinding = gm.Sample.Pathfinding.Pathfinding;
	var Recorder = gm.Sample.Pathfinding.Recorder;

	var $scanPlatformButton = $("#scan-platform");
	var $searchPlatformsButton = $("#search-platforms");
	var $stepButton = $("#step");
	var $observeMapButton = $("#observe-map");
	var $recordingDiv = $("#recording");

	var editorActive = false;
	var recording = false;

	var $canvas = $("<canvas/>")
	.prop({
		width: values.TILESIZE * values.TILES_X,
		height: values.TILESIZE * values.TILES_Y
	});
	$("#game").append($canvas);

	var recorder = new Recorder($canvas[0]);

	gm.Input.bind($canvas);
	gm.Input.setListener('mousedown', function() {
		if (editorActive) {
			Editor.onMouseDown();
			render();
		}
	});
	gm.Input.setListener('mouseup', function() {
		if (editorActive) {
			Editor.onMouseUp();
			render();
		}
	});
	gm.Input.setListener('mousemove', function(mx, my) {
		Editor.onMouseMove(mx, my);
		Pathfinding.onMouseMove(mx, my);
		render();
	});
	gm.Input.setListener('keydown', gm.Settings.Editor.keyBinds.MOVE, function() {
		editorActive = true;
		Editor.onMoveKeyDown();
		render();
	});
	gm.Input.setListener('keyup', gm.Settings.Editor.keyBinds.MOVE, function() {
		Editor.onMoveKeyUp();
		render();
	});
	gm.Input.setListener('keydown', gm.Settings.Editor.keyBinds.BRUSH, function() {
		editorActive = true;
		Editor.onBrushKeyDown();
		render();
	});
	gm.Input.setListener('keydown', gm.Settings.Editor.keyBinds.ERASE, function() {
		editorActive = true;
		Editor.onEraseKeyDown();
		render();
	});
	gm.Input.setListener('keydown', gm.Settings.Editor.keyBinds.RECORD, function() {
		if (!recording) {
			$recordingDiv.removeClass("hidden");
			recorder.startRecording();
			recording = true;
			render();
		} else {
			recorder.stopRecording();
			$recordingDiv.addClass("hidden");
			recording = false;
		}
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

	$observeMapButton.click(function(e) {
		editorActive = false;
		Pathfinding.regeneratePlatforms();
		Pathfinding.startObserving();
		render();
	});

	var render = function() {
		ToyWorld.render(ctx);
		Pathfinding.render(ctx);
		if (editorActive) Editor.render(ctx);
		if (recording) recorder.capture();
	};

	ctx = $canvas[0].getContext("2d");
	render();

});