gm.Camera = function() {
	var camera = this;
	
	camera._body = new gm.Body({
		sizeX: gm.Settings.Game.WIDTH,
		sizeY: gm.Settings.Game.HEIGHT
	});

	camera.zoom = 1;
};

gm.Camera.prototype.update = function(delta) {
	var camera = this;
	if (camera._controller) camera._controller.updateStep(delta);
};

gm.Camera.prototype.track = function(target) {
	this._controller = createTrackController(this, target);
};

gm.Camera.prototype.canvasToWorldPos = function(cx, cy, res) {
	res.x = cx + this._body._x;
	res.y = cy + this._body._y;
};

gm.Camera.prototype.worldToCanvasPos = function(wx, wy, res) {
	res.x = wx - this._body._x;
	res.y = wy - this._body._y;
};

var createTrackController = function(camera, target) {
	return {
		update: function(delta) {
			var tcenter = target.getCenter();
			camera._body.moveTo(tcenter.x, tcenter.y);
		}
	};
};