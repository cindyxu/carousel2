$(function() {
	var editor = gm.Editor;

	var $body = $("body");
	var $layerList = $("#layer-list");

	var $removeLayerButton = $("#remove-layer");

	var $layerNameInput = $("#layer-name");
	var $layerCollisionCheckbox = $("#layer-collision");
	var $layerFramesPerRowInput = $("#layer-frames-per-row");

	var $layerMapTilesetInput = $("#layer-map-tileset");
	var $layerMapTilesXInput = $("#layer-map-tiles-x");
	var $layerMapTilesYInput = $("#layer-map-tiles-y");
	var $layerMapTilesizeInput = $("#layer-map-tilesize");
	var $layerMapOffsetXInput = $("#layer-map-offset-x");
	var $layerMapOffsetYInput = $("#layer-map-offset-y");
	var $layerMapDistXInput = $("#layer-map-dist-x");
	var $layerMapDistYInput = $("#layer-map-dist-y");

	var $addLayerButton = $("#add-layer");
	var $updateLayerButton = $("#update-layer");

	var $entityList = $("#entity-list");

	var $entityNameInput = $("#entity-name");
	var $entityClassNameInput = $("#entity-class-name");

	var flashBody = function(success) {
		if (success) {
			$body.css("background-color", "#ffffff");
		} else {
			$body.css("background-color", "#ff0000");
		}
		$body.animate({
			backgroundColor : "#ffffaa"
		});
	};

	var createLayerListEntry = function(layer) {
		var $entry = $("<li>");
		$entry.attr("data-layer-tag", layer._tag);

		var $p = $("<p>");
		$p.html(layer._tag);
		
		$entry.append($p);
		return $entry;
	};

	var refreshSelectedLayer = function() {
		var layer = editor._layer;
		$("#layer-list li.selected").removeClass("selected");
		var $entry = $("[data-layer-tag='" + layer._tag + "']");
		$entry.addClass("selected");

		fillParamsForLayer(layer);
	};

	var fillParamsForLayer = function(layer) {
		var layerMap = layer.layerMap,
			renderer = layerMap.renderer,
			map = layerMap.map;

		if (renderer) {
			$layerMapTilesetInput.val(renderer._tilesetSrc);
			$layerFramesPerRowInput.val(renderer._framesPerRow);
		}

		$layerMapTilesXInput.val(map._tilesX);
		$layerMapTilesYInput.val(map._tilesX);
		$layerMapTilesizeInput.val(map.tilesize);
		
		$layerMapOffsetXInput.val(layerMap.offsetX);
		$layerMapOffsetYInput.val(layerMap.offsetY);
		$layerMapDistXInput.val(layerMap.distX);
		$layerMapDistYInput.val(layerMap.distY);
	};

	var gatherLayerParams = function() {
		var name = $layerNameInput.val();
		var isCollision = $layerCollisionCheckbox.is(":checked");
		var framesPerRow = parseInt($layerFramesPerRowInput.val());
		var tilesetSrc = $layerMapTilesetInput.val();
		var tilesize = parseInt($layerMapTilesizeInput.val());
		var tilesX = parseInt($layerMapTilesXInput.val());
		var tilesY = parseInt($layerMapTilesYInput.val());
		var offsetX = parseInt($layerMapOffsetXInput.val());
		var offsetY = parseInt($layerMapOffsetYInput.val());
		var distX = parseInt($layerMapDistXInput.val());
		var distY = parseInt($layerMapDistYInput.val());

		return {
			name: name,
			layerMap: {
				collision: isCollision,
				offsetX: offsetX,
				offsetY: offsetY,
				distX: distX,
				distY: distY,
				renderer: {
					tilesetSrc: tilesetSrc,
					framesPerRow: framesPerRow
				},
				map: {
					tilesize: tilesize,
					tilesX: tilesX,
					tilesY: tilesY
				}
			}
		};
	};

	var validateLayerParams = function(params) {
		if (!params.name) return false;
		var duplicateName = !!(_.findWhere(gm.Game.layers, { "name": params.name }));
		if (duplicateName) return false;
		return true;
	};

	var refreshLayerList = function() {
		$layerList.empty();

		var layers = gm.Game._layers;
		for (var l = 0; l < layers.length; l++) {
			$layerList.append(createLayerListEntry(layers[l]));
		}
	};

	var createEntityListEntry = function(entity) {
		var $entry = $("<li>");
		$entry.attr("data-entity-tag", entity._tag);

		var $p = $("<p>");
		$p.html(entity.name);
		
		$entry.append($p);
		return $entry;
	};

	var refreshEntityList = function() {
		$entityList.empty();

		var entities = gm.Game._entities;
		for (var e = 0; e < entities.length; e++) {
			$entityList.append(createEntityListEntry(entities[e]));
		}
	};

	var onEntitySelected = function(entity) {

	};

	$("#layer-list").on("click", "li", function() {
		var layer = gm.Game.findLayerByTag(parseInt($(this).attr("data-layer-tag")));
		console.log(layer, $(this).attr("data-layer-tag"));
		gm.Editor.selectLayer(layer);
		refreshSelectedLayer();
	});

	$("#entity-list li").on("click", function() {
		var entity = gm.Game._entities[entity];
		gm.Editor.selectEntity(entity);
		onEntitySelected(entity);
	});

	$layerCollisionCheckbox.change(function() {
		$layerFramesPerRowInput.prop("disabled", this.checked);
	});

	$addLayerButton.click(function(e) {
		e.preventDefault();
		e.stopPropagation();

		var params = gatherLayerParams();
		if (validateLayerParams(params)) {
			gm.Editor.addNewLayer(params, function(layer) {
				refreshLayerList();
				gm.Editor.selectLayer(layer);
				refreshSelectedLayer();
				flashBody(true);	
			});
		} else flashBody(false);
		
	});

	$updateLayerButton.click(function(e) {
		e.preventDefault();
		e.stopPropagation();

		var params = gatherLayerParams();
		if (validateLayerParams(params)) {
			gm.Editor.updateLayer(editor._layer, params, function() {
				refreshSelectedLayer();
				flashBody(true);	
			});
		} else flashBody(false);
	});

	$removeLayerButton.click(function(e) {
		e.preventDefault();
		e.stopPropagation();
	});

});

