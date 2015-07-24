gm.Ai.LevelInfo = function() {
	var LevelInfo = function(level, walker, body) {

		if (LOGGING) {
			if (!level) console.log("!!! levelInfo - level was undefined");
			if (!walker) console.log("!!! levelInfo - walker was undefined");
			if (!body) console.log("!!! levelInfo - body was undefined");
		}

		var kinematics = LevelInfo._createKinematicsFromWalker(level, walker, body);
		var platformMap = new gm.Ai.PlatformMap(body, kinematics, level._combinedMap);
		var reachable = gm.Ai.PlatformScanner.scanPlatforms(level._combinedMap, 
			platformMap, body, kinematics);

		var observedPlatformMap = new gm.Ai.ObservedPlatformMap(platformMap, body);
		var observedReachable = gm.Ai.Reachable.newInstance();

		var reachableObserver = new gm.Ai.ReachableObserver(observedPlatformMap, 
			reachable, observedReachable);

		this._level = level;
		this._kinematics = kinematics;
		this._platformMap = platformMap;
		this._reachable = reachable;
		this._observedPlatformMap = observedPlatformMap;
		this._observedReachable = observedReachable;
	};

	LevelInfo._createKinematicsFromWalker = function(level, walker, body) {
		return new gm.Ai.Kinematics({
			walkSpd: body._maxVelX,
			jumpSpd: walker._jumpImpulse,
			fallAccel: body._weight * level._gravity,
			terminalV: body._maxVelY
		});
	};

	return LevelInfo;

}();