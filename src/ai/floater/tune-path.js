gm.Ai.Floater.TunePath = function() {

	var Dir = gm.Constants.Dir;

	var _TunedNode = function(tx, ty, textendX, textendY, dx, dy) {
		this._tx = tx;
		this._ty = ty;
		this._textendX = textendX;
		this._textendY = textendY;
		this._dx = dx;
		this._dy = dy;
	};

	var TunePath = {
		tune: function(combinedMap, x0, y0, x1, y1, sizeX, sizeY, path) {
			if (path.length === 0) return path;

			var tunePath = [];

			var tx = path[0]._tx;
			var ty = path[0]._ty;
			var textendX = 0;
			var textendY = 0;
			var dx0 = x0 - combinedMap.tileToPosX(tx);
			var dy0 = y0 - combinedMap.tileToPosX(ty);

			var tspaceX = (sizeX / combinedMap._map.tilesize) * combinedMap._map.tilesize;
			var tspaceY = (sizeY / combinedMap._map.tilesize) * combinedMap._map.tilesize;

			for (var i = 1; i < path.length-1; i++) {
				var tdiffX = (path[i-1]._tx - path[i]._tx) + (path[i+1]._tx - path[i]._tx);
				var tdiffY = (path[i-1]._ty - path[i]._ty) + (path[i+1]._ty - path[i]._ty);

				// if is corner
				if (tdiffX !== 0 && tdiffY !== 0) {
					tunePath.push(new _TunedNode(tx, ty, tw, th, dx0, dy0));
					tx = path[i]._tx;
					ty = path[i]._ty;
					textendX = textendY = 0;
					dx0 = (tdiffX < 0 ? 0 : tspaceX - sizeX);
					dy0 = (tdiffY < 0 ? 0 : tspaceY - sizeY);
				} else {
					textendX += tdiffX;
					textendY += tdiffY;
				}
			}

			var dx1 = x1 - combinedMap.tileToPosX(tx);
			var dy1 = y1 - combinedMap.tileToPosX(ty);
			var endNode = path[path.length-1];
			tunePath.push(new TunedNode(endNode._tx, endNode._ty, 1, 1, dx1, dy1));

			return tunePath;

			// his eyes went, then ears, then mouth. his human figure softened into a smooth, infantile blob. 
			// he stretched his putty-limbs out in vain, seeking structure in the world closing ever faster around him.
			// his mind thought for the last time, "I want ... I need ... I want ..."
			// and it too was extinguished.
		}
	};

	return TunePath;

}();