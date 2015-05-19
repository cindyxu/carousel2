if (!gm.Editor) gm.Editor = {};
if (!gm.Editor.Util) gm.Editor.Util = {};

var pres = {};
var tres = {};

var Selector = gm.Editor.Util.Selector = function(layerMap) {

	var selector = this;
	selector.layerMap = layerMap;

	selector._origtx = undefined;
	selector._origty = undefined;

	selector._endtx = undefined;
	selector._endty = undefined;
};

Selector.prototype.start = function(gx, gy) {
	var selector = this;

	selector.layerMap.posToTile(gx, gy, tres);

	selector._origtx = tres.tx;
	selector._origty = tres.ty;
};

Selector.prototype.update = function(gx, gy) {

	var selector = this;

	selector.layerMap.posToTile(gx, gy, tres);

	selector._endtx = tres.tx;
	selector._endty = tres.ty;
};

Selector.prototype.reset = function() {
	this._origtx = undefined;
	this._origty = undefined;
};

Selector.prototype.finish = function() {
	var selector = this;
	if (selector._origtx === undefined || 
		selector._origty === undefined) {
		return selector.reset();
	}
	
	var res = {
		tx0: Math.min(selector._origtx, selector._endtx),
		ty0: Math.min(selector._origty, selector._endty),
		tx1: Math.max(selector._origtx, selector._endtx),
		ty1: Math.max(selector._origty, selector._endty)
	};

	selector.reset();
	return res;
};

var res0 = {}, res1 = {};
Selector.prototype.render = function(ctx, bbox) {

	var selector = this;

	var tilesize = selector.layerMap._map.tilesize;

	var trx0, trx1, try0, try1;

	if (selector._origtx === undefined || selector._origty === undefined) {

		trx0 = trx1 = selector._endtx;
		try0 = try1 = selector._endty;

	} else {
		
		trx0 = Math.min(selector._origtx, selector._endtx);
		trx1 = Math.max(selector._origtx, selector._endtx);
		
		try0 = Math.min(selector._origty, selector._endty);
		try1 = Math.max(selector._origty, selector._endty);

	}

	selector.layerMap.tileToPos(trx0, try0, res0);
	selector.layerMap.tileToPos(trx1, try1, res1);

	ctx.save();
	ctx.fillStyle = gm.Settings.Editor.colors.SELECT;
	ctx.fillRect(res0.x - bbox.x0, res0.y - bbox.y0, 
		res1.x - res0.x + tilesize, res1.y - res0.y + tilesize);
	ctx.restore();

};