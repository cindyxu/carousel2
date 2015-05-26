var DOWN = gm.Constants.Dir.DOWN;
var UP = gm.Constants.Dir.UP;

var PlatformSearch = gm.Pathfinder.Walker.PlatformSearch = function(
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
		ltx: 0,
		rtx: 0,
		ty: 0,
		
		vyi: 0,
		vyo: 0,
		
		pxli: 0,
		pxri: 0,
		pxlo: 0,
		pxro: 0,

		parent: undefined
	}];
};

PlatformSearch.prototype._getDeltaTimeFromDeltaVy = function(vyi, vyf) {
	return (vyf - vyi) / this._fallAccel;
};

PlatformSearch.prototype._getDeltaXFromDeltaVy = function(vyi, vyf) {
	var dt = this._getDeltaTimeFromDeltaVy(vyi, vyf);
	return dt * this._runSpd;
};

PlatformSearch.prototype._getDeltaYFromDeltaTime = function(vyi, dt, ignoreCheck) {
	if (vyi >= this._terminalV) return this._terminalV * dt;

	else if (!ignoreCheck) {
		var timeToTerminalV = this._getDeltaTimeFromDeltaVy(vyi, this._terminalV);
		if (timeToTerminalV < dt) {
			var dyToTerminalV = this._getDeltaYFromDeltaTime(vyi, timeToTerminalV);
			var dyPastTerminalV = this._getDeltaYFromDeltaTime(this._terminalV, dt - timeToTerminalV);
			return dyToTerminalV + dyPastTerminalV;
		}
	}
	return vyi * dt + 0.5 * this._fallAccel * dt * dt;
};

PlatformSearch.prototype._getDeltaTimeFromDeltaY = function(vyi, dy, ignoreCheck) {
	if (vyi >= this._terminalV) {
		return dy / this._terminalV;
	}
	else if (!ignoreCheck) {
		var timeToTerminalV = this._getDeltaTimeFromDeltaVy(vyi, this._terminalV);
		var dyToTerminalV = this._getDeltaYFromDeltaTime(vyi, timeToTerminalV);
		if (dyToTerminalV < dy) {
			var timePastTerminalV = this._getDeltaTimeFromDeltaY(this._terminalV, dy - dyToTerminalV, true);
			return timeToTerminalV + timePastTerminalV;
		}
	}
	return (-vyi + Math.sqrt(vyi * vyi + 2 * this._jumpAccel * dy)) / this._jumpAccel;
};

PlatformSearch.prototype._getDeltaXFromDeltaTime = function(dt) {
	return this._runSpd * dt;
};

PlatformSearch.prototype._getDeltaXFromDeltaY = function(vyi, dy, ignoreCheck) {
	if (!ignoreCheck && vyi < terminalV) {
		var timeToTerminalV = this._getDeltaTimeFromDeltaVy(vyi, this._terminalV);
		var dyToTerminalV = this._getDeltaYFromDeltaTime(vyi, timeToTerminalV, true);
		if (dyToTerminalV < dy) {
			var dxToTerminalV = this._getDeltaXFromDeltaTime(timeToTerminalV);
			var dxPastTerminalV = this._getDeltaXFromDeltaY(this._terminalV, dy - dyToTerminalV, true);
			return dxToTerminalV + dxPastTerminalV;
		}
	}

	var dt = this._getDeltaTimeFromDeltaY(vyi, dy, true);
	return this._getDeltaXFromDeltaTime(dt);
};

PlatformSearch.prototype._getDeltaXThroughArea = function(vyi) {
	if (dyi < 0) {
		var timeToTerminalV = this._getDeltaTimeFromDeltaVy(vyi, this._terminalV);
		var dyToTerminalV = this._getDeltaYFromDeltaTime(vyi, timeToTerminalV, true);
		if (dyToTerminalV < dy) {
			// zenith
			return this._getDeltaXFromDeltaVy(vyi, -vyi);
		}
	}
	return this._getDeltaXFromDeltaY(vyi, (vyi < 0 ? -this._tilesize : this._tilesize));
};

var lres = {};
var rres = {};
PlatformSearch.prototype.step = function() {
	var nextArea = this._currentAreas.pop();
	var initialChildAreas = this._initialChildPass(nextArea);
	var finalChildAreas = [];
	var c, childArea;
	for (c = 0; c < initialChildAreas.length; c++) {
		childArea = initialChildAreas[c];
		this._clipAreaToObstacles(childArea);
		this._splitArea(childArea, finalChildAreas);
	}
	for (c = 0; c < finalChildAreas.length; c++) {
		childArea = finalChildAreas[c];
		if (childArea.clampParent) {
			childArea.parent = this._clampHierarchy(childArea.parent, childArea.pxli, childArea.pxri);
		}
	}
	this._currentAreas.concat(finalChildAreas);
};

PlatformSearch.prototype._initializeAreaWithRange = function(parentArea, ltxi, rtxi, vyi) {

	var platformSearch = this;

	var tilesize = platformMap.tilesize;
	var xDelta = this._getDeltaXThroughArea(vyi);

	var pxli = Math.max(ltxi * tilesize, parentArea.pxlo);
	var pxri = Math.min(rtxi * tilesize, parentArea.pxro);
	var pxlo = pxli - xDelta;
	var pxro = pxri - xDelta;

	return {
		pxli: pxli,
		pxri: pxri,
		pxlo: pxlo,
		pxro: pxro,
		vyi: vyi,
		vyo: platformSearch._getDeltaVyFromDeltaY(vyi, tilesize),
		parent: parentArea
	};
};

