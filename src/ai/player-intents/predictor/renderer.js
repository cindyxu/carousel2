gm.Ai.PlayerIntent.Predictor.Renderer = function() {

	var RenderUtil = gm.Ai.RenderUtil;

	var PredictorRenderer = function(predictor) {
		this._predictor = predictor;
		if (LOGGING && !predictor) {
			console.log("!!! predictorRenderer - no predictor");
		}
	};

	PredictorRenderer.prototype.renderer = function(ctx, bbox) {
		ctx.save();

		ctx.fillStyle = "yellow";
		var predictedLinks = this._predictor._predictedLinks;
		for (var i = 0; i < predictedLinks.length; i++) {
			RenderUtil.renderLink(ctx, predictedLinks[i]._tail);
		}

		ctx.fillStyle = "red";
		var discardedLinks = Object.keys(this._predictor._discardedLinks);
		for (var k in discardedLinks) {
			RenderUtil.renderLink(ctx, discardedLinks[k]._tail);
		}

		ctx.restore();
	};
};