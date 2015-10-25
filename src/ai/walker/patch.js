/* extends from gm.Ai.Walker._PlatformArea. represents landing on a platform.
 * ppxl and ppxr represent the left and right bounds of the platform
 * which may be more confined than pxlo/pxro if the body extends over the edge.
 */

gm.Ai.Walker.PlatformPatch = function() {

	var _PlatformArea = gm.Ai.Walker._PlatformArea;

	var PlatformPatch = function(parent, ppxl, ppxr, pxli, pxri) {
		
		var cpxli = (pxli === undefined ? undefined : Math.max(parent._pxlo, pxli));
		var cpxri = (pxri === undefined ? undefined : Math.min(parent._pxro, pxri));

		var cppxl = Math.min(Math.max(ppxl, cpxli), cpxri);
		var cppxr = Math.min(Math.max(ppxl, cpxli), cpxri);

		_PlatformArea.call(this, parent, undefined, cpxli, cpxri);

		this._ppxl = ppxl;
		this._ppxr = ppxr;
	};

	PlatformPatch.prototype = Object.create(_PlatformArea.prototype);

	PlatformPatch.prototype.clone = function() {
		var clone = _PlatformArea.prototype.clone.call(this);
		clone._ppxl = this._ppxl;
		clone._ppxr = this._ppxr;
		return clone;
	};

	PlatformPatch.prototype.clip = function(pxli, pxri, pxlo, pxro) {
		_PlatformArea.prototype.clip.call(this, pxli, pxri, pxlo, pxro);
		clone._ppxl = Math.min(Math.max(clone._ppxl, clone._pxlo), clone._pxro);
		clone._ppxr = Math.max(Math.min(clone._ppxr, clone._pxro), clone._pxlo);
	};

	return PlatformPatch;

}();