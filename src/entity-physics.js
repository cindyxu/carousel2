var pres = {};
var tres = {};

var colRules = gm.CollisionRules;
var X = gm.Constants.Dir.X;
var Y = gm.Constants.Dir.Y;

var EntityPhysics = gm.EntityPhysics = {
	gravityX: 0,
	gravityY: 1
};

EntityPhysics.preUpdate = function(entity) {
	entity.body.addForce(EntityPhysics.gravityX, EntityPhysics.gravityY);
};

EntityPhysics.postUpdate = function(entity) {
	entity.body.resetAccel();
};

EntityPhysics.updateStep = function(entity, delta, dim) {
	if (dim === X) entity.body.updateStepX(delta);
	else entity.body.updateStepY(delta);
};

EntityPhysics.resolveCollisions = function(layers, entities, dim) {
	EntityPhysics.startCollisions(layers, entities, dim);
	EntityPhysics.collideEntitiesWithLayers(layers, entities, dim);
	EntityPhysics.collideEntities(entities, dim);
	EntityPhysics.finishCollisions(layers, entities, dim);
};

EntityPhysics.startCollisions = function(layers, entities, dim) {
	for (var e = 0; e < entities.length; e++) {
		colRules.onStartCollisions(entities[e]);
	}
};

EntityPhysics.finishCollisions = function(layers, entities, dim) {
	for (var e = 0; e < entities.length; e++) {
		
		colRules.onFinishCollisions(entities[e]);

		var entity = entities[e];
		var body = entity.body;
		if (dim === X) {
			if (body._collisionState.left) {
				body.clampVelLeft();
			}
			if (body._collisionState.right) {
				body.clampVelRight();
			}
		} else {
			if (body._collisionState.up) {
				body.clampVelUp();
			}
			if (body._collisionState.down) {
				body.clampVelDown();
			}
		}
	}
};

EntityPhysics.collideEntityWithLayer = function(entity, layer, dim) {

	var tile, stileX, stileY, etileX, etileY;

	var body = entity.body;
	var layerMap = layer._layerMap;
	var map = layerMap._map;
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
			EntityPhysics.collideBodyWithTile(body, layerMap, stileX, y, dim);
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
			EntityPhysics.collideBodyWithTile(body, layerMap, x, stileY, dim);
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

EntityPhysics.collideBodyWithTile = function(body, layerMap, tx, ty, dim) {
	var tile = layerMap._map.tileAt(tx, ty);
	if (tile == gm.Constants.Collision.SOLID) {
		layerMap.tileToPos(tx, ty, pres);
		if (dim === X) {
			if (body.vx > 0) {
				body.moveTo(pres.x - body._sizeX, body._y);
			} else {
				body.moveTo(pres.x + layerMap._map.tilesize, body._y);
			}
			return true;
		} else {
			if (body.vy > 0) {
				body.moveTo(body._x, pres.y - body._sizeY);
			} else {
				body.moveTo(body._x, pres.y + layerMap._map.tilesize);
			}
			return true;
		}
	}
};

EntityPhysics.collideEntityWithEntity = function(entity1, entity2, dim) {

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

EntityPhysics.collideEntitiesWithLayers = function(layers, entities, dim) {
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
			EntityPhysics.collideEntityWithLayer(body, currentCollideLayer._layerMap, dim);
		}
		
		for (var l = 0; l < llength; l++) {
			layer = layers[l];
			if (layer === currentCollideLayer || !layer._isCollision) continue;
			layerMap = layer._layerMap;
			
			if (colRules.shouldCollideEntityWithLayer(entity, layer)) {
				EntityPhysics.collideEntityWithLayer(entity, layer, dim);
			}
		}
	}
};

var sortEntitiesXAxis = function(e1, e2) {
	return e1.body.x - e2.body.x;
};

EntityPhysics.collideEntities = function(entities, dim) {
	if (dim === X) entities.sort(sortEntitiesXAxis);

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
			if (!currBody.overlapsAxisX(nextBody)) break;

			if (colRules.shouldCollideEntities(currEntity, nextEntity) && 
				currBody.overlapsAxisY(nextBody)) {
				EntityPhysics.collideEntityWithEntity(currEntity, nextEntity, dim);
			}
		}
	}
};
