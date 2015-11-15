gm.Event.Executor = function() {

	var createEventRunner = function() {
		
	};

	var _EventNodeExecutor = function(nodeJSON, gameWrapper) {
		this._delayLeft = nodeJSON.delay;
		this._runner = createEventRunner(nodeJSON.instruction, gameWrapper);
		
		this._finished = false;
		this._childExecutors = [];
		this._parentsRemaining = 0;
	};

	_EventNodeExecutor._update = function(delta) {
		if (this._finished) return true;

		if (this._delayLeft > 0) {
			this._delayLeft -= delta;
			if (this._delayLeft <= 0) {
				this._runner.start();
			}
		}
		if (this._delayLeft <= 0) {
			if (this._runner.run()) {
				this._finished = true;
			}
		}

		return this._finished;
	};

	_EventNodeExecutor._addParentExecutor = function(parentExecutor) {
		this._parentsRemaining++;
	};

	_EventNodeExecutor._addChildExecutor = function(childExecutor) {
		this._childExecutors.push(child);
	};

	var EventExecutor = function(eventJSON, gameWrapper) {
		this._nodeExecutors = [];
		this._currentNodeExecutors = [];
		var i;

		for (i = 0; i < eventJSON.nodes.length; i++) {
			this._nodeExecutors.push(new _EventNodeExecutor(eventJSON.nodes[i], gameWrapper));
		}
		
		for (i = 0; i < eventJSON.nodeMapping.length; i++) {
			var mapping = eventJSON.nodeMapping[i];
			for (var j = 0; j < mapping.length; j++) {
				this._nodeExecutors[i]._addParentExecutor(this._nodeExecutors[j]);
				this._nodeExecutors[j]._addChildExecutor(this._nodeExecutors[i]);
			}
		}
	};

	EventExecutor.prototype.update = function(delta) {
		var finishedExecutors = [];
		var i;
		
		for (i = 0; i < this._currentNodeExecutors.length; i++) {
			var nodeExecutor = this._currentNodeExecutors[i];
			if (nodeExecutor.update(delta)) {
				finishedExecutors.push(nodeExecutor);
			}
		}
		
		for (i = 0; i < finishedExecutors.length; i++) {
			this._onNodeExecutionFinished(finishedExecutors[i]);
		}

		return (this._currentNodeExecutors.length === 0);
	};

	EventExecutor.prototype._onNodeExecutionFinished = function(nodeExecutor) {
		this._currentNodeExecutors.splice(this._currentNodeExecutors.indexOf(nodeExecutor), 1);
		
		var mapping = this._event.nodeMapping[nodeExecutor._node._tag];
		for (var j = 0; j < mapping.length; j++) {
			var childExecutor = this._nodeExecutors[mapping[j]];
			if (childExecutor.onParentFinished(nodeExecutor)) {
				this._currentNodeExecutors.push(childExecutor);
			}
		}
	};

	return EventExecutor;
}();