var SOLID = gm.Constants.Collision.SOLID;

gm.Renderer.CollisionMap = function(map) {
	var renderer = this;
	renderer.map = map;
};

gm.Renderer.CollisionMap.prototype = Object.create(gm.Renderer.Map.prototype);
/////

gm.Renderer.CollisionMap.prototype.toJSON = function() {
};

gm.Renderer.CollisionMap.prototype.applyStyle = function(ctx) {
	ctx.strokeStyle = "red";
	ctx.lineWidth = 5;
};

var Dir = gm.Constants.Dir;

gm.Renderer.CollisionMap.prototype.renderTileFn = function(ctx, map, ptx, pty) {
	var tile = map._tiles[pty * map._tilesX + ptx];
	var tilesize = map.tilesize;
	if (tile & Dir.LEFT) {
		ctx.strokeRect(ptx * tilesize, pty * tilesize, 0, tilesize);
	} 
	if (tile & Dir.RIGHT) {
		ctx.strokeRect((ptx+1) * tilesize, pty * tilesize, 0, tilesize);
	} 
	if (tile & Dir.UP) {
		ctx.strokeRect(ptx * tilesize, pty * tilesize, tilesize, 0);
	} 
	if (tile & Dir.DOWN) {
		ctx.strokeRect(ptx * tilesize, (pty+1) * tilesize, tilesize, 0);
	}
};