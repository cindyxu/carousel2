// what platforms are reachable from this one?

// yea I guess we'll just split them up then ^_^
// so just platform1 & platform2 then ...
// what is the condition of using the result of a prev search?
// never ...
// only that one platform is reachable from another at all.
// or when you don't have to backtrack

/*
the only thing that should really be stored is if you can't get ot the platform
eg blocked status
well ... if they don't overlap, there is really only one way to get to them

so platform ->
	nearby platforms ->
		p1
		p2
		p3 -> blocked
		...

	what damaaaammmnitttt

	- find areas of interest
	- see if you can get to them
	so hard!?

	- observe platforms
	- find adjacent platforms (eg. potential nodes)
	- pick an area of interest
	- try to get to it
	- mark nodes as blocked if can't reach
	- 

	tryToGetToIt: function() {
		a* with tryToGetToPlatform
	}

	tryToGetToPlatform: function(platform1, tx, ty, platform2) {
		if (too far) return false;
		if (can't reach by falling) vy = jump; else vy = 0;
		cast parabola
		if (parabola is blocked AND we don't make it) {
			if (landed) don't care, keep going
			if (side) if we can get our zenith over the blockage, realign our parabola
			frankly this should just not happen if we jump as late as possible.
			if (up) uhhh ... ignore fuck just mark as blocked
		}
		you know what, you can use a star. and limit the area

	}

	you can eliminate backtracking LATER

	also if the physics doesn't work out with ticks in-game
	you can always force it ;)


*/

var dir = gm.Constants.Dir;

gm.Pathfinder.Walker.PlatformSearch = function(
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

	this.getRawWorldExtentX(originPlatform, res);

	var ltx = originPlatform.tx0;
	while(ltx >= mltx) {
		if (platformMap.tileAt(ltx, ntx)) break;
		if (ltx > mltx) ltx--;
	}
	wxlo = Math.max(ltx*tilesize, wxlo);

	var rtx = originPlatform.tx1-1;
	while(rtx <= mrtx) {
		if (platformMap.tileAt(rtx, ntx)) break;
		if (rtx < mrtx) ltx++;
	}
	wxro = Math.min((rtx+1)*tilesize, wxro);

	this._currentAreas = [{
		ty: platform.ty - 1,
		vyi: jumpSpd,
		vyo: this.getDeltaVyFromDeltaY(jumpSpd, tilesize),
		rxli: 0,
		rxri: 0,
		rxlo: wxlo - ltx * tilesize,
		rxro: rtx * tilesize - wxro
	}];
};

gm.Pathfinder.Walker.PlatformSearch.prototype.getRawWorldExtentX = function(parentArea, res) {
	var tilesize = platformMap.tilesize;
	var jumpSpd = this._jumpSpd;
	
	var xDelta = this.getDeltaXFromDeltaY(jumpSpd, tilesize);

	res.rxlo = parentArea.rxli - xDelta;
	res.rxro = parentArea.rxri + xDelta;

	res.ltxo = Math.floor(res.wxlo / platformMap.tilesize);
	res.rtxo = Math.floor(res.wxro / platformMap.tilesize);
};

gm.Pathfinder.Walker.PlatformSearch.prototype.splitNextArea = function(parentArea, extents, ty, res) {

	// from leftmost tile to rightmost tile
	// 1. find blockages in the direction you are travelling
	//    from there find the free areas
	//    if we collided with the bottom of any platform,
	//    this may include "bounced" areas
	// 2. clamp ranges of areas. if there are horizontal only blockages,
	// further split up the areas
	
	// |<  >|  |---------|

	var DOWN = gm.Constants.Dir.DOWN;
	var UP = gm.Constants.Dir.UP;


	var landedPlatforms = res.landedPlatforms;
	var areas = res.freeAreas;
	for (var a in areas) {
		areas[a] = clampArea(areas[a]);
	}
	addAreas();

	var ltxi = parentArea.ltx;
	var rtxi = parentArea.rtx;

	var ltx = res.ltxo;

	ltx = -1;
	
	var ctxl, ctxr;

	for (tx = res.ltxo; tx <= res.rtxo; ) {
		var platform = this._platformMap.tileAt(tx, nty);
		var travelDir = this.parentArea.vyo >= 0 ? DOWN : UP;
		if ((platform & DOWN) && travelDir === UP) {
			// bounce area
			ctxl = ctxr = -1;
		}
		else if ((platform & DOWN) && travelDir === UP) {
			// add platforms to reachable
			ctxl = ctxr = -1;
		}
		else {
			if (ctxl < 0) ctxl = tx;
		}
	}

		// if (platform) {
		// 	if (ltx >= 0 && rtx >= ltxi && ltx <= rtxi) {

		// 		var cwrxli = Math.max(ltx * tilesize, wxli);
		// 		var cwrxri = Math.min(rtx * tilesize, wxri);
		// 		var cwrxlo = Math.max(ltx * tilesize, wxlo);
		// 		var cwrxro = Math.min(rtx * tilesize, wxro);

		// 		var narea = {
		// 			ltx: ltx,
		// 			rtx: rtx,
		// 			ty: nty,
		// 			vyi: nvyi,
		// 			vyo: nvyo,
		// 			rxli: cwrxli - (ltx * tilesize),
		// 			rxri: (rtx * tilesize) - cwrxri,
		// 			rxlo: cwrxlo - (ltx * tilesize),
		// 			rxro: (rtx * tilesize) - cwrxro
		// 		};

		// 		if (ltx === txlo && rtx === trxo) {
		// 			narea.parent = area;
		// 		} else {
		// 			narea.parent = this.splitParent(area, ltx, rtx);
		// 		}
		// 		this._currentAreas.push(narea);

		// 		if (!this._reachableAreas[platform]) {
		// 			this._reachableAreas[platform] = [];
		// 		}

		// 		this._reachableAreas[platform].push(this.splitParent(area, platform.tx0, platform.tx1));

		// 		ltx = -1;
		// 	}
		// 	rtx = platform.tx1;
		// } else {
		// 	if (ltx < 0) {
		// 		ltx = rtx;
		// 	}
		// 	rtx++;
		// }
};

