gm.SaveFile = function() {

	var SaveFile = {};

	SaveFile.loadFromFile = function(driver, file, callback) {
		// consider having a game.reset() function here or something
		$.getJSON("save.JSON", function(saveFile) {
			
			var currentLevelName = saveFile.currentLevel;
			driver.requestEnterLevel(currentLevelName, function(level) {
				gm.Entity.Model.createEntity("Player", "player", function(player) {
					gm.Entity.Model.createEntity("Partner", "partner", function(partner) {
						level.addEntity(player, level._layers[0]);
						level.addEntity(partner, level._layers[0]);
						
						player._body.moveTo(saveFile.playerX, saveFile.playerY);
						partner._body.moveTo(saveFile.playerX, saveFile.playerY);
						
						if (callback) callback(level);
					});
				});
			});
		
		}).fail(function() {
			if (callback) callback();
		});
	};

	return SaveFile;

}();