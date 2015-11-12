gm.Renderer.ImageMap = function(map, params) {

	var renderer = this;

	renderer._tilesetSrc = params.tilesetSrc;
	renderer._ires = new gm.ImageResource(params.tilesetSrc);
	gm.Renderer.Map.call(renderer, map, params);

	renderer.load();
};

gm.Renderer.ImageMap.prototype = Object.create(gm.Renderer.Map.prototype);
/////

gm.Renderer.ImageMap.prototype.toJSON = function() {
	var obj = gm.Renderer.Map.call(this, toJSON);
	obj.tilesetSrc = this._tilesetSrc;
	return obj;
};

gm.Renderer.ImageMap.prototype.setParams = function(params) {
	this._tilesetSrc = params.tilesetSrc;
	this._ires = new gm.ImageResource(params.tilesetSrc);
	gm.Renderer.Map.prototype.setParams.call(this, params);

	this.load();
};

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

gm.Renderer.ImageMap.prototype.renderTileFn = function(ctx, map, tx, ty) {

	var renderer = this;
	var tilesX = map._tilesX;
	var tilesY = map._tilesY;

	var mtx = ((tx % tilesX) + tilesX) % tilesX;
	var mty = ((ty % tilesY) + tilesY) % tilesY;

	var image = renderer._ires.image;
	var index = renderer.map._tiles[mty * renderer.map._tilesX + mtx];

	if (index !== null) {
		var ity = Math.floor(index / renderer._imageTilesX);
		var itx = index % renderer._imageTilesY;

		var tilesize = renderer.map.tilesize;
		ctx.drawImage(image,
			itx * tilesize,
			ity * tilesize,
			tilesize,
			tilesize,
			tx * tilesize,
			ty * tilesize,
			tilesize,
			tilesize);
	}
};