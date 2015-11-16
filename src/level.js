var tag = 1;

gm.Level = function(name, params) {
	var level = this;

	level._levelDirty = false;
	
	level._layers = [];
	level._collisionLayers = [];
	level._entities = [];
	level._entityLayers = {};
	level._listeners = [];
	level._gravity = 0;

	level._name = name;

	if (params) level._setParams(params);

	level._combinedMap = new gm.Ai.CombinedMap(this._layers);

	level._tag = tag++;
};

gm.Level.prototype.setParams = function(params) {
	if (params.gravity !== undefined) this._gravity = params.gravity;
};

// do not add any ai-related listeners. use gm.LevelAi instead
gm.Level.prototype.addListener = function(listener, front) {
	if (this._listeners.indexOf(listener) < 0) {
		if (front) this._listeners.shift(listener);
		else this._listeners.push(listener);
	}
};

gm.Level.prototype.removeListener = function(listener) {
	var i = this._listeners.indexOf(listener);
	if (i >= 0) {
		this._listeners.splice(i, 1);
	}
};

gm.Level.prototype.onLayerChanged = function(layer) {
	for (var l = 0; l < this._listeners.length; l++) {
		if (this._listeners[l].onLayerChanged) {
			this._listeners[l].onLayerChanged(this, layer);
		}
	}
	this.onLevelChanged();
};

gm.Level.prototype.onLevelChanged = function() {
	this._levelDirty = true;
};

gm.Level.prototype.clearLevel = function() {
	this._layers.length = 0;
	this._entities.length = 0;
	if (LOGGING) console.log("cleared level");
};

gm.Level.prototype.addNewLayer = function(params, callback) {
	var level = this;
	var layer = gm.Layer.Model.createLayer(params, function(layer) {
		if (callback) callback(layer);
	});
	level.addLayer(layer);
	return layer;
};

gm.Level.prototype.addLayer = function(layer) {
	var level = this;
	level._layers.push(layer);
	if (layer._isCollision) {
		level._collisionLayers.push(layer);
	}
	layer.listener = level;
	if (LOGGING) console.log("added layer", layer._name);
	
	for (var l = 0; l < level._listeners.length; l++) {
		if (level._listeners[l].onLayerAdded) {
			level._listeners[l].onLayerAdded(level, layer);
		}
	}
	level.onLevelChanged();
};

gm.Level.prototype.updateLayer = function(layer, params, callback) {
	var level = this;
	var layers = level._layers;
	gm.Layer.Model.updateLayer(layer, params, function() {
		if (LOGGING) console.log("updated layer");
		
		var coli = level._collisionLayers.indexOf(coli);
		if (layer._isCollision && coli < 0) {
			level._collisionLayers.push(layer);
		} else if (!layer._isCollision && coli >= 0) {
			level._collisionLayers.splice(coli, 1);
		}
		if (layers.indexOf(layer) >= 0) {
			level.onLayerChanged(layer);
		}
		if (callback) callback();
	});
};

gm.Level.prototype.removeLayer = function(layer) {
	var level = this;
	var layers = level._layers;
	
	var lentities = layer._entities,
		elength = lentities.length;

	for (var e = 0; e < elength; e++) {
		level.removeEntity(lentities[e]);
	}

	var i = layers.indexOf(layer);
	if (i >= 0) layers.splice(i, 1);

	if (layer._isCollision) {
		var coli = collisionLayers.indexOf(layer);
		if (coli >= 0) collisionLayers.splice(coli, 1);
	}

	if (LOGGING) console.log("removed layer", layer._name);
	
	for (var l = 0; l < level._listeners.length; l++) {
		if (level._listeners[l].onLayerRemoved) {
			level._listeners[l].onLayerRemoved(level, layer);
		}
	}
	
	level.onLevelChanged();
};

gm.Level.prototype.findLayerByName = function(name) {
	var layers = this._layers;
	for (var i = 0; i < layers.length; i++) {
		if (layers[i]._name === name) return layers[i];
	}
};

gm.Level.prototype.findLayerByTag = function(tag) {
	var layers = this._layers;
	for (var i = 0; i < layers.length; i++) {
		if (layers[i]._tag === tag) return layers[i];
	}
};

gm.Level.prototype.addEntity = function(entity, layer) {
	if (!layer) {
		if (LOGGING) console.log("!!! addEntity - no layer provided");
		return;
	}
	var entities = this._entities;
	var e = entities.indexOf(entity);
	if (e < 0) {
		entities.push(entity);
		layer.addEntity(entity);
		this._entityLayers[entity._tag] = layer;
		if (LOGGING) console.log("added entity", entity._name, "to", layer._name);
	}
};

gm.Level.prototype.getLayerForEntity = function(entity) {
	return this._entityLayers[entity._tag];
};

gm.Level.prototype.removeEntity = function(entity) {
	var entities = this._entities;
	
	var layer = this._entityLayers[entity._tag];
	if (layer) layer.removeEntity(entity);
	this._entityLayers[entity._tag] = undefined;

	var i = entities.indexOf(entity);
	if (i >= 0) {
		entities.splice(i, 1);
	}
	if (LOGGING) console.log("removed entity", entity._name);
};

gm.Level.prototype.moveEntityToLayer = gm.Level.prototype.onEntityLayerChanged = 
	function(entity, toLayer) {
	var fromLayer = this._entityLayers[entity._tag];
	if (fromLayer) fromLayer.removeEntity(entity);
	toLayer.addEntity(entity);
	this._entityLayers[entity._tag] = toLayer;
	if (LOGGING) console.log("moved entity", entity._name, "to", tolayer._name);
};

gm.Level.prototype.findEntityByName = function(name) {
	var entities = this._entities;
	for (var i = 0; i < entities.length; i++) {
		if (entities[i]._name === name) return entities[i];
	}
};

gm.Level.prototype.resolveLevelChange = function() {
	var level = this;
	level._combinedMap.fromLayers(this._layers);
	level._levelDirty = false;
	
	for (var i = 0; i < level._listeners.length; i++) {
		if (level._listeners[i].onLevelChanged) {
			level._listeners[i].onLevelChanged(this);
		}
	}
};

gm.Level.prototype.preUpdate = function() {
	var level = this,
		entities = level._entities;

	if (level._levelDirty) {
		level.resolveLevelChange();
	}

	var elength = entities.length;
	for (var e = 0; e < elength; e++) {
		gm.EntityPhysics.applyGravity(entities[e], level._gravity);
		entities[e].preUpdate();
	}

	for (var l = 0; l < this._listeners.length; l++) {
		if (this._listeners[l].onPreUpdate) {
			this._listeners[l].onPreUpdate();
		}
	}
};

gm.Level.prototype.postUpdate = function(delta) {
	var level = this,
		entities = level._entities;

	var elength = entities.length;
	for (var e = 0; e < elength; e++) {
		entities[e].postUpdate(delta);
		gm.EntityPhysics.postUpdate(entities[e]);
	}

	for (var l = 0; l < this._listeners.length; l++) {
		if (this._listeners[l].onPostUpdate) {
			this._listeners[l].onPostUpdate(delta);
		}
	}
};

gm.Level.prototype.updateStep = function(delta, dim) {
	var level = this,
		entities = level._entities,
		layers = level._layers,
		collisionLayers = level._collisionLayers;

	var llength = layers.length;
	for (var l = 0; l < llength; l++) {
		layers[l].updateStep(delta, dim);
	}

	var elength = entities.length;

	gm.EntityPhysics.resolveStep(collisionLayers, entities, delta, dim, this);
};