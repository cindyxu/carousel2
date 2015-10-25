gm.Sample.Ai.Walker.Pathfinding.Editor = (function(ToyWorld) {
	
	var Editor = {};

	var paintDown = false;
	var moveDown = false;

	var brush = new gm.Editor.Tools.Brush(ToyWorld._layer);
	var erase = new gm.Editor.Tools.Erase(ToyWorld._layer);
	var move = new gm.Editor.Tools.Move(ToyWorld._layer);

	var activePainter = brush;

	var mx, my;

	Editor.onMouseMove = function(nmx, nmy) {
		mx = nmx;
		my = nmy;
		activePainter.onMouseMove(mx, my);
		if (paintDown) {
			activePainter.paint(ToyWorld._camera);
		} else if (moveDown) {
			move.onMouseMove(mx, my);
		}
	};

	Editor.onMouseDown = function() {
		if (!moveDown) {
			paintDown = true;
			activePainter.paint(ToyWorld._camera);
		}
	};

	Editor.onMouseUp = function() {
		paintDown = false;
	};

	Editor.onBrushKeyDown = function() {
		if (!paintDown) activePainter = brush;
	};

	Editor.onEraseKeyDown = function() {
		if (!paintDown) activePainter = erase;
	};

	Editor.onMoveKeyDown = function() {
		if (!paintDown && 
				move.getMoveBody(mx, my, ToyWorld._camera)) {
			moveDown = true;
			move.switchIn(mx, my, ToyWorld._camera);
		}
	};

	Editor.onMoveKeyUp = function() {
		moveDown = false;
	};

	Editor.render = function(ctx) {
		var camera = ToyWorld._camera;
		if (moveDown) move.render(ctx, camera);
		else activePainter.render(ctx, camera);
	};

	return Editor;

})(gm.Sample.Ai.Walker.Pathfinding.ToyWorld);