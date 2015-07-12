gm.Ai.Agent = function() {
	
	var Agent = function(level, walker, body, combinedMap) {
		this._walker = walker;
		this._body = body;
		this._combinedMap = combinedMap;

		this._kinematics = this._createKinematicsFromWalker(level, this._walker, this._body);

		this._platformMap = new gm.Ai.PlatformMap(this._body, this._kinematics, this._combinedMap);
		this._observedPlatformMap = new gm.Ai.ObservedPlatformMap(this._platformMap, this._body);
		
		this._playerIntent = new gm.Ai.Intent(this._observer);
	};

	Agent._createKinematicsFromWalker = function(level, walker, body) {
		return new gm.Ai.Kinematics({
			walkSpd: body._maxVelX,
			jumpSpd: walker._jumpImpulse,
			fallAccel: body._weight * level._gravity,
			terminalV: body._maxVelY
		});
	};

	Agent._onLevelChanged = function() {
		
	};

	Agent.preUpdate = function() {
		this._observer.preUpdate();
	};

	Agent.postUpdate = function() {

	};

}();