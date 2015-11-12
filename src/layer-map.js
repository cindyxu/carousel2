gm.LayerMap = function() {

	var LayerMap = function(map, renderer, params) {

		if (arguments.length === 2 && !(renderer instanceof gm.Renderer)) {
			params = renderer;
			renderer = undefined;
		} else if (arguments.length === 1 && !(map instanceof gm.Map)) {
			params = map;
			renderer = map = undefined;
		}

		var layerMap = this;

		gm.PosMap.call(this, params);

		layerMap._transformFns = [];
		layerMap._elapsed = 0;
		layerMap._offsetX = 0;
		layerMap._offsetY = 0;
		layerMap.listener = undefined;
		layerMap._renderer = undefined;

		if (params) layerMap.setParams(params);

		if (map) layerMap.setMap(map);
	    else if (LOGGING) console.log("!!! new layermap - no map");
		
		if (renderer) layerMap.setRenderer(renderer);
	};

	LayerMap.prototype = Object.create(gm.PosMap.prototype);

	LayerMap.prototype.setParams = function(params) {
		var layerMap = this;

		if (params.offsetX !== undefined) layerMap._offsetX = params.offsetX;
		if (params.offsetY !== undefined) layerMap._offsetY = params.offsetY;

		layerMap.updatePosition();

		layerMap.onChanged();
	};

	LayerMap.prototype.setMap = function(map) {
		if (this._map) this._map.listener = undefined;
		this._map = map;
		
		if (this.renderer) this.renderer.setMap(this._map);
		this._map.listener = this;
		this.onChanged();
	};

	LayerMap.prototype.setRenderer = function(renderer) {
		console.log("set renderer?", renderer);
		this._renderer = renderer;
		if (this._renderer) this._renderer.setMap(this._map);
	};

	LayerMap.prototype.onMapChanged = function() {
		this.onChanged();
	};

	LayerMap.prototype.onChanged = function() {
		if (this.listener) this.listener.onLayerMapChanged();
	};

	LayerMap.prototype.addTransformation = function(transformFn) {
		this._transformFns.push(transformFn);
	};

	LayerMap.prototype.render = function(ctx, bbox) {
		if (this._renderer) this._renderer.render(ctx, this._px, this._py, bbox);
	};

	LayerMap.prototype.updateStep = function(delta) {
		this._elapsed += delta;
		this.updatePosition();
	};

	var res = {};
	LayerMap.prototype.updatePosition = function() {
		var layerMap = this;
		layerMap._px = layerMap._offsetX;
		layerMap._py = layerMap._offsetY;

		var _transformFns = layerMap._transformFns;
		var fct = _transformFns.length;
		for (var i = 0; i < fct; i++) {
			_transformFns[i](layerMap._px, layerMap._py, layerMap._elapsed, res);
		}
	};

	return LayerMap;

}();