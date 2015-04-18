var X = gm.Constants.Dim.X;
var Y = gm.Constants.Dim.Y;

var game = gm.Game = {};

game._width = gm.Settings.Game.WIDTH;
game._height = gm.Settings.Game.HEIGHT;
game.tickStep = gm.Settings.Game.TICKSTEP;
game.maxTicks = gm.Settings.Game.MAX_TICKS;

game.lastRun = undefined;
game._playing = false;

var layers = game._layers = [];
var entities = game._entities = [];
var externals = game._externals = [];

gm.Game.init = function() {
	game._camera = new gm.Camera();
	externals.push(game._camera);
};

gm.Game.play = function() {
	game._playing = true;
	game.lastRun = Date.now();
};

gm.Game.pause = function() {
	game._playing = false;
};

gm.Game.clearLevel = function() {
	layers = [];
	entities = [];
	externals = [];
};

gm.Game.addLayer = function(layer) {
	layers.push(layer);
};

gm.Game.removeLayer = function(layer) {
	var lentities = layer._entities,
		elength = lentities.length;

	for (var e = 0; e < elength; e++) {
		game.removeEntity(lentities[e]);
	}

	var i = layers.indexOf(layer);
	if (i >= 0) layers.splice(i, 1);
};

gm.Game.findLayerByName = function(name) {
	for (var i = 0; i < layers.length; i++) {
		if (layers[i].name === name) return layers[i];
	}
};

gm.Game.findLayerByTag = function(tag) {
	for (var i = 0; i < layers.length; i++) {
		if (layers[i]._tag === tag) return layers[i];
	}
};

gm.Game.addEntity = function(entity, layer) {
	var e = entities.indexOf(entity);
	if (e < 0) {
		entities.push(entity);
		layer.addEntity(entity);
	}
};

gm.Game.removeEntity = function(entity) {
	entity.layer.removeEntity(entity);

	var i = entities.indexOf(entity);
	if (i >= 0) entities.splice(i, 1);
};

gm.Game.update = function() {
	if (!game._playing) return;

	var now = Date.now();

	var targetTicks = Math.min(game.maxTicks, 
		Math.floor((now - game.lastRun) / game.tickStep));
	var tickStep = game.tickStep;

	game.preUpdate();

	for (var i = 0; i < targetTicks; i++) {
		game.updateStep(tickStep, X);
		game.updateStep(tickStep, Y);
	}

	var deltaTime = targetTicks * game.tickStep;
	game.postUpdate(deltaTime);
	game.lastRun += deltaTime;
};

gm.Game.preUpdate = function() {
	var elength = entities.length;
	for (var e = 0; e < elength; e++) {
		game.physics.preUpdate(entities[e]);
		entities[e].preUpdate();
	}
};

gm.Game.postUpdate = function(deltaTime) {
	var elength = entities.length;
	for (var e = 0; e < elength; e++) {
		entities[e].postUpdate();
		game.physics.postUpdate(entities[e]);
	}
};

var sortEntitiesXAxis = function(e1, e2) {
	return e1.body.x - e2.body.x;
};

gm.Game.updateStep = function(delta, dim) {
	var llength = layers.length;
	for (var l = 0; l < llength; l++) {
		layers[l].updateStep(delta, dim);
	}

	var elength = entities.length;
	for (var e = 0; e < elength; e++) {
		game.physics.updateStep(entities[e], delta, dim);
	}

	gm.Collision.startCollisions(layers, entities, dim);
	gm.Collision.collideEntitiesWithLayers(layers, entities, dim);
	if (dim === X) entities.sort(sortEntitiesXAxis);
	gm.Collision.collideEntities(entities, dim);
	gm.Collision.finishCollisions(layers, entities, dim);

	for (e = 0; e < elength; e++) {
		game.physics.postCollision(entities[e], dim);
	}
};

gm.Game.render = function(ctx) {
	var bbox = game._camera._body.getBbox(),
		llength = layers.length,
		nlength = externals.length;

	ctx.save();
	ctx.fillStyle = gm.Settings.Game.BACKGROUND_COLOR;
	ctx.fillRect(0, 0, game._width, game._height);
	ctx.restore();

	for (var l = 0; l < llength; l++) {
		layers[l].render(ctx, bbox);
	}

	for (var n = 0; n < nlength; n++) {
		if (externals[n].render) externals[n].render(ctx, bbox);
	}	
	
};