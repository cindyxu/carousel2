gm.Pathfinder.Walker.PlatformSearch = function() {

	var DOWN = gm.Constants.Dir.DOWN;
	var UP = gm.Constants.Dir.UP;

	var PlatformSearch = function(
		platformMap, sizeX, sizeY, runSpd, jumpSpd, fallAccel, terminalV, originPlatform) {

		this._platformMap = platformMap;
		this._sizeX = sizeX;
		this._sizeY = sizeY;
		this._runSpd = runSpd;
		this._jumpSpd = jumpSpd;
		this._fallAccel = fallAccel;
		this._terminalV = terminalV;

		this._originPlatform = originPlatform;
		this._reachableAreas = {};

		this._currentAreas = [{
			ltx: originPlatform.tx0,
			rtx: originPlatform.tx1,
			ty: originPlatform.ty,
			
			vyi: 0,
			vyo: 0,
			
			pxli: 0,
			pxri: 0,
			pxlo: 0,
			pxro: 0,

			pylo: 0,
			pyro: 0,

			parent: undefined
		}];
	};

	var lres = {};
	var rres = {};
	PlatformSearch.prototype.step = function() {
		var nextArea = this._currentAreas.pop();
		this._currentAreas.push({
			ltx: nextArea.ltx,
			rtx: nextArea.rtx,
			ty: nextArea.ty - 1,
			
			vyi: 0,
			vyo: 0,
			
			pxli: 0,
			pxri: 0,
			pxlo: 0,
			pxro: 0,

			pylo: 0,
			pyro: 0,

			parent: nextArea
		});
	};

	PlatformSearch.prototype.render = function(x, y, ctx) {
		ctx.save();
		ctx.translate(x, y);
		ctx.fillStyle = "rgba(0, 255, 100, 0.3)";
		ctx.strokeStyle = "rgba(0, 255, 100, 1)";
		for (var a = 0; a < this._currentAreas.length; a++) {
			this.renderArea(ctx, area);
		}
		ctx.restore();
	};

	PlatformSearch.prototype.renderArea = function(ctx, area) {
		var tilesize = this._platformMap.tilesize;
		ctx.fillRect(area.ltx * tilesize, area.ty * tilesize, 
			(area.rtx+1) * tilesize, (area.ty+1) * tilesize);
		ctx.strokeRect(area.pxli, area.pyli, area.pxlo, area.pylo);
		ctx.strokeRect(area.pxri, area.pyri, area.pxro, area.pyro);
	};

	return PlatformSearch;

}();