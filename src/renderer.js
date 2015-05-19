gm.Level.Renderer = {
	render : function(ctx, level, camera) {
		
		var bbox = camera._body.getBbox(),
			layers = level._layers,
			llength = layers.length;

		ctx.save();
		ctx.fillStyle = gm.Settings.Game.BACKGROUND_COLOR;
		ctx.fillRect(0, 0, bbox.x1 - bbox.x0, bbox.y1 - bbox.y0);
		ctx.restore();

		for (var l = 0; l < llength; l++) {
			layers[l].render(ctx, bbox);
		}
	}
};