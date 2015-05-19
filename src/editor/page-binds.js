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
	var $layerMapRepeatXInput = $("#layer-map-repeat-x");
	var $layerMapRepeatYInput = $("#layer-map-repeat-y");
	var $layerDistXInput = $("#layer-dist-x");
	var $layerDistYInput = $("#layer-dist-y");

	var $addLayerButton = $("#add-layer");
	var $updateLayerButton = $("#update-layer");

	var $entityList = $("#entity-list");

	var $entityNameInput = $("#entity-name");
	var $entityClassNameInput = $("#entity-class-name");

	var $addEntityButton = $("#add-entity");
	var $updateEntityButton = $("#update-entity");

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
		$p.html(layer.name + " - " + layer._tag);
		
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
		var layerMap = layer._layerMap,
			renderer = layerMap.renderer,
			map = layerMap._map;

		$layerCollisionCheckbox.prop("checked", !!layer._isCollision);

		if (renderer) {
			$layerMapTilesetInput.val(renderer._tilesetSrc);
			$layerFramesPerRowInput.val(renderer._framesPerRow);

			$layerMapRepeatXInput.val(renderer.repeatX);
			$layerMapRepeatYInput.val(renderer.repeatY);
		}

		$layerMapTilesXInput.val(map._tilesX);
		$layerMapTilesYInput.val(map._tilesX);
		$layerMapTilesizeInput.val(map.tilesize);
		
		$layerMapOffsetXInput.val(layerMap._offsetX);
		$layerMapOffsetYInput.val(layerMap._offsetY);
		
		$layerDistXInput.val(layer.distX);
		$layerDistYInput.val(layer.distY);
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
		var repeatX = $layerMapRepeatXInput.is(":checked");
		var repeatY = $layerMapRepeatYInput.is(":checked");
		var distX = parseFloat($layerDistXInput.val());
		var distY = parseFloat($layerDistYInput.val());

		return {
			name: name,
			distX: distX,
			distY: distY,
			isCollision: isCollision,
			layerMap: {
				offsetX: offsetX,
				offsetY: offsetY,
				renderer: {
					tilesetSrc: tilesetSrc,
					framesPerRow: framesPerRow,
					repeatX: repeatX,
					repeatY: repeatY
				},
				map: {
					tilesize: tilesize,
					tilesX: tilesX,
					tilesY: tilesY
				}
			}
		};
	};

	var refreshLayerList = function() {
		$layerList.empty();

		var layers = editor._level._layers;
		for (var l = 0; l < layers.length; l++) {
			$layerList.append(createLayerListEntry(layers[l]));
		}
	};

	var createEntityListEntry = function(entity) {
		var $entry = $("<li>");
		$entry.attr("data-entity-tag", entity._tag);

		var $p = $("<p>");
		$p.html(entity.name + " - " + entity._tag);
		
		$entry.append($p);
		return $entry;
	};

	var refreshEntityList = function() {
		$entityList.empty();

		var entities = editor._level._entities;
		for (var e = 0; e < entities.length; e++) {
			$entityList.append(createEntityListEntry(entities[e]));
		}
	};

	var refreshSelectedEntity = function() {
		var entity = editor._entity;
		$entityClassNameInput.val(entity.className);
		$entityNameInput.val(entity.name);
	};

	$("#layer-list").on("click", "li", function() {
		var layer = editor._level.findLayerByTag(parseInt($(this).attr("data-layer-tag")));
		gm.Editor.selectLayer(layer);
		refreshSelectedLayer();
	});

	$("#entity-list li").on("click", function() {
		var entity = editor._level._entities[entity];
		gm.Editor.selectEntity(entity);
		refreshSelectedEntity();
	});

	$layerCollisionCheckbox.change(function() {
		$layerFramesPerRowInput.prop("disabled", this.checked);
		$layerMapTilesetInput.prop("disabled", this.checked);
	});

	$addLayerButton.click(function(e) {
		e.preventDefault();
		e.stopPropagation();

		var params = gatherLayerParams();
		
		gm.Editor.addNewLayer(params, function(layer) {
			if (!layer) return flashBody(false);

			refreshLayerList();
			editor.selectLayer(layer);
			refreshSelectedLayer();
			flashBody(true);	
		});
		
	});

	$updateLayerButton.click(function(e) {
		e.preventDefault();
		e.stopPropagation();

		var params = gatherLayerParams();

		editor.updateLayer(editor._layer, params, function(success) {
			if (!success) return flashBody(false);

			refreshSelectedLayer();
			flashBody(true);
		});
	});

	$removeLayerButton.click(function(e) {
		e.preventDefault();
		e.stopPropagation();
	});

	$addEntityButton.click(function(e) {
		e.preventDefault();
		e.stopPropagation();

		var name = $entityNameInput.val();
		var className = $entityClassNameInput.val();

		editor.addNewEntity(className, name, function(entity) {
			if (!entity) return flashBody(false);
			
			refreshEntityList();
			editor.selectEntity(entity);
			refreshSelectedEntity();
			flashBody(true);
		});
	});

});

