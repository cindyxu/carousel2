gm.EntityPhysics = function() {

	var colRules = gm.CollisionRules;
	var X = gm.Constants.Dim.X;
	var Y = gm.Constants.Dim.Y;

	var EntityPhysics = {
		gravityX: 0,
		gravityY: 1
	};

	EntityPhysics.preUpdate = function(entity) {
		entity._body.addForce(EntityPhysics.gravityX, EntityPhysics.gravityY);
	};

	EntityPhysics.postUpdate = function(entity) {
		entity._body.resetAccel();
	};

	EntityPhysics.updateStep = function(entity, delta, dim) {
		if (dim === X) entity._body.updateStepX(delta);
		else entity._body.updateStepY(delta);
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
			var body = entity._body;
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

	var tres = {};
	var pres0 = {};
	var tbbox = {};
	EntityPhysics.collideEntityWithLayer = function(entity, layer, dim) {

		var tile, stileX, stileY, etileX, etileY;

		var body = entity._body;
		var bbox = body.getBbox();
		var layerMap = layer._layerMap;
		var map = layerMap._map;
		var collided = false;
		var collideDir;

		if (dim === X) {
			if (!body.vx) return;

			layerMap.getOverlappingTileBbox(bbox, tbbox);

			stileX = (body.vx < 0 ? tbbox.tx0 : tbbox.tx1 - 1);
			if (!map.inRangeX(stileX)) return;
			
			stileY = map.clampTileDim(tbbox.ty0, Y);
			etileY = map.clampTileDim(tbbox.ty1, Y);

			for (var y = stileY; y < etileY; y++) {
				collided = collided || EntityPhysics.collideBodyWithTile(body, layerMap, stileX, y, dim);
			}

			if (collided) {
				if (body.vx < 0) collideDir = "left";
				else collideDir = "right";
			}

		} else {
			if (!body.vy) return;
			
			layerMap.getOverlappingTileBbox(bbox, tbbox);

			stileY = (body.vy < 0 ? tbbox.ty0 : tbbox.ty1 - 1);
			if (!map.inRangeX(stileY)) return;
			
			stileX = map.clampTileDim(tbbox.tx0, X);
			etileX = map.clampTileDim(tbbox.tx1, X);

			for (var x = stileX; x < etileX; x++) {
				collided = collided || EntityPhysics.collideBodyWithTile(body, layerMap, x, stileY, dim);
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

	var pres1 = {};
	EntityPhysics.collideBodyWithTile = function(body, layerMap, tx, ty, dim) {
		var tile = layerMap._map.tileAt(tx, ty);
		if (tile == gm.Constants.Collision.SOLID) {
			layerMap.tileToPos(tx, ty, pres1);
			if (dim === X) {
				if (body.vx > 0) {
					body.moveTo(pres1.x - body._sizeX, body._y);
				} else {
					body.moveTo(pres1.x + layerMap._map.tilesize, body._y);
				}
				return true;
			} else {
				if (body.vy > 0) {
					body.moveTo(body._x, pres1.y - body._sizeY);
				} else {
					body.moveTo(body._x, pres1.y + layerMap._map.tilesize);
				}
				return true;
			}
		}
		return false;
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
			body = entity._body;

			// collide against collideLayer first
			var currentCollideLayer = entity._body._collisionState.layer;
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
			currBody = currEntity._body;
			
			for (var j = i+1; j < elength; j++) {
				nextEntity = entities[j];
				nextBody = nextEntity._body;

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

	return EntityPhysics;
	
}();