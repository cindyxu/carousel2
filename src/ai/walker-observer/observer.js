gm.Ai.WalkerObserver = function() {

	var PlatformUtil = gm.Ai.PlatformUtil;

	var _State = function() {
		this._resetState();
	};

	_State.prototype._resetState = function() {
		this._body = undefined;
		this._walker = undefined;

		this._x = undefined;
		this._y = undefined;

		this._walking = undefined;
		this._facing = undefined;
		this._jumped = undefined;
		this._grounded = undefined;
		this._crouching = undefined;
	};

	_State.prototype._updateState = function(body, walker) {
		this._body = body;
		this._walker = walker;

		if (body && walker) {
			this._x = this._body._x;
			this._y = this._body._y;

			this._walking = this._walker._walking;
			this._facing = this._walker._facing;
			this._jumped = this._walker._jumped;
			this._grounded = this._body._collisionState.down;
			this._crouching = this._walker._crouching;
		} else {
			this._resetState();
		}
	};

	var WalkerObserver = function(targetName, cameraBody, levelInfo) {

		if (LOGGING) {
			if (!targetName) {
				console.log("walkerObserver - targetName was undefined");
			} if (!cameraBody) {
				console.log("walkerObserver - cameraBody was undefined");
			}
		}

		this._targetName = targetName;
		this._cameraBody = cameraBody;

		this._levelInfo = undefined;
		this._body = undefined;
		this._walker = undefined;

		this._currentPlatform = undefined;
		this._lastJumpX = undefined;
		this._lastJumpY = undefined;
		this._lastLandX = undefined;
		this._lastLandY = undefined;
		this._lastSeen = undefined;

		this._portalObserver = new gm.Ai.WalkerObserver.PortalObserver(this);

		this._listeners = [];

		this.__lastState = undefined;
		_State.apply(this);

		if (levelInfo) this.onInitWithLevel(levelInfo);
	};

	WalkerObserver.prototype = Object.create(_State.prototype);

	WalkerObserver.prototype.onInitWithLevel = function(levelInfo) {
		this._levelInfo = levelInfo;
		this.__lastState = undefined;
	};

	WalkerObserver.prototype._lookForTarget = function() {
		if (!this._levelInfo) {
			return;
		}
		var entity = this._levelInfo._level.findEntityByName(this._targetName);
		if (entity && entity._body.overlaps(this._cameraBody)) {
			return entity;
		}
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

	WalkerObserver.prototype._observeMove = function() {
		if (LOGGING) console.log("walkerObserver - move");
		for (var i = 0; i < this._listeners.length; i++) {
			if (this._listeners[i].onMove) {
				this._listeners[i].onMove();
			}
		}
	};

	WalkerObserver.prototype._observeStop = function() {
		if (LOGGING) console.log("walkerObserver - stop");
		for (var i = 0; i < this._listeners.length; i++) {
			if (this._listeners[i].onStop) {
				this._listeners[i].onStop();
			}
		}
	};

	WalkerObserver.prototype._observeJump = function() {
		if (LOGGING) console.log("walkerObserver - jump");
		this._lastJumpX = this._body._x;
		this._lastJumpY = this._body._y;
		for (var i = 0; i < this._listeners.length; i++) {
			if (this._listeners[i].onJump) {
				this._listeners[i].onJump();
			}
		}
	};

	WalkerObserver.prototype._observeLand = function() {
		if (LOGGING) console.log("walkerObserver - land");
		var platformMap = this._levelInfo._platformMap;

		this._lastLandX = this._body._x;
		this._lastLandY = this._body._y;
		
		this._currentPlatform = PlatformUtil.getPlatformUnderBody(platformMap, this._body);

		for (var i = 0; i < this._listeners.length; i++) {
			if (this._listeners[i].onLand) {
				this._listeners[i].onLand();
			}
		}
	};

	WalkerObserver.prototype._observeCrouch = function() {
		if (LOGGING) console.log("walkerObserver - crouch");
		for (var i = 0; i < this._listeners.length; i++) {
			if (this._listeners[i].onCrouch) {
				this._listeners[i].onCrouch();
			}
		}	
	};

	WalkerObserver.prototype._observeRise = function() {
		if (LOGGING) console.log("walkerObserver - rise");
		for (var i = 0; i < this._listeners.length; i++) {
			if (this._listeners[i].onRise) {
				this._listeners[i].onRise();
			}
		}
	};

	WalkerObserver.prototype._onLeaveSight = function() {
		if (LOGGING) console.log("walkerObserver - leave sight");
		this._portalObserver.stopListening();
		for (var i = 0; i < this._listeners.length; i++) {
			if (this._listeners[i].onLeaveSight) {
				this._listeners[i].onLeaveSight();
			}
		}
	};

	WalkerObserver.prototype._onEnterSight = function(entity) {
		if (LOGGING) console.log("walkerObserver - enter sight");
		this._portalObserver.startListening(entity);
		for (var i = 0; i < this._listeners.length; i++) {
			if (this._listeners[i].onEnterSight) {
				this._listeners[i].onEnterSight();
			}
		}
	};

	WalkerObserver.prototype._onEnterPortal = function(toLevel) {
		if (LOGGING) console.log("walkerObserver - enter portal");
		for (var i = 0; i < this._listeners.length; i++) {
			if (this._listeners[i].onEnterPortal) {
				this._listeners[i].onEnterPortal();
			}
		}	
	};

	WalkerObserver.prototype.preUpdate = function() {
		var entity = this._lookForTarget();

		if (entity) {
			var body = entity._body;
			var walker = entity._controller._behavior;
			
			this._updateState(body, walker);

			if (!this.__lastState) {
				this.__lastState = new _State();
				this.__lastState._updateState(body, walker);
				this._onEnterSight(entity);
			}

			if (this._walking !== this.__lastState._walking) {
				if (this._walking === undefined) {
					this._observeStop();
				} else {
					this._observeMove();
				}
			}
			if (this._jumped) {
				this._observeJump();
			}
			if (!this.__lastState._grounded && this._grounded) {
				this._observeLand();
			}

			this.__lastState._updateState(body, walker);

		} else {
			this._resetState();
			if (this.__lastState) {
				this.__lastState = undefined;
				this._onLeaveSight();
			}
		}
	};

	WalkerObserver.prototype.postUpdate = function() {
	};

	return WalkerObserver;
}();