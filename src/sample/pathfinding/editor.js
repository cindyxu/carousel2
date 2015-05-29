var Pathfinding = gm.Sample.Pathfinding;
var ToyWorld = Pathfinding.ToyWorld;

var brushDown = false;
var moveDown = false;

var brush = new gm.Editor.Tools.Brush(ToyWorld._layer);
var move = new gm.Editor.Tools.Move(ToyWorld._level);

Pathfinding.Editor = {};

Pathfinding.Editor.onMouseMove = function(mx, my) {
	brush.onMouseMove(mx, my);
	if (brushDown) {
		brush.paint(ToyWorld._camera);
	} else if (moveDown) {
		move.onMouseMove(mx, my);
	}
};

Pathfinding.Editor.onMouseDown = function(mx, my) {
	if (!moveDown) {
		brushDown = true;
		brush.paint(ToyWorld._camera);
	}
};

Pathfinding.Editor.onMouseUp = function(mx, my) {
	brushDown = false;
};

Pathfinding.Editor.onKeyDown = function(key) {
	if (!brushDown && key === gm.Settings.Editor.keyBinds.MOVE) {
		moveDown = true;
		move.onMouseMove(mx, my);
	}
};

Pathfinding.Editor.onKeyUp = function(key) {
	if (key === gm.Settings.Editor.keyBinds.MOVE) {
		moveDown = false;
	}
};

Pathfinding.Editor.render = function(ctx) {
	var camera = ToyWorld._camera;
	navGrid.render(ctx, camera._body.getBbox());
	brush.render(ctx, camera);
};