var pres = {};
var tres = {};

var colRules = gm.CollisionRules;
var X = gm.Constants.Dir.X;
var Y = gm.Constants.Dir.Y;

var Collision = gm.Collision = {};

Collision.collideBodyWithLayerMap = function(body, layerMap, dim) {

	var tile, stileX, stileY, etileX, etileY;
	var map = layerMap.map;
	var collided = false;

	if (dim === X) {
		if (!body._velX) return;

		var sx = (body._velX < 0 ? body._x : body._x + body._sizeX);
		
		layerMap.posToTile(sx, body._y, tres);
		if (!map.inRange(tres.tx, tres.ty)) return;
		
		stileX = tres.tx;
		stileY = map.clampTile(tres.ty, Y);

		layerMap.posToTile(sx, body._y + body._sizeY, tres);
		etileY = map.clampTile(tres.ty, Y);

		for (var y = stileY; y <= etileY; y++) {
			collided = collided || Collision.collideBodyWithTile(body, layerMap, stileX, y, dim);
		}

		if (collided) {
			if (body._velX < 0) body.colliding.left = layerMap;
			else body.colliding.right = layerMap;
		}

	} else {
		if (!body._velY) return;
		
		var sy = (body._velY < 0 ? body._y : body._y + body._sizeY);
		
		layerMap.posToTile(body._x, sy, tres);
		if (!map.inRange(tres.tx, tres.ty)) return;
		stileY = tres.ty;
		stileX = map.clampTile(tres.tx, X);

		layerMap.posToTile(body._x + body._sizeX, sy, tres);
		etileX = map.clampTile(tres.tx, X);

		for (var x = stileX; x <= etileX; x++) {
			collided = collided || Collision.collideBodyWithTile(body, layerMap, x, stileY, dim);
		}

		if (collided) {
			if (body._velY < 0) body.colliding.up = layerMap;
			else body.colliding.down = layerMap;
		}
	}
	return collided;
};

Collision.collideBodyWithTile = function(body, layerMap, tx, ty, dim) {
	var tile = layerMap.map.tileAt(tx, ty);
	if (!tile) return false;
	layerMap.tileToPos(tx, ty, pres);
	if (dim === X) {
		if (tile.solid) {
			if (body._vx > 0) {
				body.moveTo(pres.x - body._sizeX, body._y);
			} else {
				body.moveTo(pres.x + layerMap.map.tilesize, body._y);
			}
			return true;
		}
	} else {
		if (tile.solid) {
			if (body._vy > 0) {
				body.moveTo(body._x, pres.y - body._sizeY);
			} else {
				body.moveTo(body._x, pres.y + layerMap.map.tilesize);
			}
			return true;
		}
	}
};

Collision.collideBodies = function(body1, body2, dim) {

	var overlapAmt;

	if (dim === X && body2._x < body1._x ||
		dim === Y && body2._y < body1._y) {
		var tmp = body1;
		body1 = body2;
		body2 = tmp;
	}

	var moveRatio1, moveRatio2;

	if ((dim === X && body1.colliding.left) || (dim === Y && body1.colliding.up)) {
		moveRatio1 = 0;
		moveRatio2 = 1;
	}
	else if ((dim === X && body2.colliding.right) || (dim === Y && body2.colliding.down)) {
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
		body1.colliding.right = body2;
		body2.colliding.left = body1;

	} else {
		overlapAmt = body1._y + body1._sizeY - body2._y;
		
		body1.moveTo(body1._x, body1._y - overlapAmt * moveRatio1);
		body2.moveTo(body2._x, body2._y + overlapAmt * moveRatio2);
		body1.colliding.down = body2;
		body2.colliding.up = body1;
	}
};

Collision.collideEntitiesWithLayerMaps = function(layers, entities, dim) {
	var layer, map, entity, body;
	var llength = layers.length;
	var elength = entities.length;
	
	for (var l = 0; l < llength; l++) {
		layer = layer[l];
		layerMap = layer.layerMap;
		if (!layerMap.collideEntity) continue;
		for (var e = 0; e < elength; e++) {
			entity = entities[e];
			body = entity.body;
			if (colRules.shouldCollideEntityWithLayer(entity, layer)) {
				if (Collision.collideBodyWithLayerMap(body, layerMap, dim)) {
					colRules.onEntityCollidedWithLayer(entity, layer);
				}
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
				Collision.collideBodies(currBody, nextBody, dim);
				colRules.onEntitiesCollided(currEntity, nextEntity);
			}
		}
	}
};
