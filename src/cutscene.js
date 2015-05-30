gm.Cutscene = function() {

	var states = {
		IDLE: 0,
		RUNNING: 1,
		FINISHED: 2
	};

	var Cutscene = function() {
		this.events = [];
		this.eventIndex = 0;
		this.state = states.IDLE;
	};

	Cutscene.prototype.update = function(elapsed) {
		if (this.state !== states.RUNNING) return;

		this.events[this.eventIndex].update(elapsed);
		if (this.events[this.eventIndex].isFinished()) {
			this.eventIndex++;
			if (this.eventIndex >= this.events.length) {
				this.state = states.FINISHED;
				return;
			}
			this.events[this.eventIndex].start();
		}
	};

	Cutscene.prototype.start = function() {
		this.eventIndex = 0;
		if (this.events.length > 0) {
			this.state = states.RUNNING;
			this.events[this.eventIndex].start();
		} else {
			this.state = states.FINISHED;
		}
	};

	return Cutscene;

}();