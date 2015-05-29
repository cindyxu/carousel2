gm.LayerMap = function(params) {
	var layerMap = this;

	layerMap._pos = {
		x: 0,
		y: 0
	};

	layerMap._transformFns = [];

	layerMap._elapsed = 0;

	layerMap._offsetX = 0;
	layerMap._offsetY = 0;

	layerMap.listener = undefined;

	layerMap._map = undefined;
	layerMap.renderer = undefined;

	if (params) layerMap.setParams(params);
};

gm.LayerMap.prototype.setParams = function(params) {
	var layerMap = this;

	if (params.offsetX !== undefined) layerMap._offsetX = params.offsetX;
	if (params.offsetY !== undefined) layerMap._offsetY = params.offsetY;
	
	layerMap.updatePosition();

	layerMap.onChanged();
};

gm.LayerMap.prototype.setMap = function(map) {
	if (this._map) this._map.listener = undefined;
	this._map = map;
	
	this._map.listener = this;
	this.onChanged();
};

gm.LayerMap.prototype.onMapChanged = function() {
	this.onChanged();
};

gm.LayerMap.prototype.onChanged = function() {
	if (this.listener) this.listener.onLayerMapChanged();
};

gm.LayerMap.prototype.addTransformation = function(transformFn) {
	this._transformFns.push(transformFn);
};

gm.LayerMap.prototype.render = function(ctx, bbox) {
	if (this.renderer) this.renderer.render(ctx, this._pos.x, this._pos.y, bbox);
};

gm.LayerMap.prototype.updateStep = function(delta) {
	this._elapsed += delta;
	this.updatePosition();
};

gm.LayerMap.prototype.updatePosition = function() {
	var layerMap = this;
	var pos = layerMap._pos;
	pos.x = layerMap._offsetX;
	pos.y = layerMap._offsetY;

	var _transformFns = layerMap._transformFns;
	var fct = _transformFns.length;
	for (var i = 0; i < fct; i++) {
		_transformFns[i](pos, layerMap._elapsed);
	}
};

gm.LayerMap.prototype.posToTile = function(px, py, res) {
	this._map.posToTile(px - this._pos.x, py - this._pos.y, res);
};

gm.LayerMap.prototype.tileToPos = function(tx, ty, res) {
	var layerMap = this;
	layerMap._map.tileToPos(tx, ty, res);
	res.x += layerMap._pos.x;
	res.y += layerMap._pos.y;
};
