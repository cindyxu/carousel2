var cconsts = gm.Constants.Collision = {};

cconsts.mapTypes = {
	NONE: 0,
	ALL: 1,
	STICKY: 2
};

cconsts.bodyTypes = {
	NONE: 0,
	ALL: 1
};

var cmatrix = {};
cmatrix[cconsts.bodyTypes.ALL] = {};
cmatrix[cconsts.bodyTypes.ALL][cconsts.bodyTypes.ALL] = true;
cmatrix[cconsts.bodyTypes.NONE] = {};

cconsts.BodyCollideMatrix = cmatrix;

//////////////////////////////////////////////////////

var X = gm.Constants.Dir.X;
var Y = gm.Constants.Dir.Y;

var COLLIDE_MAP_TYPE_ALL = cconsts.mapTypes.ALL;
var COLLIDE_MAP_TYPE_STICKY = cconsts.mapTypes.STICKY;

var CollisionRules = gm.CollisionRules = {};

CollisionRules.shouldCollideEntityWithLayer = function(entity, layer) {
	var collideType = entity.collideMapType;

	return collideType === COLLIDE_MAP_TYPE_ALL ||
		(collideType === COLLIDE_MAP_TYPE_STICKY &&
			entity.collideLayer === layer);
};

CollisionRules.shouldCollideEntities = function(entity1, entity2) {
	return !!(cconsts.BodyCollideMatrix[entity1.collideBodyType][entity2.collideBodyType]);
};

CollisionRules.onEntityCollidedWithLayer = function(entity, layer) {
	if (entity.collideType === COLLIDE_MAP_TYPE_STICKY) {
		entity.collideLayer = layer;
		gm.moveEntityToLayer(entity, layer);
	}
};

CollisionRules.onEntitiesCollided = function(entity1, entity2) {
	var collideLayer1 = entity1.collideLayer,
		collideLayer2 = entity2.collideLayer;

	// for now rely on other entities not being sticky,
	// but maybe think about collision priority
	if (entity1.collideType === COLLIDE_MAP_TYPE_STICKY &&
		collideLayer2) {
		entity1.collideLayer = collideLayer2;
		gm.moveEntityToLayer(entity1, collideLayer2);
	}
	else if (entity2.collideType === COLLIDE_MAP_TYPE_STICKY &&
		collideLayer1) {
		entity2.collideLayer = collideLayer1;
		gm.moveEntityToLayer(entity2, collideLayer1);
	}
};