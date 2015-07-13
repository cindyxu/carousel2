gm.EntityClasses.Partner = function() {

	var Player = gm.EntityClasses.Player;

	var Partner = function(name) {
		var entity = Player.createEntity(name);
		entity._agent = new gm.Agent(entity);
	};

}();