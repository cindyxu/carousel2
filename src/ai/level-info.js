gm.Ai.LevelInfo = function() {
	var LevelInfo = function(level, walker, body, camera) {

		if (LOGGING) {
			if (!level) console.log("!!! levelInfo - level was undefined");
			if (!walker) console.log("!!! levelInfo - walker was undefined");
			if (!body) console.log("!!! levelInfo - body was undefined");
		}

		var kinematics = LevelInfo._createKinematicsFromWalker(level, walker, body);
		var platformMap = new gm.Ai.PlatformMap(body, kinematics, level._combinedMap);
		var reachable = gm.Ai.PlatformScanner.scanPlatforms(level._combinedMap, 
			platformMap, body, kinematics);

		this._level = level;
		this._kinematics = kinematics;
		this._platformMap = platformMap;
		this._reachable = reachable;
	};

	LevelInfo.prototype.preUpdate = function() {
	};

	LevelInfo._createKinematicsFromWalker = function(level, walker, body) {
		return new gm.Ai.Kinematics({
			walkSpd: body._maxVelX,
			jumpSpd: walker._jumpImpulse * body._weight,
			fallAccel: body._weight * level._gravity,
			terminalV: body._maxVelY
		});
	};

	return LevelInfo;

}();