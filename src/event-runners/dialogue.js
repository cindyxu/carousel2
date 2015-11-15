gm.Event.Runners.Dialogue = function() {

	var DialogueRunner = function(eventWrapper, params) {
		this._eventWrapper = eventWrapper;
		this._setParams(params);
		this._finished = false;
	};

	DialogueRunner.prototype._setParams = function(params) {
		this._dialogueJSON = params.dialogue;
	};

	DialogueRunner.prototype.start = function() {
		this._finished = false;
		this._eventWrapper.showDialogueBox();
		this._eventWrapper.startDialogue(this._dialogueJSON, this._onDialogueFinished);
	};

	DialogueRunner.prototype.update = function() {
		return this._finished;
	};

	DialogueRunner.prototype.onDialogueFinished = function() {
		this._finished = true;
	};

}();