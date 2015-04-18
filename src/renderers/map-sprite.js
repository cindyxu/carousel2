gm.Renderer.SpriteMap = function(map, params) {
	
	var renderer = this;

	renderer._framesPerRow = params._framesPerRow;
	renderer._tilesetSrc = params.tilesetSrc;
	renderer._ires = new gm.ImageResource(params.tilesetSrc);
	gm.Renderer.Map.call(renderer, map, params);

	renderer.load();
};

gm.Renderer.SpriteMap.prototype = Object.create(gm.Renderer.Map.prototype);
/////

gm.Renderer.ImageMap.prototype.toJSON = function() {
	var obj = gm.Renderer.Map.call(this, toJSON);
	obj.tilesetSrc = this._tilesetSrc;
	return obj;
};

gm.Renderer.SpriteMap.prototype.setParams = function(params) {
	this._framesPerRow = params._framesPerRow;
	this._tilesetSrc = params.tilesetSrc;
	this._ires = new gm.ImageResource(params.tilesetSrc);
	gm.Renderer.Map.prototype.setParams.call(this, params);

	this.load();
};

gm.Renderer.SpriteMap.prototype.load = function(callback) {
	this._ires.load(function(image) {
		if (image) {
			renderer._imageTilesX = Math.floor(image.width / map.tilesize);
			renderer._imageTilesY = Math.floor(image.height / map.tilesize);
		}
		if (callback) callback();
	});
};

gm.Renderer.SpriteMap.prototype.isValid = function() {
	return this._imageTilesX !== undefined && this._imageTilesY !== undefined;
};

gm.Renderer.SpriteMap.prototype.renderTileFn = function(ctx, map, ptx, pty) {
};