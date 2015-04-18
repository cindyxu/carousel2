var SOLID = gm.Constants.Collision.SOLID;

gm.Renderer.CollisionMap = function(map) {
	var renderer = this;
	renderer.map = map;
};

gm.Renderer.CollisionMap.prototype = Object.create(gm.Renderer.Map.prototype);
/////

gm.Renderer.CollisionMap.prototype.toJSON = function() {
};

gm.Renderer.CollisionMap.prototype.isValid = function() {
	return true;
};

gm.Renderer.CollisionMap.prototype.applyStyle = function(ctx) {
	ctx.fillStyle = "rgba(255,0,0,0.6)";
};

gm.Renderer.CollisionMap.prototype.renderTileFn = function(ctx, map, ptx, pty) {
	var tile = map._tiles[pty * map._tilesX + ptx];
	var tilesize = map.tilesize;
	if (tile === SOLID) {
		ctx.fillRect(ptx * tilesize, pty * tilesize, tilesize, tilesize);
	}
};