gm.Event.GameWrapper = function() {

	var GameWrapper = function(driver) {

	};

	GameWrapper.prototype.moveEntityToLevel = function(entityName, levelName, destX, destY) {

	};

	GameWrapper.prototype.createEntity = function(EntityClass, name, x, y) {

	};

	GameWrapper.prototype.destroyEntity = function(entityName) {

	};

	GameWrapper.prototype.goToLevel = function(levelName) {

	};

	GameWrapper.prototype.overrideEntityBehavior = function(entityName, BehaviorFactory) { 

	};

	GameWrapper.prototype.overrideEntityController = function(entityName, ControllerFactory) {

	};

	GameWrapper.prototype.overrideEntitySpriteMapper = function(entityName, SpriteMapperFactory) {

	};

	GameWrapper.prototype.showDialogueBox = function(show) {
		driver._dialogueBox.show(show);
	};

	GameWrapper.prototype.startDialogue = function(dialogueJSON, callback) {
		driver._dialogueBox.startDialogue(dialogueJSON, callback);
	};

	GameWrapper.prototype.revertOverrides = function() {

	};

	return GameWrapper;

	// etc. let's create these functions as needed

}();