PlatformSearch.prototype._clampHierarchy = function(parentArea, pxlo, pxro) {
	if (!parentArea) return;
	var clampedParent = this._clampParent(parentArea, pxlo, pxro);
	if (clampedParent !== parentArea) {
		clampedParent.parent = this._clampHierarchy(parentArea.parent, clampedParent.pxli, clampedParent.pxri);
	}
	return clampedParent;
};

PlatformSearch.prototype._clampParent = function(parentArea, pxlo, pxro) {

	if (parentArea.pxlo >= pxlo && parentArea.pxro <= pxro) return parentArea;
	var backDeltaX = this._getDeltaXThroughArea(parentArea.vyi);
	return {
		pxlo: Math.max(parentArea.pxlo, pxlo),
		pxro: Math.min(parentArea.pxro, pxro),
		pxli: Math.max(parentArea.pxli, pxlo - backDeltaX),
		pxri: Math.min(parentArea.pxri, pxro + backDeltaX),
		vyi: parentArea.vyi,
		vyo: parentArea.vyo,
		ty: parentArea.ty,
		parent: parentArea.parent
	};
};

PlatformSearch.prototype._addPlatformToReachable = function(platform, lastArea) {

};

PlatformSearch.prototype._clipAreaToObstacles = function(area) {
	var ltxi = Math.floor(area.pxli / tilesize);
	var rtxi = Math.floor(area.pxri / tilesize);
	var ltxo = Math.floor(area.pxlo / tilesize);
	var rtxo = Math.floor(area.pxro / tilesize);

	var ty = area.ty;

	var platformMap = this._platformMap;
	var platform;

	for (var ltx = ltxi; ltx > ltxo; ltx--) {
		platform = platformMap.tileAt(ltx, ty);
		if (platform & RIGHT) break;
	}
	var pxlo = ltx * tilesize;
	if (pxlo > area.pxlo) {
		area.pxlo = pxlo;
		area.clampParent = true;
	}

	for (var rtx = rtxi; rtx < rtxo; rtx++) {
		platform = platformMap.tileAt(rtx, ty);
		if (platform & LEFT) break;
	}
	var pxro = rtx * tilesize;
	if (pxro < area.pxro) {
		area.pxro = pxro;
		area.clampParent = true;	
	}
};

PlatformSearch.prototype._splitArea = function(area, res) {
	var ltxo = Math.floor(area.pxlo / tilesize);
	var rtxo = Math.floor(area.pxro / tilesize) + 1;

	var ty = area.ty;

	var platformMap = this._platformMap;
	var platform;

	var leftArea, rightArea;
	
	for (var tx = ltxo; tx < rtxo; tx++) {
		platform = platformMap.tileAt(tx, ty);

		if (tx > 0 && (platform & LEFT)) {
			leftArea = this._initializeAreaWithRange(area.parentArea, ltxo, tx, area.vyi);
			rightArea = this._initializeAreaWithRange(area.parentArea, tx, rtxo, area.vyi);
		} else if (tx < rtxo - 1 && (platform & RIGHT)) {
			leftArea = this._initializeAreaWithRange(area.parentArea, ltxo, tx+1, area.vyi);
			rightArea = this._initializeAreaWithRange(area.parentArea, tx+1, rtxo, area.vyi);
		} else {
			continue;
		}

		leftArea.ty = area.ty;
		leftArea.clampParent = true;
		this._clipAreaToObstacles(leftArea);
		this._splitArea(leftArea, res);

		rightArea.ty = area.ty;
		rightArea.clampParent = true;
		this._clipAreaToObstacles(rightArea);
		this._splitArea(leftArea, res);
		break;
	}

	res.push(area);
};

PlatformSearch.prototype._initialChildPass = function(parentArea) {

	var childAreas = [];

	var travelDir = parentArea.vyo >= 0 ? DOWN : UP;

	var ctxl = -1;
	var vyi;

	var childArea;

	for (ctxr = parentArea.ltx; ctxr <= parentArea.rtx; ) {
		var platform = this._platformMap.tileAt(ctxr, nty);

		var bouncedDown = (platform & DOWN) && travelDir === UP;
		var landed = (platform & UP) && travelDir === DOWN;

		// finish current area if necessary
		if ((bouncedDown || landed) && ctxl >= 0) {
			childArea = this._initializeAreaWithRange(parentArea, ctxr, platform.tx1, parentArea.vyo);
			childArea.ty = nty;
			childAreas.push(childArea);
			ctxl = -1;
		}
		
		if (bouncedDown) {
			// bounce area
			childArea = this._initializeAreaWithRange(parentArea, ctxr, platform.tx1, 0);
			childArea.ty = parentArea.ty;
			childAreas.push();
			ctxr = platform.tx1;
		}

		else if (landed) {
			// add platforms to reachable
			this._addPlatformToReachable(platform, lastArea);
			ctxr = platform.tx1;
		}

		else {
			if (ctxl < 0) ctxl = ctxr;
			ctxr++;
		}
	}

	if (ctxl >= 0) {
		childArea = this._initializeAreaWithRange(parentArea, ctxl, parentArea.rtx, parentArea.vyo);
		childArea.ty = nty;
		childAreas.push(childArea);
	}

	return childAreas;

};

PlatformSearch.prototype.render = function(x, y, ctx) {
	ctx.save();
	ctx.translate(x, y);
	ctx.fillStyle = "rgba(0, 255, 100, 0.3)";
	for (var a = 0; a < this._currentAreas.length; a++) {
		this.renderArea(ctx, area);
	}
	ctx.restore();
};

PlatformSearch.prototype.renderArea = function(ctx, area) {
	var tilesize = this._platformMap.tilesize;
	ctx.fillRect(area.ltx * tilesize, area.ty * tilesize, (area.rtx+1) * tilesize, (area.ty+1) * tilesize);
};