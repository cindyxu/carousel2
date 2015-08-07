if (!gm.EntityClasses) gm.EntityClasses = {};

gm.EntityClasses.Player = function() {

	var spriteSrc = "images/spritesheets/player.png";

	var bodyParams = {
		sizeX: 24,
		sizeY: 24,
		maxVelX: 50,
		maxVelY: 120,
		dampX: 100,
		dampY: 0,
		weight: 200
	};

	var controllerParams = {
		walkForce: 300,
		jumpImpulse: 0.6,
		maxJumps: 1
	};

	var entityParams = {
		collideBodyType: gm.Constants.Collision.bodyTypes.ALL,
		collideMapType: gm.Constants.Collision.mapTypes.STICKY,
		drawIndex: -99
	};

	var Player = function(name) {
		var body = new gm.Body(bodyParams);
		//var renderer = new gm.Renderer.EntitySprite(body, sprite);
		var entity = new gm.Entity(name, entityParams);
		var controller = new gm.Controllers.Player(entity, controllerParams);
		entity.setBody(body);
		//entity.setRenderer(renderer);
		entity.setController(controller);

		return entity;
	};

	return Player;
	
}();