gm.Ai.WalkerObserver = function() {

	var PlatformUtil = gm.Ai.PlatformUtil;

	var _State = function(targetBody, targetWalker, cameraBody) {
		this._targetBody = targetBody;
		this._targetWalker = targetWalker;
		this._cameraBody = cameraBody;

		this._update();
	};

	_State.update = function() {
		this._x = this._targetBody._x;
		this._y = this._body._y;

		this._walking = this._targetWalker._walking;
		this._jumped = this._targetWalker._jumped;
		this._grounded = (this._body._collisionState.down);
		this._crouching = this._targetWalker._crouching;
	};

	var WalkerObserver = function(targetName, cameraBody, level, platformMap) {

		this._lastJumpX = undefined;
		this._lastJumpY = undefined;
		
		this._lastLandX = undefined;
		this._lastLandY = undefined;

		this._lastSeen = undefined;

		this._lastWalkingDir = undefined;
		this._moving = false;
		this._jumping = false;
		this._crouching = false;

		this._listeners = [];

		if (platformMap) this.onLevelChanged(platformMap);
	};

	WalkerObserver.prototype.onLevelChanged = function(level, platformMap) {
		this._level = level;
		this._platformMap = platformMap;
		
		if (platformMap) {
			this._currentPlatform = PlatformUtil.getPlatformUnderBody(platformMap, this._body);
		} else {
			this._currentPlatform = undefined;
		}
		for (var i = 0; i < this._listeners.length; i++) {
			this._listeners[i].onLevelChanged();
		}
	};

	WalkerObserver.prototype._lookForTarget = function() {
		if (!this._level) {
			return;
		}
		this._entity = this._level.findEntityByName(this._targetName);
	};

	WalkerObserver.prototype.addListener = function(listener) {
		if (this._listeners.indexOf(listener) < 0) {
			this._listeners.push(listener);
		}
	};

	WalkerObserver.prototype.removeListener = function(listener) {
		var i = this._listeners.indexOf(listener);
		if (i >= 0) {
			this._listeners.splice(i, 1);
		}
	};

	WalkerObserver.prototype._observeMove = function(dir) {
		for (var i = 0; i < this._listeners.length; i++) {
			this._listeners[i].onMove(dir);
		}
	};

	WalkerObserver.prototype._observeStop = function() {
		for (var i = 0; i < this._listeners.length; i++) {
			this._listeners[i].onStop();
		}
	};

	WalkerObserver.prototype._observeJump = function() {
		var body = this._body;
		this._lastJumpX = body._x;
		this._lastJumpY = body._y;
		for (var i = 0; i < this._listeners.length; i++) {
			this._listeners[i].onJump();
		}
	};

	WalkerObserver.prototype._observeLand = function() {
		var body = this._body;
		var platformMap = this._platformMap;

		this._lastLandX = body._x;
		this._lastLandY = body._y;
		
		this._currentPlatform = PlatformUtil.getPlatformUnderBody(platformMap, body);

		for (var i = 0; i < this._listeners.length; i++) {
			this._listeners[i].onLand();
		}
	};

	WalkerObserver.prototype._observeCrouch = function() {
		for (var i = 0; i < this._listeners.length; i++) {
			this._listeners[i].onCrouch();
		}	
	};

	WalkerObserver.prototype._observeRise = function() {
		for (var i = 0; i < this._listeners.length; i++) {
			this._listeners[i].onRise();
		}
	};

	WalkerObserver.prototype._onLeaveSight = function() {
		for (var i = 0; i < this._listeners.length; i++) {
			this._listeners[i].onLeaveSight();
		}
	};

	WalkerObserver.prototype._onEnterSight = function() {
		for (var i = 0; i < this._listeners.length; i++) {
			this._listeners[i].onEnterSight();
		}
	};

	WalkerObserver.prototype.preUpdate = function() {
		this._lookForTarget();

		if (this._entity) {
			if (!this.__lastState) {
				this.__lastState = new _State(this._entity._body, 
					this._entity._walker, this._cameraBody);
				this._onEnterSight();
			}

			var walker = this._entity._walker;
			
			if (walker._walking !== this.__lastState._walking) {
				if (walker._walking === undefined) {
					this._observeStop();
				} else {
					this._observeMove(walker._walking);
				}
			}
			if (walker._jumped) {
				this._observeJump();
			}
			if (!this.__lastState._grounded && body._collisionState.down) {
				this._observeLand();
			}

			this.__lastState.update();

		} else if (this.__lastState) {
			this.__lastState = undefined;
			this._onLeaveSight();
		}
	};

	WalkerObserver.prototype.postUpdate = function() {
	};

	return Observer;
}();