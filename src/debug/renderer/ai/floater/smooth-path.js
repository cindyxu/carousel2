gm.Debug.Renderer.Ai.Floater.SmoothPath = function() {
	
	var Renderer = function(smoothPath) {
		this._smoothPath = smoothPath;
	};

	Renderer.prototype.render = function(ctx, x, y, bbox) {
		if (!ctx || !bbox) {
			console.log("!!! smoothpath renderer - ctx:", ctx, ", bbox:", bbox);
			return;
		}

		ctx.save();
		ctx.translate(x - bbox.x0, y - bbox.y0);

		ctx.fillStyle = "rgba(100, 255, 0, 0.5)";

		ctx.restore();
	};

	return Renderer;
}();