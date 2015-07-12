gm.Ai.Observer = function() {

	var PlatformUtil = gm.Ai.PlatformUtil;

	var _State = function(body, controller) {
		this._body = body;
		this._controller = controller;
		this._update();
	};

	_State.update = function() {
		this._x = this._body._x;
		this._y = this._body._y;

		this._walking = this._controller._walking;
		this._jumped = this._controller._jumped;
		this._grounded = (this._body._collisionState.down);
		this._crouching = this._controller._crouching;
	};

	var Observer = function(platformMap, body, controller) {

		this.__lastState = new _State(body, controller);

		this._lastJumpX = undefined;
		this._lastJumpY = undefined;
		
		this._lastLandX = body._x;
		this._lastLandY = body._y;

		this._lastWalkingDir = undefined;
		this._moving = false;
		this._jumping = false;
		this._crouching = false;

		this._platformMap = platformMap;

		this._currentPlatform = PlatformUtil.getPlatformUnderBody(this._platformMap, this._body);

		this._listeners = [];
	};

	Observer.prototype.addListener = function(listener) {
		if (this._listeners.indexOf(listener) < 0) {
			this._listeners.push(listener);
		}
	};

	Observer.prototype.removeListener = function(listener) {
		var i = this._listeners.indexOf(listener);
		if (i >= 0) {
			this._listeners.splice(i, 1);
		}
	};

	Observer.prototype._observeMove = function(dir) {
		for (var i = 0; i < this._listeners.length; i++) {
			this._listeners[i].onMove(dir);
		}
	};

	Observer.prototype._observeStop = function() {
		for (var i = 0; i < this._listeners.length; i++) {
			this._listeners[i].onStop();
		}
	};

	Observer.prototype._observeJump = function() {
		var body = this._body;
		this._lastJumpX = body._x;
		this._lastJumpY = body._y;
		for (var i = 0; i < this._listeners.length; i++) {
			this._listeners[i].onJump();
		}
	};

	Observer.prototype._observeLand = function() {
		var body = this._body;
		this._lastLandX = body._x;
		this._lastLandY = body._y;
		this._currentPlatform = PlatformUtil.getPlatformUnderBody(this._platformMap, body);
		for (var i = 0; i < this._listeners.length; i++) {
			this._listeners[i].onLand();
		}
	};

	Observer.prototype._observeCrouch = function() {
		for (var i = 0; i < this._listeners.length; i++) {
			this._listeners[i].onCrouch();
		}	
	};

	Observer.prototype._observeRise = function() {
		for (var i = 0; i < this._listeners.length; i++) {
			this._listeners[i].onRise();
		}
	};

	Observer.prototype.preUpdate = function() {
		var walker = this._walker;
		var body = this._body;

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
	};

	Observer.prototype.postUpdate = function() {
	};

	return Observer;
}();