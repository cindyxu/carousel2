var spriteSrc = "images/spritesheets/player.png";

var bodyParams = {
	sizeX: 16,
	sizeY: 16,
	maxVelX: 70,
	maxVelY: 200,
	dampX: 5,
	dampY: 0,
	weight: 200
};

var controllerParams = {
	runForce: 90,
	jumpImpulse: 0.5,
	maxJumps: 1
};

var entityParams = {
	collideBodyType: gm.Constants.Collision.bodyTypes.ALL,
	collideMapType: gm.Constants.Collision.mapTypes.STICKY,
	drawIndex: -99
};

gm.EntityClasses.Player = {
	create: function(name, callback) {
		var body = new gm.Body(bodyParams);
		//var renderer = new gm.Renderer.EntitySprite(body, sprite, spriteSrc);
		var controller = new gm.Controllers.Player(body, controllerParams);
		
		var entity = new gm.Entity(name, entityParams);
		entity.body = body;
		//entity.renderer = renderer;
		entity.controller = controller;

		if (callback) {
			// entity.renderer.load(function() { callback(entity); });
			callback(entity);
		}
		return entity;
	}
};
