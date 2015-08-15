(function() {
	
	var cconsts = gm.Constants.Collision = {};
	var Dir = gm.Constants.Dir;

	cconsts.SOLID = Dir.LEFT | Dir.RIGHT | Dir.UP | Dir.DOWN;

	cconsts.mapTypes = {
		NONE: 1,
		ALL: 1 << 1,
		STICKY: 1 << 2
	};

	cconsts.bodyTypes = {
		NONE: 1,
		ALL: 1 << 1
	};

	var cmatrix = {};
	cmatrix[cconsts.bodyTypes.ALL] = {};
	cmatrix[cconsts.bodyTypes.ALL][cconsts.bodyTypes.ALL] = true;
	cmatrix[cconsts.bodyTypes.NONE] = {};

	cconsts.BodyCollideMatrix = cmatrix;

})();

gm.CollisionRules = function() {

	var cconsts = gm.Constants.Collision;
	var COLLIDE_MAP_TYPE_ALL = cconsts.mapTypes.ALL;
	var COLLIDE_MAP_TYPE_STICKY = cconsts.mapTypes.STICKY;
	var X = gm.Constants.Dim.X;
	var Y = gm.Constants.Dim.Y;
	
	var CollisionRules = {};

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
		var body = entity._body;
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

	CollisionRules.onFinishCollisionStep = function(entity, callback) {
		var body = entity._body;
		var nextCollisionState = body.__nextCollisionState;
		var currentCollisionState = body._collisionState;
		
		currentCollisionState.left = nextCollisionState.left;
		currentCollisionState.right = nextCollisionState.right;
		currentCollisionState.up = nextCollisionState.up;
		currentCollisionState.down = nextCollisionState.down;

		var prevLayer = currentCollisionState.layer;
		currentCollisionState.layer = nextCollisionState.layer;
		if (prevLayer !== currentCollisionState.layer) {
			callback.onEntityLayerChanged(currentCollisionState.layer);
		}
	};

	CollisionRules.shouldCollideEntityWithLayer = function(entity, layer) {
		var collideType = entity.collideMapType;
		var collideLayer = entity._body._collisionState.layer;

		return collideType === COLLIDE_MAP_TYPE_ALL ||
			(collideType === COLLIDE_MAP_TYPE_STICKY &&
				(!collideLayer || collideLayer === layer));
	};

	CollisionRules.shouldCollideEntities = function(entity1, entity2) {
		return !!(cconsts.BodyCollideMatrix[entity1.collideBodyType][entity2.collideBodyType]);
	};

	CollisionRules.onEntityCollidedWithLayer = function(entity, layer, dir) {

		entity._body.__nextCollisionState[dir] = layer;
		if (entity.collideType === COLLIDE_MAP_TYPE_STICKY) {
			entity._body.__nextCollisionState.layer = layer;
		}
	};

	CollisionRules.onEntitiesCollided = function(pentity, nentity, dim) {
		var pnextCollisionState = pentity._body.__nextCollisionState;
		var nnextCollisionState = nentity._body.__nextCollisionState;

		if (dim === X) {
			pnextCollisionState.right = nentity;
			nnextCollisionState.left = pentity;
		} else {
			pnextCollisionState.down = nentity;
			nnextCollisionState.up = pentity;
		}

		var collideLayer1 = pentity._body._collisionState.layer,
			collideLayer2 = nentity._body._collisionState.layer;

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

	return CollisionRules;

}();