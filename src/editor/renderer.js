gm.Editor.Renderer = function() {

	var Renderer = function(editor) {
		this._editor = editor;
		this._mapRenderers = {};
		this._entityRenderers = {};

		this._tbbox = {};

		this._editor.addListener(this);
	};

	Renderer.prototype._renderLayerDebug = function(layer, ctx, bbox) {
		ctx.save();

		layer.transformBboxToLocalSpace(bbox, this._tbbox);
		
		this._renderLayerMapDebug(layer, ctx, this._tbbox);
		for (var e = 0; e < layer._entities.length; e++) {
			this._renderEntityDebug(layer._entities[e], ctx, this._tbbox);
		}
		
		ctx.restore();
	};

	Renderer.prototype._renderLayerMapDebug = function(layer, ctx, bbox) {
		this._mapRenderers[layer._tag].render(ctx, layer._layerMap._px, layer._layerMap._py, bbox);
	};

	Renderer.prototype._renderEntityDebug = function(entity, ctx, bbox) {
		this._entityRenderers[entity._tag].render(ctx, entity._body._x - bbox.x0, entity._body._y - bbox.y0);
	};

	Renderer.prototype.render = function(ctx, bbox) {
		var level = this._editor._level;
		if (!level) return;
		var layers = level._layers;
		for (var l = 0; l < layers.length; l++) {
			this._renderLayerDebug(layers[l], ctx, bbox);
		}
	};

	Renderer.prototype.onActiveLevelChanged = function() {
		this._mapRenderers = {};
		this._entityRenderers = {};

		var level = this._editor._level;
		if (!level) return;
		
		var layers = level._layers;
		for (var l = 0; l < layers.length; l++) {
			this.onLayerAdded(layers[l]);
		}
		
		var entities = level._entities;
		for (var e = 0; e < entities.length; e++) {
			this.onEntityAdded(entities[e]);
		}
	};

	Renderer.prototype.onLayerAdded = function(layer) {
		this._mapRenderers[layer._tag] = new gm.Debug.Renderer.Map.Frame(layer._layerMap._map, {
			strokeStyle: gm.Settings.Editor.colors.MAP
		});
	};

	Renderer.prototype.onLayerParamsChanged = function(layer) {
		this._mapRenderers[layer._tag] = new gm.Debug.Renderer.Map.Frame(layer._layerMap._map, {
			strokeStyle: gm.Settings.Editor.colors.MAP
		});
	};

	Renderer.prototype.onLayerRemoved = function(layer) {
		this._mapRenderers[layer._tag] = undefined;
	};

	Renderer.prototype.onEntityAdded = function(entity) {
		console.log("on entity added???");
		this._entityRenderers[entity._tag] = new gm.Debug.Renderer.Entity.Frame(entity._body);
	};

	Renderer.prototype.onEntityChanged = function(entity) {
		this._entityRenderers[entity._tag] = new gm.Debug.Renderer.Entity.Frame(entity._body);
	};

	Renderer.prototype.onEntityRemoved = function(entity) {
		this._entityRenderers[entity._tag] = undefined;
	};

	return Renderer;

}();