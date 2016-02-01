gm.Event.Runners.Portal = function() {

	var PortalRunner = function(gameWrapper, params) {
		this._gameWrapper = gameWrapper;
		this._setParams(params);
		this._finished = false;
	};

	PortalRunner.prototype._setParams = function(params) {
		this._fromPortalName = params.fromPortalName;
		this._toLevelName = params.toLevelName;
		this._toPortalName = params.toPortalName;
	};

	var bbox;
	PortalRunner.prototype.start = function() {
		this._status = false;
		this._gameWrapper.goToLevel(this._toLevelName, this._targetEntityNames, function() {
			for (var i = 0; i < this._targetEntityNames.length; i++) {
				this._gameWrapper.moveEntityToEntity(this._targetEntityNames[i], this._toPortalName);
			}
		});
	};

	PortalRunner.prototype.update = function() {
		return this._finished;
	};

}();