gm.Event.Runners.Portal = function() {

	var Status = {
		ANIMATING_LEAVING : 0,
		REQUESTING_LEVEL : 1,
		ANIMATING_ENTERING : 2,
		FINISHED : 3
	};

	var DialogueRunner = function(eventWrapper, params) {
		this._eventWrapper = eventWrapper;
		this._setParams(params);
		this._status = Status.ANIMATING_LEAVING;
	};

	DialogueRunner.prototype._setParams = function(params) {
		this._fromPortalName = params.fromPortalName;
		this._toPortalName = params.toPortalName;
	};

	DialogueRunner.prototype.start = function() {
		this._status = false;
		this._eventWrapper.overrideEntitySpriteMapper(this._fromPortalName);
	};

	DialogueRunner.prototype.update = function() {
		return this._status === Status.FINISHED;
	};

	DialogueRunner.prototype.onDialogueFinished = function() {
		this._status = true;
	};

}();