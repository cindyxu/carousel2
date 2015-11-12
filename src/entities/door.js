if (!gm.EntityClasses) gm.EntityClasses = {};

gm.EntityClasses.Door = function() {

	var spriteSrc = "images/spritesheets/Door.png";

	var bodyParams = {
		sizeX: 24,
		sizeY: 24,
		weight: 0
	};

	var entityParams = {
		collideBodyType: gm.Constants.Collision.bodyTypes.NONE,
		collideMapType: gm.Constants.Collision.mapTypes.STICKY,
		drawIndex: -99
	};

	var Partner = function(name) {
		var body = new gm.Body(bodyParams);
		//var renderer = new gm.Renderer.EntitySprite(body, sprite);
		var entity = new gm.Entity(name, entityParams);
		var controller = new gm.Controllers.Partner(entity, controllerParams, aiParams);
		entity.setBody(body);
		//entity.setRenderer(renderer);
		entity.setController(controller);

		return entity;
	};

	return Partner;
	
}();