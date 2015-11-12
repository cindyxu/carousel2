gm.Driver = function() {

	// loading screen?
	// title screen?

	// changeLevelRequested()
	// startCutscene() <- can span across levels

	// so cutsceneManager? portalManager? can all hook into here

	var Driver = {};

	Driver.State = {
		GAME: 0,
		LOADING: 1,
		TITLE: 2,
		DEAD: 3
	};

	Driver.init = function(callback) {
		this._game = new gm.Game();
		this._game.init();

		this._levelQueue = [];
		this._listeners = [];

		gm.SaveFile.loadFromFile(this, "save", function(level) {
			if (!level) {
				if (LOGGING) console.log("WARNING - no save file found - defaulting to new level");
				var defaultLevel = new gm.Level();
				Driver._game.addLevel(defaultLevel);
				Driver._game.setActiveLevel(defaultLevel);
			}
			if (callback) callback();
		});
	};

	Driver.update = function() {
		this._game.update();
	};

	Driver.render = function(ctx) {
		this._game.render(ctx);
	};

	Driver.requestEnterLevel = function(levelName, callback) {
		var queueStarted = (this._levelQueue.length > 0);
		
		this._levelQueue.push(function() {
			var level = Driver._game.findLevelByName(levelName);
			
			if (level) {
				Driver._onLevelLoaded(level, callback);

			} else {
				var wasPlaying = Driver._game._playing;
				Driver._game.pause();
			
				// todo: make a loading screen
				this._state = Driver.State.LOADING;
			
				gm.Store.Level.fromJSON(levelName, function(level) {
					if (LOGGING) console.log("finished loading " + level._name);
					Driver._game.addLevel(level);
					if (wasPlaying) Driver._game.play();
					Driver._onLevelLoaded(level, callback);
				});
			}
		});

		if (!queueStarted) Driver._loadNextLevelInQueue();
	};

	Driver._onLevelLoaded = function(level, callback) {
		Driver._game.setActiveLevel(level);
		this._state = Driver.State.GAME;

		if (callback) callback(level);
		Driver._loadNextLevelInQueue();
	};

	Driver._loadNextLevelInQueue = function(levelName, callback) {
		if (this._levelQueue.length > 0) {
			var levelLoad = this._levelQueue.shift();
			levelLoad();
		}
	};

	Driver.addListener = function(listener) {
		if (this._listeners.indexOf(listener) < 0) {
			this._listeners.push(listener);
		}
	};

	Driver.removeListener = function(listener) {
		var i = this._listeners.indexOf(listener);
		if (i >= 0) this._listeners.splice(i, 1);
	};

	return Driver;

}();