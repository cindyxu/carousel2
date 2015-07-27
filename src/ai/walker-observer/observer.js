gm.Ai.WalkerObserver = function() {

	var PlatformUtil = gm.Ai.PlatformUtil;

	var _State = function(targetBody, targetWalker) {

		if (LOGGING) {
			if (!targetBody) {
				console.log("walkerObserver - state targetBody was undefined");
			} if (!targetWalker) {
				console.log("walkerObserver - state targetWalker was undefined");
			} if (!cameraBody) {
				console.log("walkerObserver - state cameraBody was undefined");
			}
		}

		this._targetBody = targetBody;
		this._targetWalker = targetWalker;

		this._update();
	};

	_State.update = function() {
		this._x = this._targetBody._x;
		this._y = this._body._y;

		this._walking = this._targetWalker._walking;
		this._jumped = this._targetWalker._jumped;
		this._grounded = this._body._collisionState.down;
		this._crouching = this._targetWalker._crouching;
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

		this._currentPlatform = undefined;

		this._lastJumpX = undefined;
		this._lastJumpY = undefined;
		
		this._lastLandX = undefined;
		this._lastLandY = undefined;

		this._lastSeen = undefined;

		this._lastWalkingDir = undefined;
		this._moving = false;
		this._jumping = false;
		this._crouching = false;

		this._portalObserver = new gm.Ai.WalkerObserver.PortalObserver(this);

		this._listeners = [];

		if (levelInfo) this.onInitWithLevel(levelInfo);
	};

	WalkerObserver.prototype.onInitWithLevel = function(levelInfo) {
		this._levelInfo = levelInfo;
		this.__lastState = undefined;
	};

	WalkerObserver.prototype._lookForTarget = function() {
		if (!this._levelInfo) {
			return;
		}
		var entity = this._levelInfo._level.findEntityByName(this._targetName);
		if (entity && entity._body._overlaps(this._cameraBody)) {
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

	WalkerObserver.prototype._observeMove = function(dir) {
		for (var i = 0; i < this._listeners.length; i++) {
			if (this._listeners[i].onMove) {
				this._listeners[i].onMove(dir);
			}
		}
	};

	WalkerObserver.prototype._observeStop = function() {
		for (var i = 0; i < this._listeners.length; i++) {
			if (this._listeners[i].onStop) {
				this._listeners[i].onStop();
			}
		}
	};

	WalkerObserver.prototype._observeJump = function() {
		var body = this._body;
		this._lastJumpX = body._x;
		this._lastJumpY = body._y;
		for (var i = 0; i < this._listeners.length; i++) {
			if (this._listeners[i].onJump) {
				this._listeners[i].onJump();
			}
		}
	};

	WalkerObserver.prototype._observeLand = function() {
		var body = this._body;
		var platformMap = this._levelInfo._platformMap;

		this._lastLandX = body._x;
		this._lastLandY = body._y;
		
		this._currentPlatform = PlatformUtil.getPlatformUnderBody(platformMap, body);

		for (var i = 0; i < this._listeners.length; i++) {
			if (this._listeners[i].onLand) {
				this._listeners[i].onLand();
			}
		}
	};

	WalkerObserver.prototype._observeCrouch = function() {
		for (var i = 0; i < this._listeners.length; i++) {
			if (this._listeners[i].onCrouch) {
				this._listeners[i].onCrouch();
			}
		}	
	};

	WalkerObserver.prototype._observeRise = function() {
		for (var i = 0; i < this._listeners.length; i++) {
			if (this._listeners[i].onRise) {
				this._listeners[i].onRise();
			}
		}
	};

	WalkerObserver.prototype._onLeaveSight = function() {
		this._portalObserver.stopListening();
		for (var i = 0; i < this._listeners.length; i++) {
			if (this._listeners[i].onLeaveSight) {
				this._listeners[i].onLeaveSight();
			}
		}
	};

	WalkerObserver.prototype._onEnterSight = function(entity) {
		this._portalObserver.startListening(entity);
		for (var i = 0; i < this._listeners.length; i++) {
			if (this._listeners[i].onEnterSight) {
				this._listeners[i].onEnterSight();
			}
		}
	};

	WalkerObserver.prototype._onEnterPortal = function(toLevel) {
		for (var i = 0; i < this._listeners.length; i++) {
			if (this._listeners[i].onEnterPortal) {
				this._listeners[i].onEnterPortal();
			}
		}	
	};

	WalkerObserver.prototype.preUpdate = function() {
		var entity = this._lookForTarget();

		if (entity) {
			if (!this.__lastState) {
				this.__lastState = new _State(entity._body, 
					entity._controller._behavior);
				this._onEnterSight(entity);
			}

			var walker = entity._controller._behavior;
			
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

	return WalkerObserver;
}();