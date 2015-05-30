if (!gm.EntityClasses) gm.EntityClasses = {};

gm.EntityClasses.Player = function() {

	var spriteSrc = "images/spritesheets/player.png";

	var bodyParams = {
		sizeX: 16,
		sizeY: 16,
		maxVelX: 60,
		maxVelY: 120,
		dampX: 5,
		dampY: 0,
		weight: 200
	};

	var controllerParams = {
		walkForce: 120,
		jumpImpulse: 0.5,
		maxJumps: 1
	};

	var entityParams = {
		collideBodyType: gm.Constants.Collision.bodyTypes.ALL,
		collideMapType: gm.Constants.Collision.mapTypes.STICKY,
		drawIndex: -99
	};

	return function(name, callback) {
		var body = new gm.Body(bodyParams);
		//var renderer = new gm.Renderer.EntitySprite(body, sprite);
		var controller = new gm.Controllers.Player(controllerParams, body);
		var entity = new gm.Entity(name, entityParams);
		entity.setBody(body);
		//entity.setRenderer(renderer);
		entity.setController(controller);

		if (callback) {
			// entity.renderer.load(function() { callback(entity); });
			callback(entity);
		}
		return entity;
	};
	
}();