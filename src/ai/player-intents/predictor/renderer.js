gm.Ai.PlayerIntent.Predictor.Renderer = function() {

	var RenderUtil = gm.Ai.PlatformUtil.Render;

	var PredictorRenderer = function(predictor) {
		this._predictor = predictor;
		if (LOGGING && !predictor) {
			console.log("!!! predictorRenderer - no predictor");
		}
	};

	PredictorRenderer.prototype.render = function(ctx, bbox) {
		ctx.save();

		ctx.fillStyle = "rgba(0, 255, 0, 0.3)";
		var predictedLinks = this._predictor._predictedLinks;
		for (var i = 0; i < predictedLinks.length; i++) {
			RenderUtil.renderLink(ctx, predictedLinks[i]._tail);
		}

		ctx.fillStyle = "rgba(255, 0, 0, 0.3)";
		var discardedLinks = Object.keys(this._predictor._discardedLinks);
		for (var k in discardedLinks) {
			RenderUtil.renderLink(ctx, discardedLinks[k]._tail);
		}

		ctx.restore();
	};

	return PredictorRenderer;
}();