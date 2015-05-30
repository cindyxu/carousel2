gm.Layer = function() {

	var tag = 0;

	var Layer = function(name, layerMap, params) {

		if (layerMap && !(layerMap instanceof gm.LayerMap)) {
			if (!params) params = layerMap;
			layerMap = undefined;
		}

		var layer = this;

		layer.name = name;

		layer._entities = [];
		layer._entitiesNeedSort = false;

		layer._tag = tag++;

		layer.distX = 1;
		layer.distY = 1;

		layer._isCollision = false;

		layer._layerMap = undefined;
		if (layerMap) layer.setLayerMap(layerMap);

		if (params) layer.setParams(params);

		layer.listener = undefined;

		if (!name && LOGGING) console.log("!!! new layer - no name");
		if (!layerMap && LOGGING) console.log("!!! new layer - no layermap");
	};

	Layer.prototype.setLayerMap = function(layerMap) {
		this._layerMap = layerMap;
		this._layerMap.listener = this;
		this.onChanged();
	};

	Layer.prototype.onLayerMapChanged = function() {
		this.onChanged();
	};

	Layer.prototype.onChanged = function() {
		if (this.listener) this.listener.onLayerChanged();
	};

	Layer.prototype.setParams = function(params) {
		if (params.distX !== undefined) this.distX = params.distX;
		if (params.distY !== undefined) this.distY = params.distY;
		if (params.isCollision !== undefined) this._isCollision = params.isCollision;

		this.onChanged();
	};

	Layer.prototype.addEntity = function(entity) {
		var layer = this;
		if (layer._entities.indexOf(entity) < 0) {
			layer._entities.push(entity);
			layer._entitiesNeedSort = true;
		}
		entity.layer = layer;
	};

	Layer.prototype.removeEntity = function(entity) {
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

	Layer.prototype.updateStep = function(delta) {
		this._layerMap.updateStep(delta);
	};

	Layer.prototype.transformPointToLocalSpace = function(px, py, bbox, res) {
		var sx = px - bbox.x0;
		var sy = py - bbox.y0;

		res.x = bbox.x0 * this.distX + sx;
		res.y = bbox.y0 * this.distY + sy;
	};

	Layer.prototype.transformBboxToLocalSpace = function(bbox, tbbox) {
		var layer = this;
		
		var sx = bbox.x1 - bbox.x0;
		var sy = bbox.y1 - bbox.y0;

		tbbox.x0 = bbox.x0 * layer.distX;
		tbbox.y0 = bbox.y0 * layer.distY;
		tbbox.x1 = tbbox.x0 + sx;
		tbbox.y1 = tbbox.y0 + sy;
	};

	var tbbox = {};
	Layer.prototype.render = function(ctx, bbox) {
		var layer = this;

		if (layer._entitiesNeedSort) {
			layer._entities.sort(entityDrawSortFunction);
			layer._entitiesNeedSort = false;
		}

		ctx.save();

		layer.transformBboxToLocalSpace(bbox, tbbox);

		layer._layerMap.render(ctx, tbbox);

		var entities = layer._entities;
		var elength = entities.length;
		for (var e = 0; e < elength; e++) {
			entities[e].render(ctx, tbbox);
		}

		ctx.restore();
	};

	Layer.prototype.posToObservedTile = function(px, py, bbox, res) {
		this.transformBboxToLocalSpace(bbox, tbbox);
		this._layerMap.posToTile(px + (tbbox.x0 - bbox.x0), 
			py + (tbbox.y0 - bbox.y0), 
			res);
	};

	Layer.prototype.tileToObservedPos = function(tx, ty, bbox, res) {
		this._layerMap.tileToPos(tx, ty, res);
		this.transformBboxToLocalSpace(bbox, tbbox);
		res.x -= (tbbox.x0 - bbox.x0);
		res.y -= (tbbox.y0 - bbox.y0);
	};

	return Layer;

}();