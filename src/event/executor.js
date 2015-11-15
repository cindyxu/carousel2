gm.Event.Executor = function() {

	var EventExecutor = function(event) {
		this._nodeExecutors = [];
		this._currentNodeExecutors = [];
		var i;

		for (i = 0; i < event._nodes.length; i++) {
			this._nodeExecutors.push(new _EventNodeExecutor(event._nodes[i]));
		}
		
		for (i = 0; i < event._nodeMapping.length; i++) {
			var mapping = event._nodeMapping[i];
			for (var j = 0; j < mapping.length; j++) {
				this._nodeExecutors[i]._addParentExecutor(this._nodeExecutors[j]);
				this._nodeExecutors[j]._addChildExecutor(this._nodeExecutors[i]);
			}
		}
	};

	var _EventNodeExecutor = function(node) {
		this._node = node;
		this._delayLeft = this._node._delay;
		this._finished = false;
		this._childExecutors = [];
		this._parentsRemaining = 0;
	};

	_EventNodeExecutor._update = function(delta) {
		if (this._finished) return true;

		if (this._delayLeft > 0) {
			this._delayLeft -= delta;
			if (this._delayLeft <= 0) {
				this._node._runner.start();
			}
		}
		if (this._delayLeft <= 0) {
			if (this._node._runner.run()) {
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
		
		var mapping = this._event._nodeMapping[nodeExecutor._node._tag];
		for (var j = 0; j < mapping.length; j++) {
			var childExecutor = this._nodeExecutors[mapping[j]];
			if (childExecutor.onParentFinished(nodeExecutor)) {
				this._currentNodeExecutors.push(childExecutor);
			}
		}
	};

	return EventExecutor;
};