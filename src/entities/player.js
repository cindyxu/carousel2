var spriteSrc = "images/spritesheets/player.png";

var bodyParams = {
	sizeX: 16,
	sizeY: 16,
	maxVelX: 500,
	maxVelY: 500,
	dampX: 0.05,
	dampY: 0,
	weight: 1
};

var entityParams = {
	collideBodyType: gm.Constants.Collision.bodyTypes.ALL,
	collideMapType: gm.Constants.Collision.mapTypes.STICKY,
	drawIndex: -99
};

var controllerParams = {

};

gm.EntityClasses.Player = function(name) {
	var body = new gm.Body(bodyParams);
	var renderer = new gm.Renderer.EntitySprite(body, spriteSrc);
	var controller = new gm.Controllers.Player(controllerParams);
	gm.Entity.call(this, name, body, renderer, controller, entityParams);
};

gm.EntityClasses.Player.prototype = Object.create(gm.Entity.prototype);