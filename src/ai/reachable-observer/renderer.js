gm.Ai.ObservedReachable.Renderer = function() {
	
	var RenderUtil = gm.Ai.PlatformUtil.Render;

	var Renderer = function(observedReachable) {
		this._observedReachable = observedReachable;
	};

	Renderer.prototype.render = function(ctx, x, y, bbox) {
		ctx.save();
		ctx.translate(x - bbox.x0, y - bbox.y0);

		ctx.fillStyle = "rgba(100, 255, 0, 0.5)";
		for (var r = 0; r < this._observedReachable.length; r++) {
			var preachable = this._observedReachable[r];
			if (preachable) {
				for (var l = 0; l < preachable._links.length; l++) {
					var link = preachable._links[l];
					RenderUtil.renderLink(ctx, link._tail);
				}
			}
		}	
		ctx.restore();
	};

	return Renderer;
}();