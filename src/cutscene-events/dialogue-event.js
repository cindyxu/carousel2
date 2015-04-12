gm.DialogueEvent.SpeechEvent = function(speech) {
	this.start = function() {
		gm.Dialogue.speech = speech;
		gm.Dialogue.start();
	};

	this.update = function() {
		gm.Dialogue.update();
	};

	this.isFinished = function() {
		return gm.Dialogue.finished;
	};
};