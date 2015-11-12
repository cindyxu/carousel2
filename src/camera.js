gm.Camera = function(params) {
	var camera = this;
	
	camera._body = new gm.Body({
		sizeX: (params && params.sizeX ? params.sizeX : gm.Settings.Game.WIDTH),
		sizeY: (params && params.sizeY ? params.sizeY : gm.Settings.Game.HEIGHT)
	});

	camera.zoom = 1;
	camera._level = undefined;
};

gm.Camera.prototype.setLevel = function(level) {
	this._level = level;
};

gm.Camera.prototype.update = function(delta) {
	var camera = this;
	if (camera._controller) camera._controller.updateStep(delta);
};

gm.Camera.prototype.track = function(target) {
	this._controller = this._createTrackController(this, target);
};

gm.Camera.prototype.canvasToWorldPos = function(cx, cy, res) {
	res.x = cx + this._body._x;
	res.y = cy + this._body._y;
};

gm.Camera.prototype.worldToCanvasPos = function(wx, wy, res) {
	res.x = wx - this._body._x;
	res.y = wy - this._body._y;
};

gm.Camera.prototype._createTrackController = function(camera, target) {
	return {
		updateStep: function(delta) {
			var tcenter = target.getCenter();
			camera._body.moveTo(tcenter.x - camera._body._sizeX/2, 
				tcenter.y - camera._body._sizeY/2);
		}
	};
};

gm.Camera.prototype.render = function(ctx) {
	if (this._level) {
		var bbox = this._body.getBbox(),
		layers = this._level._layers,
		llength = layers.length;

		ctx.save();
		ctx.fillStyle = gm.Settings.Game.BACKGROUND_COLOR;
		ctx.fillRect(0, 0, bbox.x1 - bbox.x0, bbox.y1 - bbox.y0);
		ctx.restore();

		for (var l = 0; l < llength; l++) {
			layers[l].render(ctx, bbox);
		}
	}
};