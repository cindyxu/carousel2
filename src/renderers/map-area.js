gm.Renderer.AreaMap = function(map) {
	gm.Renderer.Map.call(this, map);
};

gm.Renderer.AreaMap.prototype = Object.create(gm.Renderer.Map.prototype);

var colorMap = {};

gm.Renderer.AreaMap.prototype.generateNewColor = function() {

	var randomRgb = Math.floor(Math.random() * 255);
	var rgbOrder = Math.floor(Math.random() * 6);
	if (rgbOrder < 1) {
		return "rgba(" + randomRgb + ",255,0, 0.3)";
	}
	else if (rgbOrder < 2) {
		return "rgba(" + randomRgb + ",0,255, 0.3)";
	}
	else if (rgbOrder < 3) {
		return "rgba(255," + randomRgb + ",0, 0.3)";
	}
	else if (rgbOrder < 4) {
		return "rgba(0," + randomRgb + ",255, 0.3)";
	}
	else if (rgbOrder < 5) {
		return "rgba(255,0," + randomRgb + ", 0.3)";
	}
	else {
		return "rgba(0,255," + randomRgb + ", 0.3)";
	}

};

gm.Renderer.AreaMap.prototype.renderTileFn = function(ctx, map, tx, ty) {
	var area = map._tiles[ty * map._tilesX + tx];
	if (!area) return;

	if (!colorMap[area.index]) {
		colorMap[area.index] = this.generateNewColor();
	}

	ctx.save();
	
	ctx.fillStyle = colorMap[area.index];

	var tilesize = map.tilesize;
	ctx.fillRect(tx * map.tilesize, ty * map.tilesize, map.tilesize, map.tilesize);
	
	ctx.restore();
};