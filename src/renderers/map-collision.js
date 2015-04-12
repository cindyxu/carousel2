gm.Renderer.CollisionMap = function(map) {
	var renderer = this;
	renderer.map = map;
};

gm.Renderer.CollisionMap.prototype = Object.create(gm.Renderer.Map.prototype);

gm.Renderer.CollisionMap.prototype.isValid = function() {
	return true;
};

gm.Renderer.CollisionMap.prototype.renderTile = function(ctx, ptx, pty, t) {
	
};