var lres = {};
var rres = {};
gm.Pathfinder.Walker.PlatformSearch.prototype.step = function() {
	var area = this._currentAreas.pop();

	var tilesize = this._platformMap.tilesize;

	var nvyi = area.vyo;

	var nry0, nry1;
	var nvyo;
	
	var nty = (area.vyi < 0 ? area.ty - 1 : area.ty + 1);

	if (this.isZenith(nvyi)) {
		nvyo = -nvyi;
		nry0 = nry1 = this._platformMap.tilesize;
	}
	else {
		nvyo = this.getDeltaVyFromDeltaY(nvyi, tilesize);
		if (nvyi < 0) {
			nry0 = tilesize;
			nry1 = 0;
		} else {
			nry0 = 0;
			nry1 = tilesize;
		}
	}

	var xDelta = this.getDeltaXFromDeltaY(nvyi, tilesize);

	var wxli = area.ltx * tilesize + area.rxlo;
	var wxri = (area.rtx+1) * tilesize - area.rxro;

	var wxlo = wxli - xDelta;
	var wxro = wxri + xDelta;
	
	var txli = Math.floor(wxli / tilesize);
	var txlo = Math.floor(wxlo / tilesize);

	var txri = Math.floor(wxri / tilesize);
	var txro = Math.floor(wxro / tilesize);

	var ltx, rtx;
	ltx = -1;
	
	for (rtx = txlo; rtx <= trxo; ) {
		var platform = this._platformMap.tileAt(rtx, nty);
		if (platform) {
			if (ltx >= 0 && rtx >= txli && ltx <= txri) {

				var cwrxli = Math.max(ltx * tilesize, wxli);
				var cwrxri = Math.min(rtx * tilesize, wxri);
				var cwrxlo = Math.max(ltx * tilesize, wxlo);
				var cwrxro = Math.min(rtx * tilesize, wxro);

				var narea = {
					ltx: ltx,
					rtx: rtx,
					ty: nty,
					vyi: nvyi,
					vyo: nvyo,
					rxli: cwrxli - (ltx * tilesize),
					rxri: (rtx * tilesize) - cwrxri,
					rxlo: cwrxlo - (ltx * tilesize),
					rxro: (rtx * tilesize) - cwrxro
				};

				if (ltx === txlo && rtx === trxo) {
					narea.parent = area;
				} else {
					narea.parent = this.splitParent(area, ltx, rtx);
				}
				this._currentAreas.push(narea);

				if (!this._reachableAreas[platform]) {
					this._reachableAreas[platform] = [];
				}

				this._reachableAreas[platform].push(this.splitParent(area, platform.tx0, platform.tx1));

				ltx = -1;
			}
			rtx = platform.tx1;
		} else {
			if (ltx < 0) {
				ltx = rtx;
			}
			rtx++;
		}
	}
};

gm.Pathfinder.Walker.PlatformSearch.prototype.splitParent = function(parent, ltx, rtx) {
	return area;
};

gm.Pathfinder.Walker.PlatformSearch.prototype.render = function(x, y, ctx) {
	ctx.save();
	ctx.translate(x, y);
	ctx.fillStyle = "rgba(0, 255, 100, 0.3)";
	for (var a = 0; a < this._currentAreas.length; a++) {
		this.renderArea(ctx, area);
	}
	ctx.restore();
};

gm.Pathfinder.Walker.PlatformSearch.prototype.renderArea = function(ctx, area) {
	var tilesize = this._platformMap.tilesize;
	ctx.fillRect(area.ltx * tilesize, area.ty * tilesize, (area.rtx+1) * tilesize, (area.ty+1) * tilesize);
};