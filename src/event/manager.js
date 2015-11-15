gm.Event.Manager = function() {

	var Manager = function(driver) {
		this._driver = driver;
		this._gameWrapper = new gm.Event.GameWrapper(driver);
		this._queuedEventExecutors = [];
		this._running = false;
	};

	Manager.prototype.queueEvent = function(eventName) {
		if (!this._running) {
			if (!this._driver.requestStartEvents()) return false;
		}
		
		var eventJSON = this._getEventFromName(eventName);
		this._queuedEventExecutors.push(new gm.Event.Executor(eventJSON, this._gameWrapper));
		
		if (!this._running) this._startNextEvent();
		return true;
	};

	Manager.prototype.update = function(delta) {
		if (this._running) {
			if (this._queuedEventExecutors[0].update(delta)) {
				this._queuedEventExecutors.shift();
				this._startNextEvent();
			}
		}
	};

	Manager.prototype._startNextEvent = function() {
		if (this._queuedEventExecutors.length > 0) {
			this._running = true;
			var executor = this._queuedEventExecutors[0];
			executor.start();
		} else {
			this._running = false;
			this._driver.onEventsFinished();
		}
	};

	return Manager;

}();