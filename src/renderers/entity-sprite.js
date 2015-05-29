gm.Renderer.SpriteEntity = function(body, sprite, params) {
	var renderer = this;

	if (body) renderer.setBody(body);
	if (sprite) renderer.setSprite(sprite);

	renderer._spritesheetSrc = spritesheetSrc;
	renderer._ires = new gm.ImageResource(spritesheetSrc);

	renderer.sizeX = 0;
	renderer.sizeY = 0;
	renderer.offsetX = 0;
	renderer.offsetY = 0;
	renderer.flipX = 0;
	renderer.flipY = 0;

	if (params) renderer.setParams(params);

	renderer.load();
};

gm.Renderer.SpriteEntity.prototype = Object.create(gm.Renderer.prototype);

gm.Renderer.SpriteEntity.prototype.setBody = function(body) {
	this._body = body;
};

gm.Renderer.SpriteEntity.prototype.setSprite = function(sprite) {
	this._sprite = sprite;
};

gm.Renderer.SpriteEntity.prototype.load = function(callback) {
	var renderer = this;
	renderer._ires.load(function(image) {
		if (callback) callback();
	});
};

gm.Renderer.SpriteEntity.prototype.setParams = function(params) {
	var renderer = this;
	
	if (params.sizeX !== undefined) renderer.sizeX = params.sizeX;
	if (params.sizeY !== undefined) renderer.sizeY = params.sizeY;
	
	if (params.offsetX !== undefined) renderer.offsetX = params.offsetX;
	if (params.offsetY !== undefined) renderer.offsetY = params.offsetY;
	
	if (params.flipX !== undefined) renderer.flipX = params.flipX;
	if (params.flipY !== undefined) renderer.flipY = params.flipY;
};

gm.Renderer.SpriteEntity.prototype.render = function(ctx, x, y) {
	var renderer = this;
	var body = renderer._body;
	var sprite = renderer._sprite;
	
	if (!renderer._ires || !sprite.anim) return;

	var targetFrame = sprite._anim.frames[sprite._frame];
	renderer.renderInternal(ctx, x, y, targetFrame, body._sizeX, body._sizeY);
};

gm.Renderer.SpriteEntity.prototype.renderInternal = function(ctx, x, y, rframe, containerX, containerY) {
	var renderer = this;

	var numFramesX = Math.floor(renderer.image.width / renderer.sizeX);
	
	var spx = (rframe % numFramesX) * renderer.sizeX;
	var spy = Math.floor(rframe / numFramesX) * renderer.sizeY;

	ctx.save();

	if (renderer.flipX) {
		ctx.translate(Math.round(x + containerX - renderer.offsetX), 0);
		ctx.scale(-1, 1);
	}
	else ctx.translate(Math.round(x+renderer.offsetX), 0);

	if (renderer.flipY) {
		ctx.translate(0, Math.round(y + containerY - renderer.offsetY));
		ctx.scale(1, -1);
	}
	else ctx.translate(0, Math.round(y+renderer.offsetY));

	ctx.drawImage(renderer._ires.image, spx, spy, renderer.sizeX, renderer.sizeY, 0, 0, renderer.sizeX, renderer.sizeY);
	ctx.restore();

};