gm.EntityClasses.Partner = function() {

	var Player = gm.EntityClasses.Player;

	var Partner = function(name) {
		var entity = Player(name);

		var camera = new gm.Camera();
		camera.track(entity._body);

		new gm.Ai.Agent(entity, camera);
		return entity;
	};

	return Partner;

}();