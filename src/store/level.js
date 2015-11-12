gm.Store.Level = function() {

	var LevelStore = {};

	LevelStore.fromJSON = function(name, callback) {
		
		var filename = "/levels/" + name + ".json";
		if (LOGGING) console.log("retrieving stored level at " + filename);

		$.getJSON(filename, function(levelJSON) {

			var level = new gm.Level(name);

			var loadedLayers = 0;
			var loadedEntities = 0;
			var totalEntities = 0;
			var finishedImporting = false;

			var entityLoaded = function(entity, layerIndex) {
				loadedEntities++;
				checkDone();
			};

			var layerLoaded = function(layer) {
				loadedLayers++;
				checkDone();
			};

			var checkDone = function() {
				if (finishedImporting && loadedEntities >= totalEntities && 
					loadedLayers >= levelJSON.layers.length) {
					callback(level);
				}
			};

			var l;
			for (l = 0; l < levelJSON.layers.length; l++) {
				totalEntities += levelJSON.layers[l].entities.length;
			}

			if (LOGGING) console.log("importing " + levelJSON.layers.length + " layers and " + totalEntities + " entities");

			for (l = 0; l < levelJSON.layers.length; l++) {
				var layerJSON = levelJSON.layers[l];
				var layer = level.addNewLayer(layerJSON, layerLoaded);
				for (var e = 0; e < layerJSON.entities.length; e++) {
					var entity = gm.Store.Entity.fromJSON(layerJSON.entities[e], entityLoaded);
					level.addEntity(entity, layer);
				}
			}

			finishedImporting = true;
			checkDone();
		});
	};

	LevelStore.toJSON = function(level) {
		var layersJSON = [];
		for (var l = 0; l < level._layers.length; l++) {
			var layer = level._layers[l];
			var layerJSON = this._layerToJSON(level._layers[l]);
			var entitiesJSON = [];
			for (var e = 0; e < layer._entities.length; e++) {
				entitiesJSON.push(gm.Store.Entity.toJSON(layer._entities[e]));
			}
			layerJSON.entities = entitiesJSON;
			layersJSON.push(layerJSON);
		}
		return {
			layers: layersJSON
		};
	};

	LevelStore._layerToJSON = function(layer) {
		
		var layerJSON = {
			name: layer._name,
			distX: layer._distX,
			distY: layer._distY,
			isCollision: layer._isCollision
		};

		if (layer._layerMap) {
			
			layerJSON.layerMap = {
				offsetX: layer._layerMap._offsetX,
				offsetY: layer._layerMap._offsetY
			};

			if (layer._layerMap._map) {
				layerJSON.layerMap.map = {
					tilesX: layer._layerMap._map._tilesX,
					tilesY: layer._layerMap._map._tilesY,
					tilesize: layer._layerMap._map.tilesize,
					tiles: layer._layerMap._map._tiles
				};
			}

			if (layer._layerMap._renderer) {
				layerJSON.layerMap.renderer = {
					tilesetSrc: layer._layerMap._renderer._tilesetSrc,
					framesPerRow: layer._layerMap._renderer._framesPerRow,
					repeatX: layer._layerMap._renderer.repeatX,
					repeatY: layer._layerMap._renderer.repeatY
				};
			}
		}
		
		return layerJSON;
	};

	return LevelStore;

}();