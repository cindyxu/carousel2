gm.Debug.Renderer.Ai.Walker.RenderUtil = {

	renderPlatform: function(ctx, pmap, platform) {
		var px0 = pmap.tileToPosX(platform._tx0);
		var px1 = pmap.tileToPosX(platform._tx1);
		ctx.fillRect(px0, pmap.tileToPosY(platform._ty), px1 - px0, pmap.tilesize);
	},

	renderLink: function(ctx, tail) {
		var area = tail;
		while (area) {
			if (area._pyo < area._pyi) {
				ctx.fillRect(area._pxlo, area._pyo,
					area._pxro - area._pxlo, area._pyi - area._pyo);
			} else {
				ctx.fillRect(area._pxlo, area._pyi, 
					area._pxro - area._pxlo, area._pyo - area._pyi);
			}
			area = area._parent;
		}
	}

};