gm.Debug.Renderer.Map.Collision = function() {

	var CollisionMapRenderer = function(map) {
		var renderer = this;
		renderer.map = map;
	};

	CollisionMapRenderer.prototype = Object.create(gm.Renderer.Map.prototype);
	/////

	CollisionMapRenderer.prototype.toJSON = function() {
	};

	CollisionMapRenderer.prototype.applyStyle = function(ctx) {
		ctx.strokeStyle = "red";
		ctx.lineWidth = 5;
	};

	var Dir = gm.Constants.Dir;
	CollisionMapRenderer.prototype.renderTileFn = function(ctx, map, ptx, pty) {
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

	return CollisionMapRenderer;
}();