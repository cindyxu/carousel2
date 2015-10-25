gm.Ai.Walker.LevelInfo = function() {
	var WalkerLevelInfo = function(level, walker, body) {

		if (LOGGING) {
			if (!level) console.log("!!! WalkerLevelInfo - level was undefined");
			if (!walker) console.log("!!! WalkerLevelInfo - walker was undefined");
			if (!body) console.log("!!! WalkerLevelInfo - body was undefined");
		}

		var kinematics = WalkerLevelInfo._createKinematicsFromWalker(level, walker, body);
		var platformMap = new gm.Ai.Walker.PlatformMap(body, kinematics, level._combinedMap);
		var reachable = gm.Ai.Walker.PlatformScan.Scanner.scanPlatforms(level._combinedMap, 
			platformMap, body, kinematics);

		this._level = level;
		this._kinematics = kinematics;
		this._platformMap = platformMap;
		this._reachable = reachable;
	};

	WalkerLevelInfo.prototype.preUpdate = function() {
	};

	WalkerLevelInfo._createKinematicsFromWalker = function(level, walker, body) {
		return new gm.Ai.Walker.Kinematics({
			walkSpd: body._maxVelX,
			jumpSpd: walker._jumpImpulse * body._weight,
			fallAccel: body._weight * level._gravity,
			terminalV: body._maxVelY
		});
	};

	return WalkerLevelInfo;

}();