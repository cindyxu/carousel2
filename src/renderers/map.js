gm.Renderer.Map = function(map, params) {
	var renderer = this;

	renderer.repeatX = false;
	renderer.repeatY = false;

	if (params) {
		if (params.repeatX !== undefined) renderer.repeatX = params.repeatX;
		if (params.repeatY !== undefined) renderer.repeatY = params.repeatY;
	}

	renderer.map = map;
};

gm.Renderer.Map.prototype.toJSON = function() {
	var renderer = this;
	return {
		repeatX : renderer.repeatX,
		repeatY : renderer.repeatY
	};
};

gm.Renderer.Map.prototype.isValid = function() {
	return true;
};

gm.Renderer.Map.prototype.applyStyle = function(ctx) {};

gm.Renderer.Map.prototype.render = function(ctx, x, y, bbox) {

	var renderer = this;

	if (!renderer.isValid()) return;

	var map = renderer.map;

	var tilesX = map._tilesX;
	var tilesY = map._tilesY;
	var tilesize = map.tilesize;
	
	var endX = x + tilesize * tilesX;
	var endY = y + tilesize * tilesY;

	var bx0 = bbox.x0,
		by0 = bbox.y0,
		bx1 = bbox.x1,
		by1 = bbox.y1;

	if (!renderer.repeatX) {
		bx0 = Math.min(Math.max(bx0, x), endX);
		bx1 = Math.min(Math.max(bx1, x), endX);
	}

	if (!renderer.repeatY) {
		by0 = Math.min(Math.max(by0, y), endY);
		by1 = Math.min(Math.max(by1, y), endY);
	}

	var tbx0 = Math.floor((bx0 - x) / tilesize);
	var tbx1 = Math.ceil((bx1 - x) / tilesize);

	var tby0 = Math.floor((by0 - y) / tilesize);
	var tby1 = Math.ceil((by1 - y) / tilesize);

	ctx.save();
	ctx.translate(x - bbox.x0, y - bbox.y0);
	renderer.applyStyle(ctx);

	for (var ty = tby0; ty < tby1; ty++) {
		for (var tx = tbx0; tx < tbx1; tx++) {
			renderer.renderTileFn(ctx, map, tx, ty);
		}
	}

	ctx.restore();
};