var physics = gm.Game.physics = {
	gravityX: 0,
	gravityY: 1
};

physics.preUpdate = function(entity) {
	entity.body.addForce(physics.gravityX, physics.gravityY);
};

physics.postUpdate = function(entity) {
	entity.body.resetAccel();
};

physics.updateStep = function(entity, delta, dim) {
	entity.body.updateStep(delta, dim);
};

physics.postCollision = function(entity, dim) {
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
};