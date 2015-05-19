var refMap;
var areaMap;

var ltx0, lty0, ltx1, lty1;

function updateAreaMap(tx0, ty0, tx1, ty1) {

	if (ltx1 < tx1) {
		expand(ltx1, tx1, lty0, lty1, RIGHT);
	} else if (ltx0 > tx0) {
		expand(tx0, ltx0, lty0, lty1, LEFT);
	}
	if (lty1 < ty1) {
		expand(ltx0, lty1, ltx1, ty1, DOWN);
	} else if (lty0 > ty0) {
		expand(ltx0, ty0, ltx1, lty0, UP);
	}

	if (ltx1 < tx1) {
		if (lty1 < ty1) {
			expand(ltx1, lty1, tx1, ty1, DOWN);
		} else if (lty0 > ty0) {
			expand(ltx1, ty0, tx1, lty0, UP);
		}
	}
	else if (ltx0 > tx0) {
		if (lty1 < ty1) {
			expand(tx0, lty1, ltx0, ty1, DOWN);
		} else if (lty0 > ty0) {
			expand(tx0, ty0, ltx0, lty0, UP);
		}
	}

	ltx0 = tx0;
	lty0 = ty0;
	ltx1 = tx1;
	lty1 = ty1;
}

function captureFirst(tx0, ty0, tx1, ty1) {
	for (var ty = ty0; ty < ty1; ty++) {
		for (var tx = tx0; tx < tx1; tx++) {
			
		}
	}
}

function expand(tx0, ty0, tx1, ty1, dir) {

	var tx, ty;
	if (dir === LEFT) {
		for (tx = tx1-1; tx >= tx0; tx--) {
			expandColumn(tx, tx+1, ty0, ty1);
		}
	} else if (dir === RIGHT) {
		for (tx = tx0; tx < tx1; tx++) {
			expandColumn(tx, tx-1, ty0, ty1);
		}
	} else if (dir === UP) {
		for (ty = ty1-1; ty >= ty1; ty--) {
			expandRow(tx0, tx1, ty, ty+1);
		}
	} else if (dir === DOWN) {
		for (ty = ty0; ty < ty1; ty++) {
			expandRow(tx0, tx1, ty, ty-1);
		}
	}
}

function expandRow(tx0, tx1, nty, cty) {
	var currentArea;
	var startX = -1;
	for (var tx = tx0; tx < tx1; tx++) {
		
		if (currentArea) {
			if (currentArea.tx1 === tx) {
				expandArea(currentArea, (nty < cty ? UP : DOWN));
				currentArea = undefined;
				startX = -1;
			}
			else if (areaMap.tileAt(tx, nty) || refMap.tileAt(tx, cty)) {
				createArea(startX, nty, tx, nty+1);
				currentArea = undefined;
				startX = -1;
			}
		}

		if (!currentArea) {
			var nextArea = areaMap.tileAt(tx, cty);
			if (nextArea.tx0 === tx) {
				currentArea = nextArea;
				startX = tx;
			}
		}
	}

	if (currentArea) {
		createArea(startX, nty, tx1, nty+1);
	}
}

function expandColumn(ntx, ctx, ty0, ty1) {
	var currentArea;
	var startY = -1;
	for (var ty = ty0; ty < ty1; ty++) {

		if (currentArea) {
			if (currentArea.ty1 === ty) {
				expandArea(currentArea, (ntx < ctx ? LEFT : RIGHT));
				currentArea = undefined;
				startY = -1;
			}
			else if (areaMap.tileAt(ntx, ty) || refMap.tileAt(ctx, ty)) {
				createArea(ntx, startY, ntx+1, ty);
				currentArea = undefined;
				startY = -1;
			}
		}

		if (!currentArea) {
			var nextArea = areaMap.tileAt(ctx, ty);
			if (nextArea.ty0 === ty) {
				currentArea = nextArea;
				startY = ty;
			}
		}
	}

	if (currentArea) {
		createArea(ntx, startY, ntx+1, ty1);
	}
}

function mergeColumnSeam(ntx, ctx, ty0, ty1) {
	var ty = ty0;
	while (ty < ty1) {
		var area = areaMap.tileAt(ctx, ty);
		if (area) {
			var tyy = ty;
			var awidth = -1;
			while (tyy < area.ty1) {
				var narea = areaMap.tileAt(ntx, tyy);
				var nawidth = narea.tx1 - narea.tx0;
				
				if (!narea) break;
				if (narea.ty1 > area.ty1) break;
				if (awidth >= 0) {
					if (nawidth !== awidth) break;
				} else awidth = nawidth;

				if (narea.ty1 === area.ty1) {
					createArea()
				}
			}
			ty = area.ty1;
		} else ty++;
	}
}