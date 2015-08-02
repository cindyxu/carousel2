var tag = 1;

gm.Level = function() {
	var level = this;

	level._levelDirty = false;
	
	level._layers = [];
	level._collisionLayers = [];
	level._entities = [];
	level._entityLayers = {};
	level._listeners = [];

	level._combinedMap = new gm.Ai.CombinedMap(this._layers);

	level._gravity = 1;

	level._tag = tag++;
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

gm.Level.prototype.writeState = function(state) {
	var entities = this._entities,
		elength = entities.length;
	for (var e = 0; e < elength; e++) {
		var entity = entities[e];
		var estate = state[entity._tag];
		if (!estate) estate = state[entity._tag] = {};
		entities[e].writeState(estate);
	}
};

gm.Level.prototype.readState = function(state) {
	var entities = this._entities,
		elength = entities.length;
	for (var e = 0; e < elength; e++) {
		entities[e].readState(state[entities[e]._tag]);
	}
};

gm.Level.prototype.onLayerChanged = function() {
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
	gm.Layer.Model.createLayer(params, function(layer) {
		level.addLayer(layer);
		if (callback) callback(layer);
	});
};

gm.Level.prototype.addLayer = function(layer) {
	var level = this;
	level._layers.push(layer);
	if (layer._isCollision) {
		level._collisionLayers.push(layer);
	}
	layer.listener = level;
	if (LOGGING) console.log("added layer", layer.name);
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
		if (layers.indexOf(layer) >= 0) level.onLevelChanged();
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

	if (LOGGING) console.log("removed layer", layer.name);
	level.onLevelChanged();
};

gm.Level.prototype.findLayerByName = function(name) {
	var layers = this._layers;
	for (var i = 0; i < layers.length; i++) {
		if (layers[i].name === name) return layers[i];
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
		if (LOGGING) console.log("added entity", entity.name, "to", layer.name);
	}
};

gm.Level.prototype.removeEntity = function(entity) {
	var entities = this._entities;
	
	var layer = this._entityLayers[entity];
	if (layer) layer.removeEntity(entity);
	this._entityLayers[entity._tag] = undefined;

	var i = entities.indexOf(entity);
	if (i >= 0) {
		entities.splice(i, 1);
	}
	if (LOGGING) console.log("removed entity", entity.name);
};

gm.Level.prototype.moveEntityToLayer = gm.Level.prototype.onEntityLayerChanged = 
	function(entity, toLayer) {
	var fromLayer = this._entityLayers[entity];
	if (fromLayer) fromLayer.removeEntity(entity);
	toLayer.addEntity(entity);
	this._entityLayers[entity._tag] = toLayer;
	if (LOGGING) console.log("moved entity", entity.name, "to", toLayer.name);
};

gm.Level.prototype.findEntityByName = function(name) {
	var entities = this._entities;
	for (var i = 0; i < entities.length; i++) {
		if (entities[i].name === name) return entities[i];
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

gm.Level.prototype.postUpdate = function() {
	var level = this,
		entities = level._entities;

	var elength = entities.length;
	for (var e = 0; e < elength; e++) {
		entities[e].postUpdate();
		gm.EntityPhysics.postUpdate(entities[e]);
	}

	for (var l = 0; l < this._listeners.length; l++) {
		if (this._listeners[l].onPostUpdate) {
			this._listeners[l].onPostUpdate();
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
	for (var e = 0; e < elength; e++) {
		gm.EntityPhysics.updateStep(entities[e], delta, dim);
	}

	gm.EntityPhysics.resolveCollisions(collisionLayers, entities, dim, this);
};