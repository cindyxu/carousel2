var tag = 0;

gm.Layer = function(name, layerMap, params) {
	var layer = this;

	layer.name = name;
	layer.layerMap = layerMap;
	
	layer._entities = [];
	layer._entitiesNeedSort = false;

	layer._tag = tag++;

	layer.distX = 1;
	layer.distY = 1;

	if (params) layer.setParams(params);
};

gm.Layer.prototype.setParams = function(params) {
	if (params.distX !== undefined) this.distX = params.distX;
	if (params.distY !== undefined) this.distY = params.distY;
};

gm.Layer.prototype.addEntity = function(entity) {
	var layer = this;
	if (layer._entities.indexOf(entity) < 0) {
		layer._entities.push(entity);
		layer._entitiesNeedSort = true;
	}
	entity.layer = layer;
};

gm.Layer.prototype.removeEntity = function(entity) {
	var layer = this;
	var i = layer._entities.indexOf(entity);
	if (i >= 0) {
		layer._entities.splice(i, 1);
	}
	entity.layer = undefined;
};

var entityDrawSortFunction = function(e1, e2) {
	return e1._drawIndex - e2._drawIndex;
};

gm.Layer.prototype.preUpdate = function() {
	var layer = this;
	
	layer.layerMap.preUpdate();

	var entities = layer._entities;
	var elength = entities.length;
	for (var e = 0; e < elength; e++) {
		entities[e].preUpdate();
	}
};

gm.Layer.prototype.updateStep = function(delta) {
	var layer = this;

	layer.layerMap.updateStep(delta);

	var entities = layer._entities;
	var elength = entities.length;
	for (var e = 0; e < elength; e++) {
		entities[e].updateStep(delta);
	}
};

gm.Layer.prototype.postUpdate = function() {
	var layer = this;
	
	layer.layerMap.postUpdate();

	var entities = layer._entities;
	var elength = entities.length;
	for (var e = 0; e < elength; e++) {
		entities[e].postUpdate();
	}
};

gm.Layer.prototype.transformBboxToLocalSpace = function(bbox, tbbox) {
	var layer = this;
	
	var sx = bbox.x1 - bbox.x0;
	var sy = bbox.y1 - bbox.y0;

	tbbox.x0 = bbox.x0 * layer.distX;
	tbbox.y0 = bbox.y0 * layer.distY;
	tbbox.x1 = tbbox.x0 + sx;
	tbbox.y1 = tbbox.y0 + sy;
};

var tbbox = {};
gm.Layer.prototype.render = function(ctx, bbox) {
	var layer = this;

	if (layer._entitiesNeedSort) {
		layer._entities.sort(entityDrawSortFunction);
		layer._entitiesNeedSort = false;
	}

	ctx.save();

	layer.transformBboxToLocalSpace(bbox, tbbox);

	layer.layerMap.render(ctx, tbbox);

	var entities = layer._entities;
	var elength = entities.length;
	for (var e = 0; e < elength; e++) {
		entities[e].render(ctx, tbbox);
	}

	ctx.restore();
};

gm.Layer.prototype.posToObservedTile = function(px, py, bbox, res) {
	this.transformBboxToLocalSpace(bbox, tbbox);
	this.layerMap.posToTile(px + (tbbox.x0 - bbox.x0), 
		py + (tbbox.y0 - bbox.y0), 
		res);
};

gm.Layer.prototype.tileToObservedPos = function(tx, ty, bbox, res) {
	this.layerMap.tileToPos(tx, ty, res);
	this.transformBboxToLocalSpace(bbox, tbbox);
	res.x -= (tbbox.x0 - bbox.x0);
	res.y -= (tbbox.y0 - bbox.y0);
};