gm.Editor.Toolbox = function() {

	var keyBinds = gm.Settings.Editor.keyBinds;

	var Toolbox = function(editor) {

		this._toolWrappers = [];

		///////////////////////////////////////////////

		var Brush = gm.Editor.Tools.Brush;

		var layerBrushes = {};
		var activeBrush;

		var brushWrapper = {
			onLayerSelected : function(layer) {
				if (layer) {
					activeBrush = layerBrushes[layer._tag];
					if (!activeBrush) {
						activeBrush = layerBrushes[layer._tag] = new Brush(layer);
					}
				} else activeBrush = undefined;
			},
			shouldSwitchIn: function() {
				return gm.Input.pressed[keyBinds.BRUSH];
			},
			onLayerChanged: function(layer) {
				var brush = layerBrushes[layer._tag];
				if (!brush) {
					brush = layerBrushes[layer._tag] = new Brush(layer);
				} else {
					brush.build(layer);
				}
			},
			switchIn: function() {
				if (LOGGING) console.log("active tool: brush");
			},
			switchOut: function() {
			},
			action: function(camera) {
				activeBrush.onMouseMove(gm.Input.mouseX, gm.Input.mouseY);
				if (gm.Input.mousedown) activeBrush.paint(camera);
			},
			render: function(ctx, camera) {
				activeBrush.render(ctx, camera);
			},
			getSelection: function(selectTileset, layer, tb) {
				var brush = layerBrushes[layer._tag];
				if (!brush) {
					brush = layerBrushes[layer._tag] = new Brush(layer);
				}
				selectTileset.copyToBrush(brush, tb);
			}
		};

		this._toolWrappers.push(brushWrapper);

		///////////////////////////////////////////////

		var Erase = gm.Editor.Tools.Erase;

		var layerErasers = {};
		var activeErase;

		var eraseWrapper = {
			onLayerSelected: function(layer) {
				if (layer) {
					activeErase = layerErasers[layer._tag];
					if (!activeErase) {
						activeErase = layerErasers[layer._tag] = new Erase(layer);
					}
				} else activeErase = undefined;
			},
			shouldSwitchIn: function() {
				return gm.Input.pressed[keyBinds.ERASE];
			},
			onLayerChanged: function(layer) {
				var erase = layerErasers[layer._tag];
				if (!erase) {
					erase = layerErasers[layer._tag] = new Erase(layer);
				} else {
					erase.build(layer);
				}
			},
			switchIn: function() {
				if (LOGGING) console.log("active tool: erase");
			},
			switchOut: function() {
			},
			action: function(camera) {
				activeErase.onMouseMove(gm.Input.mouseX, gm.Input.mouseY);
				if (gm.Input.mousedown) activeErase.paint(camera);
			},
			render: function(ctx, camera) {
				activeErase.render(ctx, camera);
			}
		};

		this._toolWrappers.push(eraseWrapper);

		///////////////////////////////////////////////

		var SelectTileset = gm.Editor.Tools.SelectTileset;

		var selectTilesets = {};
		var activeSelectTileset;

		var selectTilesetWrapper = {
			onLayerSelected: function(layer) {
				if (layer) {
					activeSelectTileset = selectTilesets[layer._tag];
					if (!activeSelectTileset) {
						activeSelectTileset = selectTilesets[layer._tag] = new SelectTileset(layer);
					}
				} else activeSelectTileset = undefined;
			},
			shouldSwitchIn: function() {
				return gm.Input.pressed[keyBinds.SELECT_TILESET];
			},
			shouldSwitchOut: function() {
				return gm.Input.pressed[keyBinds.SELECT_TILESET] ||
					(activeSelectTileset !== undefined && activeSelectTileset.hasSelected());
			},
			onLayerChanged: function(layer) {
				var selectTileset = selectTilesets[layer._tag];
				if (!selectTileset) {
					selectTileset = selectTilesets[layer._tag] = new SelectTileset(layer);
				} else {
					selectTileset.onLayerChanged(layer);
				}
			},
			action: function(camera) {
				if (activeSelectTileset) {
					activeSelectTileset.onMouseMove(gm.Input.mouseX, gm.Input.mouseY, camera);
					if (gm.Input.down[keyBinds.PAN] && activeSelectTileset.isIdle()) {
						activeSelectTileset.startPanning();
					} else if (!gm.Input.down[keyBinds.PAN] && activeSelectTileset.isPanning()) {
						activeSelectTileset.finishPanning();
					} else if (gm.Input.mousedown && activeSelectTileset.isIdle()) {
						activeSelectTileset.startSelecting();
					} else if (!gm.Input.mousedown && activeSelectTileset.isSelecting()) {
						activeSelectTileset.finishSelecting();
					}
				}
			},
			switchIn: function(camera) {
				activeSelectTileset.switchIn(camera);
				if (LOGGING) console.log("active tool: select from tileset");
			},
			switchOut: function() {
				var tb = activeSelectTileset.switchOut();
				if (tb) {
					var layer = activeSelectTileset._layer;
					brushWrapper.getSelection(activeSelectTileset, layer, tb);
				}
			},
			render: function(ctx, camera) {
				activeSelectTileset.render(ctx, camera);
			}
		};

		this._toolWrappers.push(selectTilesetWrapper);

		///////////////////////////////////////////////

		var Pan = gm.Editor.Tools.Pan;

		var panWrapper = {
			onLayerSelected: function(layer) { },
			shouldSwitchIn: function() {
				return gm.Input.down[keyBinds.PAN];
			},
			shouldSwitchOut: function() {
				return !gm.Input.down[keyBinds.PAN];
			},
			onLayerChanged: function(layer) { },
			switchIn: function(camera) {
				Pan.switchIn(gm.Input.mouseX, gm.Input.mouseY, camera);
				if (LOGGING) console.log("active tool: pan");
			},
			action: function() {
				Pan.onMouseMove(gm.Input.mouseX, gm.Input.mouseY);
			},
			switchOut: function() { },
			render: function(ctx, camera) {
				Pan.render(ctx, camera);
			}
		};

		this._toolWrappers.push(panWrapper);

		///////////////////////////////////////////////

		var Move = gm.Editor.Tools.Move;

		var move = new Move();
		var moveWrapper = {
			onLayerSelected: function(layer) {
				move.switchLayer(layer);
			},
			shouldSwitchIn: function(camera) {
				return gm.Input.pressed[keyBinds.MOVE] &&
				move.getMoveBody(gm.Input.mouseX, gm.Input.mouseY, camera);
			},
			shouldSwitchOut: function(camera) {
				return !gm.Input.down[keyBinds.MOVE];
			},
			onLayerChanged: function(layer) { },
			switchIn: function(camera) {
				move.switchIn(gm.Input.mouseX, gm.Input.mouseY, camera);
			},
			switchOut: function() {},
			action: function() {
				move.onMouseMove(gm.Input.mouseX, gm.Input.mouseY);
			},
			render: function(ctx, camera) {
				move.render(ctx, camera);
			}
		};

		this._toolWrappers.push(moveWrapper);

		///////////////////////////////////////////////

		this._holdWrapper = undefined;
		this._baseWrapper = undefined;

		editor.addListener(this);
	};

	Toolbox.prototype.action = function(camera) {
		if (this._holdWrapper !== undefined) {
			this._holdWrapper.action(camera);
		}
		else if (this._baseWrapper !== undefined) {
			this._baseWrapper.action(camera);
		}
		this._checkActiveTool(camera);
	};

	Toolbox.prototype._checkActiveTool = function(camera) {
		if (this._holdWrapper) {
			if (this._holdWrapper.shouldSwitchOut && this._holdWrapper.shouldSwitchOut()) {
				this._holdWrapper.switchOut();
				this._holdWrapper = undefined;
				if (this._baseWrapper) this._baseWrapper.switchIn(camera);
			}
		}
		else {
			for (var i = 0; i < this._toolWrappers.length; i++) {
				if (this._toolWrappers[i].shouldSwitchIn(camera)) {
					var isHoldTool = this._toolWrappers[i].shouldSwitchOut;
					if (isHoldTool) {
						this._holdWrapper = this._toolWrappers[i];
						if (this._baseWrapper) this._baseWrapper.switchOut();
						this._holdWrapper.switchIn(camera);
					} else {
						if (this._baseWrapper) this._baseWrapper.switchOut();
						this._baseWrapper = this._toolWrappers[i];
						this._baseWrapper.switchIn(camera);
					}
				}
			}
		}
	};

	Toolbox.prototype.render = function(ctx, camera) {
		if (this._holdWrapper) this._holdWrapper.render(ctx, camera);
		else if (this._baseWrapper) this._baseWrapper.render(ctx, camera);
	};

	Toolbox.prototype.onLayerSelected = function(layer) {
		for (var i = 0; i < this._toolWrappers.length; i++) {
			var wrapper = this._toolWrappers[i];

			if ((this._holdWrapper && this._holdWrapper === wrapper) ||
				(!this._holdWrapper && this._baseWrapper && this._baseWrapper === wrapper)) {
				wrapper.switchOut();
			}
			
			wrapper.onLayerSelected(layer);
			
			if ((this._holdWrapper && this._holdWrapper === wrapper) ||
				(!this._holdWrapper && this._baseWrapper && this._baseWrapper === wrapper)) {
				wrapper.switchIn();
			}
		}
	};

	Toolbox.prototype.onLayerAdded = Toolbox.prototype.onLayerParamsChanged = function(layer) {
		for (var i = 0; i < this._toolWrappers.length; i++) {
			this._toolWrappers[i].onLayerChanged(layer);
		}
	};

	return Toolbox;

}();