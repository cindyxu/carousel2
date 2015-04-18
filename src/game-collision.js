var pres = {};
var tres = {};

var colRules = gm.CollisionRules;
var X = gm.Constants.Dir.X;
var Y = gm.Constants.Dir.Y;

var Collision = gm.Collision = {};

Collision.startCollisions = function(layers, entities, dim) {
	for (var e = 0; e < entities.length; e++) {
		colRules.onStartCollisions(entities[e]);
	}
};

Collision.finishCollisions = function(layers, entities, dim) {
	for (var e = 0; e < entities.length; e++) {
		colRules.onFinishCollisions(entities[e]);
	}
};

Collision.collideEntityWithLayer = function(entity, layer, dim) {

	var tile, stileX, stileY, etileX, etileY;

	var body = entity.body;
	var layerMap = layer.layerMap;
	var map = layerMap.map;
	var collided = false;
	var collideDir;

	if (dim === X) {
		if (!body.vx) return;

		var sx = (body.vx < 0 ? body._x : body._x + body._sizeX);
		layerMap.posToTile(sx, body._y, tres);

		if (!map.inRange(tres.tx, tres.ty)) return;
		
		stileX = tres.tx;
		stileY = map.clampTileDim(tres.ty, Y);

		layerMap.posToTile(sx, body._y + body._sizeY, tres);
		etileY = map.clampTileDim(tres.ty, Y);

		for (var y = stileY; y < etileY; y++) {
			collided = collided || Collision.collideBodyWithTile(body, layerMap, stileX, y, dim);
		}

		if (collided) {
			if (body.vx < 0) collideDir = "left";
			else collideDir = "right";
		}

	} else {
		if (!body.vy) return;
		
		var sy = (body.vy < 0 ? body._y : body._y + body._sizeY);
		layerMap.posToTile(body._x, sy, tres);

		if (!map.inRange(tres.tx, tres.ty)) return;
		
		stileY = tres.ty;
		stileX = map.clampTileDim(tres.tx, X);

		layerMap.posToTile(body._x + body._sizeX, sy, tres);
		etileX = map.clampTileDim(tres.tx, X);

		for (var x = stileX; x < etileX; x++) {
			collided = collided || Collision.collideBodyWithTile(body, layerMap, x, stileY, dim);
		}

		if (collided) {
			if (body.vy < 0) collideDir = "up";
			else collideDir = "down";
		}
	}

	if (collideDir) {
		colRules.onEntityCollidedWithLayer(entity, layer, collideDir);
	}
};

Collision.collideBodyWithTile = function(body, layerMap, tx, ty, dim) {
	var tile = layerMap.map.tileAt(tx, ty);
	if (tile == gm.Constants.Collision.SOLID) {
		layerMap.tileToPos(tx, ty, pres);
		if (dim === X) {
			if (body.vx > 0) {
				body.moveTo(pres.x - body._sizeX, body._y);
			} else {
				body.moveTo(pres.x + layerMap.map.tilesize, body._y);
			}
			return true;
		} else {
			if (body.vy > 0) {
				body.moveTo(body._x, pres.y - body._sizeY);
			} else {
				body.moveTo(body._x, pres.y + layerMap.map.tilesize);
			}
			return true;
		}
	}
};

Collision.collideEntities = function(entity1, entity2, dim) {

	var overlapAmt;

	if (dim === X && entity2.body._x < entity1.body._x ||
		dim === Y && entity2.body._y < entity1.body._y) {
		var tmp = entity1;
		entity1 = entity2;
		entity2 = tmp;
	}

	var body1 = entity1.body;
	var body2 = entity2.body;

	var moveRatio1, moveRatio2;

	if ((dim === X && body1._collisionState.left) || (dim === Y && body1._collisionState.up)) {
		moveRatio1 = 0;
		moveRatio2 = 1;
	}
	else if ((dim === X && body2._collisionState.right) || (dim === Y && body2._collisionState.down)) {
		moveRatio1 = 1;
		moveRatio2 = 0;
	}
	else {
		// smaller one moves more.
		moveRatio1 = body2.weight / (body1.weight + body2.weight);
		moveRatio2 = body1.weight / (body1.weight + body2.weight);
	}

	if (dim === X) {
		overlapAmt = body1._x + body1._sizeX - body2._x;
		
		body1.moveTo(body1._x - overlapAmt * moveRatio1, body1._y);
		body2.moveTo(body2._x + overlapAmt * moveRatio2, body2._y);
		colRules.onEntitiesCollided(currEntity, nextEntity, dim);

	} else {
		overlapAmt = body1._y + body1._sizeY - body2._y;
		
		body1.moveTo(body1._x, body1._y - overlapAmt * moveRatio1);
		body2.moveTo(body2._x, body2._y + overlapAmt * moveRatio2);
		colRules.onEntitiesCollided(currEntity, nextEntity, dim);
	}
};

Collision.collideEntitiesWithLayers = function(layers, entities, dim) {
	var layer, map, entity, body;
	var llength = layers.length;
	var elength = entities.length;
	var res;
	
	for (var e = 0; e < elength; e++) {
		entity = entities[e];
		body = entity.body;

		// collide against collideLayer first
		var currentCollideLayer = entity.body._collisionState.layer;
		if (currentCollideLayer) {
			Collision.collideEntityWithLayer(body, currentCollideLayer.layerMap, dim);
		}
		
		for (var l = 0; l < llength; l++) {
			layer = layers[l];
			if (layer === currentCollideLayer || !layer._isCollision) continue;
			layerMap = layer.layerMap;
			
			if (colRules.shouldCollideEntityWithLayer(entity, layer)) {
				Collision.collideEntityWithLayer(entity, layer, dim);
			}
		}
	}
};

// assumes entities are sorted on x axis.
Collision.collideEntities = function(entities, dim) {
	var elength = entities.length;
	var currEntity, currBody, nextEntity, nextBody;

	for (var i = 0; i < elength-1; i++) {
		currEntity = entities[i];
		currBody = currEntity.body;
		
		for (var j = i+1; j < elength; j++) {
			nextEntity = entities[j];
			nextBody = nextEntity.body;

			// if next entity is not x-intersecting with this one,
			// go to next group
			if (!currBody.overlapsAxis(nextBody, X)) break;

			if (colRules.shouldCollideEntities(currEntity, nextEntity) && 
				currBody.overlapsAxis(nextBody, Y)) {
				Collision.collideEntities(currEntity, nextEntity, dim);
			}
		}
	}
};
