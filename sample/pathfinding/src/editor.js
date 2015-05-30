var Pathfinding = gm.Sample.Pathfinding;
var ToyWorld = Pathfinding.ToyWorld;

var paintDown = false;
var moveDown = false;

var brush = new gm.Editor.Tools.Brush(ToyWorld._layer);
var erase = new gm.Editor.Tools.Erase(ToyWorld._layer);
var move = new gm.Editor.Tools.Move(ToyWorld._layer);

var activePainter = brush;

var mx, my;

Pathfinding.Editor = {};

Pathfinding.Editor.onMouseMove = function(nmx, nmy) {
	mx = nmx;
	my = nmy;
	activePainter.onMouseMove(mx, my);
	if (paintDown) {
		activePainter.paint(ToyWorld._camera);
	} else if (moveDown) {
		move.onMouseMove(mx, my);
	}
};

Pathfinding.Editor.onMouseDown = function() {
	if (!moveDown) {
		paintDown = true;
		activePainter.paint(ToyWorld._camera);
	}
};

Pathfinding.Editor.onMouseUp = function() {
	paintDown = false;
};

Pathfinding.Editor.onBrushKeyDown = function() {
	if (!paintDown) activePainter = brush;
};

Pathfinding.Editor.onEraseKeyDown = function() {
	if (!paintDown) activePainter = erase;
};

Pathfinding.Editor.onMoveKeyDown = function() {
	if (!paintDown && 
			move.getMoveBody(mx, my, ToyWorld._camera)) {
		moveDown = true;
		move.switchIn(mx, my, ToyWorld._camera);
	}
};

Pathfinding.Editor.onMoveKeyUp = function() {
	moveDown = false;
};

Pathfinding.Editor.render = function(ctx) {
	var camera = ToyWorld._camera;
	navGrid.render(ctx, camera._body.getBbox());
	if (moveDown) move.render(ctx, camera);
	else activePainter.render(ctx, camera);
};