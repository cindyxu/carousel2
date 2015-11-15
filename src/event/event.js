gm.Event = function() {

	var _EventNode = function(delay, runner) {
		this._delay = delay;
		this._runner = runner;
	};

	var Event = function() {
		this._nodes = [];
		this._nodeMapping = [];
	};
	
	return Event;

};