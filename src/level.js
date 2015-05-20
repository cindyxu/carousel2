var X = gm.Constants.Dim.X;
var Y = gm.Constants.Dim.Y;
var LOGGING = gm.Settings.LOGGING;

gm.Level = function() {
	var level = this;

	level._levelDirty = false;
	
	level._layers = [];
	level._collisionLayers = [];
	level._entities = [];
};

gm.Level.prototype.init = function() {
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
	gm.Level.Model.createLayer(params, function(layer) {
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
	model.updateLayer(layer, params, function() {
		if (LOGGING) console.log("updated layer");
		
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
		var j = collisionLayers.indexOf(layer);
		if (j >= 0) collisionLayers.splice(j, 1);
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

gm.Level.prototype.addNewEntity = function(className, name, layer, callback) {
	var level = this;
	gm.Level.Model.createEntity(className, name, function(entity) {
		level.addEntity(entity, layer);
		if (callback) callback(entity);

	});
};

gm.Level.prototype.addEntity = function(entity, layer) {
	var entities = this._entities;
	var e = entities.indexOf(entity);
	if (e < 0) {
		entities.push(entity);
		layer.addEntity(entity);
		if (LOGGING) console.log("added entity", entity.name, "to", layer.name);
	}
};

gm.Level.prototype.removeEntity = function(entity) {
	var entities = this._entities;
	
	entity.layer.removeEntity(entity);

	var i = entities.indexOf(entity);
	if (i >= 0) entities.splice(i, 1);
	if (LOGGING) console.log("removed entity", entity.name);

};

gm.Level.prototype.resolveLevelChange = function() {
	var level = this;
	
	level._levelDirty = false;
};

gm.Level.prototype.preUpdate = function() {
	var level = this,
		entities = level._entities;

	if (level._levelDirty) {
		level.resolveLevelChange();
	}

	var elength = entities.length;
	for (var e = 0; e < elength; e++) {
		gm.EntityPhysics.preUpdate(entities[e]);
		entities[e].preUpdate();
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

	gm.EntityPhysics.resolveCollisions(collisionLayers, entities, dim);
};