gm.Event.GameWrapper = function() {

	var _EntityWrapper = function(entity) {

	};

	_EntityWrapper.prototype.newTransition = function() {

	};

	var _EntityTransition = function(entity) {

	};

	_EntityTransition.prototype.start = function() {

	};

	var GameWrapper = function(driver) {

	};

	GameWrapper.prototype.createEntity = function(EntityClass, name, x, y) {

	};

	GameWrapper.prototype.destroyEntity = function(entityRef) {

	};

	GameWrapper.prototype.controlEntity = function(entityName) {

	};

	GameWrapper.prototype.goToLevel = function(levelName, entityRefs, callback) {

	};

	GameWrapper.prototype.showDialogueBox = function(show) {
		driver._dialogueBox.show(show);
	};

	GameWrapper.prototype.startDialogue = function(dialogueJSON, callback) {
		driver._dialogueBox.startDialogue(dialogueJSON, callback);
	};

	return GameWrapper;

	// etc. let's create these functions as needed

}();