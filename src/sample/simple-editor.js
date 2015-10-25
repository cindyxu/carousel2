if (!gm.Sample) gm.Sample = {};

gm.Sample.SimpleEditor = function() {
	
	var SimpleEditor = function(layer, camera) {

		this._camera = camera;

		this._paintDown = false;
		this._moveDown = false;

		this._brush = new gm.Editor.Tools.Brush(layer);
		this._erase = new gm.Editor.Tools.Erase(layer);
		this._move = new gm.Editor.Tools.Move(layer);

		this._activePainter = this._brush;

		this._mx = 0;
		this._my = 0;
	};

	SimpleEditor.prototype.onMouseMove = function(nmx, nmy) {
		this._mx = nmx;
		this._my = nmy;
		this._activePainter.onMouseMove(this._mx, this._my);
		if (this._paintDown) {
			this._activePainter.paint(this._camera);
		} else if (this._moveDown) {
			this._move.onMouseMove(this._mx, this._my);
		}
	};

	SimpleEditor.prototype.onMouseDown = function() {
		if (!this._moveDown) {
			this._paintDown = true;
			this._activePainter.paint(this._camera);
		}
	};

	SimpleEditor.prototype.onMouseUp = function() {
		this._paintDown = false;
	};

	SimpleEditor.prototype.onBrushKeyDown = function() {
		if (!this._paintDown) this._activePainter = this._brush;
	};

	SimpleEditor.prototype.onEraseKeyDown = function() {
		if (!this._paintDown) this._activePainter = this._erase;
	};

	SimpleEditor.prototype.onMoveKeyDown = function() {
		if (!this._paintDown && 
				this._move.getMoveBody(this._mx, this._my, this._camera)) {
			this._moveDown = true;
			this._move.switchIn(this._mx, this._my, this._camera);
		}
	};

	SimpleEditor.prototype.onMoveKeyUp = function() {
		this._moveDown = false;
	};

	SimpleEditor.prototype.render = function(ctx) {
		if (this._moveDown) this._move.render(ctx, this._camera);
		else this._activePainter.render(ctx, this._camera);
	};

	return SimpleEditor;

}();