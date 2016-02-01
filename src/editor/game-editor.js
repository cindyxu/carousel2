gm.Editor.GameEditor = function() {

	var GameEditor = function() {
		this._layer = undefined;
		this._entity = undefined;
		this._listeners = [];

		this._renderer = new gm.Editor.Renderer(this);
		this._toolbox = new gm.Editor.Toolbox(this);
	};

	GameEditor.prototype.addNewLayer = function(params, callback) {
		var level = this._level;
		var editor = this;
		var layer = level.addNewLayer(params, function(layer) {
			if (callback) callback(layer);
		});
		return layer;
	};

	GameEditor.prototype.updateLayer = function(layer, params, callback) {
		var level = this._level;
		var editor = this;
		level.updateLayer(layer, params, function() {
			// force refresh
			level.resolveLevelChange();
			if (callback) callback(true);
		});
		for (var i = 0; i < this._listeners.length; i++) {
			if (this._listeners[i].onLayerParamsChanged) {
				this._listeners[i].onLayerParamsChanged(layer);
			}
		}
		return true;
	};

	GameEditor.prototype.selectLayer = function(layer) {
		this._layer = layer;
		for (var i = 0; i < this._listeners.length; i++) {
			if (this._listeners[i].onLayerSelected) {
				this._listeners[i].onLayerSelected(layer);
			}
		}
	};

	GameEditor.prototype.selectEntity = function(entity) {
		this._entity = entity;
		for (var i = 0; i < this._listeners.length; i++) {
			if (this._listeners[i].onEntitySelected) {
				this._listeners[i].onEntitySelected(entity);
			}
		}
	};

	GameEditor.prototype.addNewEntity = function(className, name, callback) {
		var level = this._level;
		var layer = this._layer;
		
		if (!layer) {
			if (callback) callback(); 
			return;
		}
		var editor = this;
		var entity = gm.Driver._game.addNewEntity(className, name, level, layer, function(entity) {
			if (!entity) {
				if (callback) callback(); 
				return;
			}
			if (callback) callback(entity);
		});
		return entity;
	};

	GameEditor.prototype.playGame = function() {
		gm.Driver._game.play();
	};

	GameEditor.prototype.pauseGame = function() {
		gm.Driver._game.pause();
	};

	GameEditor.prototype.loadLevel = function(levelName, callback) {
		gm.Driver.requestEnterLevel(levelName, callback);
	};

	GameEditor.prototype.update = function() {

		if (gm.Driver._game._playing) {
			if (gm.Input.pressed[gm.Settings.Editor.keyBinds.TOGGLE_PLAY]) {
				this.pauseGame();
			}
			else return;
		
		} else {
			if (gm.Input.pressed[gm.Settings.Editor.keyBinds.TOGGLE_PLAY]) {
				this.playGame();
				return;
			}
		}

		if (this._layer) {
			this._toolbox.action(gm.Driver._game._camera);
		}
	};

	var bbox = {};
	GameEditor.prototype.render = function(ctx) {
		// if (gm.Driver._game._playing) return;

		var camera = gm.Driver._game._camera;
		camera._body.getBbox(bbox);

		this._renderer.render(ctx, bbox);
		this._toolbox.render(ctx, camera);
	};

	GameEditor.prototype.init = function() {
		var editor = this;

		this._levelListener = {
			
			onLayerAdded: function(level, layer) {
				editor._onLayerAdded(layer);
			},

			onLayerChanged: function(level, layer) {
				editor._onLayerChanged(layer);
			},

			onLayerRemoved: function(level, layer) {
				editor._onLayerRemoved(layer);
			}
		};
		
		this._gameListener = {
			
			onLevelAddedToGame: function(level) {
			},
			
			onEntityAddedToLevel: function(entity, level, layer) {
				if (level === editor._level) {
					editor._onEntityAdded(entity);
				}
			},
			
			onEntityRemovedFromLevel: function(entity, level, layer) {
				if (level === editor._level) {
					editor._onEntityRemoved(entity);
				}
			},

			onActiveLevelChanged: function(level) {
				editor._onActiveLevelChanged(level);
			}
		};

		gm.Driver._game.addListener(this._gameListener);
		this._onActiveLevelChanged(gm.Driver._game._activeLevel);
	};

	GameEditor.prototype._onActiveLevelChanged = function(level) {
		this.selectLayer(undefined);
		this.selectEntity(undefined);

		if (this._level) this._level.removeListener(this._levelListener);
		this._level = level;
		this._level.addListener(this._levelListener);

		for (var i = 0; i < this._listeners.length; i++) {
			if (this._listeners[i].onActiveLevelChanged) {
				this._listeners[i].onActiveLevelChanged(level);
			}
		}
	};

	GameEditor.prototype._onLayerAdded = function(layer) {
		for (var i = 0; i < this._listeners.length; i++) {
			if (this._listeners[i].onLayerAdded) {
				this._listeners[i].onLayerAdded(layer);
			}
		}
	};

	GameEditor.prototype._onLayerChanged = function(layer) {
		for (var i = 0; i < this._listeners.length; i++) {
			if (this._listeners[i].onLayerChanged) {
				this._listeners[i].onLayerChanged(layer);
			}
		}
	};

	GameEditor.prototype._onEntityAdded = function(entity) {
		for (var i = 0; i < this._listeners.length; i++) {
			if (this._listeners[i].onEntityAdded) {
				this._listeners[i].onEntityAdded(entity);
			}
		}
	};

	GameEditor.prototype._onEntityChanged = function(entity) {
		for (var i = 0; i < this._listeners.length; i++) {
			if (this._listeners[i].onEntityChanged) {
				this._listeners[i].onEntityChanged(entity);
			}
		}
	};

	GameEditor.prototype._onEntityRemoved = function(entity) {
		if (entity === editor._entity) {
			editor.selectEntity(undefined);
		}
		for (var i = 0; i < this._listeners.length; i++) {
			if (this._listeners[i].onEntityRemoved) {
				this._listeners[i].onEntityRemoved(entity);
			}
		}
	};

	GameEditor.prototype.addListener = function(listener) {
		if (this._listeners.indexOf(listener) < 0) {
			this._listeners.push(listener);
		}
	};

	return new GameEditor();

}();