gm.Debug.Renderer.Ai.Walker.Reachable = function() {
	
	var RenderUtil = gm.Debug.Renderer.Ai.Walker.RenderUtil;

	var Renderer = function(reachable) {
		this._reachable = reachable;
	};

	Renderer.prototype.render = function(ctx, x, y, bbox) {
		if (!ctx || !bbox) {
			console.log("!!! reachable renderer - ctx:", ctx, ", bbox:", bbox);
			return;
		}

		ctx.save();
		ctx.translate(x - bbox.x0, y - bbox.y0);

		ctx.fillStyle = "rgba(100, 255, 0, 0.5)";
		for (var r = 0; r < this._reachable._from.length; r++) {
			var preachable = this._reachable._from[r];
			if (preachable) {
				for (var l = 0; l < preachable._links.length; l++) {
					var link = preachable._links[l];
					gm.Debug.Renderer.Ai.Walker.RenderUtil.renderLink(ctx, link._tail);
				}
			}
		}	
		ctx.restore();
	};

	return Renderer;
}();