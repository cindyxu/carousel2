gm.Renderer.ImageMap = function(map, params) {
	
	var renderer = this;

	renderer._tilesetSrc = params.tilesetSrc;
	renderer._ires = new gm.ImageResource(params.tilesetSrc);
	gm.Renderer.Map.call(renderer, map, params);

	renderer.load();
};

gm.Renderer.ImageMap.prototype = Object.create(gm.Renderer.Map.prototype);
/////

gm.Renderer.ImageMap.prototype.load = function(callback) {
	var renderer = this;
	renderer._ires.load(function(image) {
		if (image) {
			renderer._imageTilesX = Math.floor(image.width / renderer.map.tilesize);
			renderer._imageTilesY = Math.floor(image.height / renderer.map.tilesize);
		}
		if (callback) callback();
	});
};

gm.Renderer.ImageMap.prototype.isValid = function() {
	return this._imageTilesX !== undefined && this._imageTilesY !== undefined;
};

gm.Renderer.ImageMap.prototype._framesPerRow = 1;

gm.Renderer.ImageMap.prototype.renderTileFn = function(ctx, map, ptx, pty) {

	var renderer = this;

	var image = renderer._ires.image;
	var index = renderer.map._tiles[pty * renderer.map._tilesX + ptx];
	var ity = Math.floor(index / renderer._imageTilesX);
	var itx = index % renderer._imageTilesY;

	var tilesize = renderer.map.tilesize;
	ctx.drawImage(image,
		itx * tilesize,
		ity * tilesize,
		tilesize,
		tilesize,
		ptx * tilesize,
		pty * tilesize,
		tilesize,
		tilesize);
};