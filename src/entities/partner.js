if (!gm.EntityClasses) gm.EntityClasses = {};

gm.EntityClasses.Partner = function() {

	var spriteSrc = "images/spritesheets/Partner.png";

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

	var Partner = function(name) {
		var body = new gm.Body(bodyParams);
		//var renderer = new gm.Renderer.EntitySprite(body, sprite);
		var entity = new gm.Entity(name, entityParams);
		var controller = new gm.Controllers.Partner(entity, controllerParams);
		entity.setBody(body);
		//entity.setRenderer(renderer);
		entity.setController(controller);

		return entity;
	};

	return Partner;
	
}();