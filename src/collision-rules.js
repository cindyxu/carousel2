var cconsts = gm.Constants.Collision = {};

cconsts.SOLID = 1;

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

CollisionRules.createCollisionState = function() {
	return {
		left: undefined,
		right: undefined,
		up: undefined,
		down: undefined,

		layer: undefined
	};
};

CollisionRules.onStartCollisions = function(entity) {
	var body = entity.body;
	var nextCollisionState = body.__nextCollisionState;

	if (!nextCollisionState) {
		nextCollisionState = body.__nextCollisionState = CollisionRules.createCollisionState();
	} else {

		nextCollisionState.left = undefined;
		nextCollisionState.right = undefined;
		nextCollisionState.up = undefined;
		nextCollisionState.down = undefined;

		nextCollisionState.layer = undefined;
	}
};

CollisionRules.onFinishCollisions = function(entity) {
	var body = entity.body;
	var nextCollisionState = body.__nextCollisionState;
	var currentCollisionState = body._collisionState;
	
	currentCollisionState.left = nextCollisionState.left;
	currentCollisionState.right = nextCollisionState.right;
	currentCollisionState.up = nextCollisionState.up;
	currentCollisionState.down = nextCollisionState.down;

	if (currentCollisionState.layer !== nextCollisionState.layer) {
		gm.moveEntityToLayer(entity, layer);
		currentCollisionState.layer = nextCollisionState.layer;
	}
};

CollisionRules.shouldCollideEntityWithLayer = function(entity, layer) {
	var collideType = entity.collideMapType;
	var collideLayer = entity.body._collisionState.layer;

	return collideType === COLLIDE_MAP_TYPE_ALL ||
		(collideType === COLLIDE_MAP_TYPE_STICKY &&
			(!collideLayer || collideLayer === layer));
};

CollisionRules.shouldCollideEntities = function(entity1, entity2) {
	return !!(cconsts.BodyCollideMatrix[entity1.collideBodyType][entity2.collideBodyType]);
};

CollisionRules.onEntityCollidedWithLayer = function(entity, layer, dir) {
	entity.body.__nextCollisionState[dir] = layer;
	if (entity.collideType === COLLIDE_MAP_TYPE_STICKY) {
		entity.body.__nextCollisionState.layer = layer;
	}
};

CollisionRules.onEntitiesCollided = function(pentity, nentity, dim) {

	var pnextCollisionState = pentity.__nextCollisionState;
	var nnextCollisionState = nentity.__nextCollisionState;

	if (dim === X) {
		pextCollisionState.right = nentity;
		nnextCollisionState.left = pentity;
	} else {
		pnextCollisionState.down = nentity;
		nnextCollisionState.up = pentity;
	}

	var collideLayer1 = pentity.body._collisionState.layer,
		collideLayer2 = nentity.body._collisionState.layer;

	// for now rely on other entities not being sticky,
	// but maybe think about collision priority
	if (pentity.collideType === COLLIDE_MAP_TYPE_STICKY &&
		collideLayer2) {
		pnextCollisionState.collideLayer = collideLayer2;
	}
	else if (nentity.collideType === COLLIDE_MAP_TYPE_STICKY &&
		collideLayer1) {
		nnextCollisionState.collideLayer = collideLayer1;
	}
};