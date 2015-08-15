$(function() {

	var $canvas, ctx;
	var stats;

	var predictor, predictorRenderer;

	var createCanvas = function() {
		$canvas = $("<canvas/>")
		.prop({
			width: gm.Settings.Game.WIDTH,
			height: gm.Settings.Game.HEIGHT
		});

		$("#game").append($canvas);
		ctx = $canvas[0].getContext("2d");
	};

	var setupGame = function() {
		gm.Game.init();
		var level = gm.Game._activeLevels[0];
		
		var map = new gm.Map({
			tilesX: 30,
			tilesY: 30,
			tilesize: 16,
			tiles: [
				 0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,
				 0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,
				 0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,
				 0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,
				 0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,
				 0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,
				 0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,
				 0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,
				 0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,
				 0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0, 15, 15,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,
				 0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,
				 0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0, 15, 15,  0,  0,  0,  0,  0,  0,  0,  0,  0,
				 0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,
				 0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0, 15, 15, 15,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,
				 0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0, 15,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,
				15, 15, 15, 15, 15,  0,  0,  0,  0,  0,  0, 15, 15, 15, 15,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0, 15, 15, 15, 15,
				 0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,
				 0,  0,  0,  0,  0,  0,  0, 15, 15,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0, 15, 15,  0,  0,  0,  0,  0,  0,
				 0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,
				15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15
			]
		});

		var layerMap = new gm.LayerMap(map, new gm.Renderer.CollisionMap(map));
		var layer = new gm.Layer("layer", layerMap, {
			isCollision: true
		});
		level.addLayer(layer);

		gm.Game.addNewEntity("Player", "player", level, layer, function(player) {
			player.setRenderer(new gm.Renderer.DebugEntity(player._body));
			player._body.moveTo(100, 100);
		});
		gm.Game.addNewEntity("Partner", "partner", level, layer, function(partner) {
			partner.setRenderer(new gm.Renderer.DebugEntity(partner._body));
			partner._body.moveTo(200, 100);

			predictor = new gm.Ai.PlayerIntent.Predictor(partner._controller._agent._playerIntent._playerObserver);
			predictor.startListening();
			predictorRenderer = new gm.Ai.PlayerIntent.Predictor.Renderer(predictor);
		});

		gm.Game.play();
	};

	var setupGameLoop = function() {
		var onEachFrame;
		if (window.webkitRequestAnimationFrame) {
			onEachFrame = function(cb) {
				var _cb = function() { cb(); webkitRequestAnimationFrame(_cb); };
				_cb();
			};
		} else if (window.mozRequestAnimationFrame) {
			onEachFrame = function(cb) {
			var _cb = function() { cb(); mozRequestAnimationFrame(_cb); };
				_cb();
			};
		} else {
			onEachFrame = function(cb) {
				setInterval(cb, 1000 / 60);
			};
		}

		window.onEachFrame = onEachFrame;
	};

	createCanvas();

	gm.Input.bind($("#game"), $canvas);

	setupGame();
	setupGameLoop();

	window.onEachFrame(function() {
		gm.Game.update();
		if (predictor) predictor.postUpdate();
		gm.Game.render(ctx);
		if (predictorRenderer) predictorRenderer.render(ctx, gm.Game._camera._body.getBbox());

		gm.Input.reset();
	});

});
