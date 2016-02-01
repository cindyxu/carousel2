if (!gm.EntityClasses) gm.EntityClasses = {};

gm.EntityClasses.Door = function() {

	var spriteSrc = "images/spritesheets/mirror.png";

	var bodyParams = {
		sizeX: 40,
		sizeY: 40,
		weight: 0
	};

	var spriteParams = {
		sizeX: 40,
		sizeY: 40
	};

	var entityParams = {
		collideBodyType: gm.Constants.Collision.bodyTypes.NONE,
		collideMapType: gm.Constants.Collision.mapTypes.NONE,
		drawIndex: -99
	};

	var spriteAnims = {
		idle: {
			speed: 100,
			frames: [0]
		},
		open: {
			speed: 100,
			frames: [0],
			loop: 1
		}
	};

	var Door = function(name) {
		var body = new gm.Body(bodyParams);
		var sprite = new gm.Sprite(spriteAnims);
		var renderer = new gm.Renderer.SpriteEntity(spritesheetSrc, spriteParams);
		
		var entity = new gm.Entity(name, entityParams);
		var controller = new gm.Controllers.Door(entity, controllerParams);
		
		entity.setBody(body);
		entity.setSprite(sprite);
		entity.setRenderer(renderer);
		entity.setController(controller);

		return entity;
	};

	return Door;
	
}();