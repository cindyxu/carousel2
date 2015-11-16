if (!gm.EntityClasses) gm.EntityClasses = {};

gm.EntityClasses.Player = function() {

	var spritesheetSrc = "images/spritesheets/test.png";

	var bodyParams = {
		sizeX: 16,
		sizeY: 16,
		weight: 200
	};

	var controllerParams = {
		walk: {
			body: {
				maxVelX: 50,
				maxVelY: 120,
				dampX: 100,
				dampY: 0
			},
			behavior: {
				walkForce: 300,
				jumpImpulse: 0.6,
				maxJumps: 1	
			}
		},
		float: {
			body: {
				maxVelX: 60,
				maxVelY: 60,
				dampX: 5,
				dampY: 5
			},
			behavior: {
				floatForce: 100
			}
		}
	};

	var spriteParams = {
		sizeX: 16,
		sizeY: 16
	};

	var spriteAnims = {
		walkerIdle: {
			speed: 100,
			frames: [0, 1, 2, 3]
		},
		walkerWalking: {
			speed: 100,
			frames: [6, 7, 8, 9, 10, 11]
		},
		walkerCrouching: {
			speed: 100,
			loop: 1,
			frames: [12]
		},
		walkerJumping: {
			speed: 100,
			loop: 1,
			frames: [14]
		},
		floaterIdle: {
			speed: 100,
			frames: [0, 1, 2, 3]
		},
		floaterFloating: {
			speed: 100,
			frames: [6, 7, 8, 9, 10, 11]
		}
	};

	var entityParams = {
		collideBodyType: gm.Constants.Collision.bodyTypes.NONE,
		collideMapType: gm.Constants.Collision.mapTypes.STICKY,
		drawIndex: -99
	};

	var Player = function(name) {
		var body = new gm.Body(bodyParams);
		var sprite = new gm.Sprite(spriteAnims);
		var renderer = new gm.Renderer.SpriteEntity(spritesheetSrc, spriteParams);

		var entity = new gm.Entity(name, entityParams);
		var controller = new gm.Controllers.Player(entity, controllerParams);

		entity.setBody(body);
		entity.setSprite(sprite);
		entity.setRenderer(renderer);
		entity.setController(controller);

		return entity;
	};

	return Player;
	
}();