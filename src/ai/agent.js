gm.Ai.Agent = function() {
	
	var Agent = function(entity, camera) {
		this._game = undefined;

		this._entity = entity;
		
		this._playerObserver = new gm.Ai.WalkerObserver("player", camera._body);
		this._playerIntent = new gm.Ai.PlayerIntent(this._playerObserver);
	};

	Agent.initWithGame = function(game) {
		if (LOGGING) {
			console.log("agent - initialize with game", level);
		}
		this._game = game;
		game.addListener(this);
		this.initWithLevel(game.getEntityLevel(entity));
	};

	Agent.initWithLevel = Agent.onLevelChanged = function(level) {
		if (LOGGING) {
			console.log("agent - level changed", level);
		}
		if (level) {
			var walker = this._entity._walker;
			var body = this._entity._body;

			this._kinematics = this._createKinematicsFromWalker(level, walker, body);
			this._platformMap = new gm.Ai.PlatformMap(body, this._kinematics, level._combinedMap);
			this._reachable = gm.Ai.PlatformScanner.scanPlatforms(level._combinedMap, 
				this._platformMap, body, this._kinematics);

			this._observedPlatformMap = new gm.Ai.ObservedPlatformMap(this._platformMap, body);
			this._observedReachable = gm.Ai.Reachable.newInstance();
			this.__reachableObserver = new gm.Ai.ReachableObserver(this._observedPlatformMap, 
				this._reachable, this._observedReachable);

		} else {
			this._reachable = undefined;
			this._observedPlatformMap = undefined;
			this._observedReachable = undefined;
			this.__reachableObserver = undefined;
		}

		this._playerObserver.onLevelChanged(level, this._observedPlatformMap);
	};

	Agent._createKinematicsFromWalker = function(level, walker, body) {
		return new gm.Ai.Kinematics({
			walkSpd: body._maxVelX,
			jumpSpd: walker._jumpImpulse,
			fallAccel: body._weight * level._gravity,
			terminalV: body._maxVelY
		});
	};

	// entered new level
	Agent.onEntityAddedToLevel = function(entity, level) {
		if (entity === this._entity) {
			this._onLevelChanged(level);
		}
	};

	// left level
	Agent.onEntityRemovedFromLevel = function(entity, level) {
		if (entity === this._entity) {
			this._onLevelChanged();
		}
	};

	Agent.preUpdate = function() {
		this._observer.preUpdate();
	};

	Agent.postUpdate = function() {

	};

	return Agent;

}();