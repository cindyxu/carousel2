if (!gm.Ai) gm.Ai = {};
if (!gm.Ai) gm.Ai = {};

gm.Ai._PlatformArea = function() {
	var _PlatformArea = function(parent, vyi, pxli, pxri, pyi, vyo, pxlo, pxro, pyo) {
		this._vyi = vyi;
		this._pxli = pxli;
		this._pxri = pxri;
		this._pyi = pyi;
		
		this._vyo = vyo;
		this._pxlo = pxlo;
		this._pxro = pxro;
		this._pyo = pyo;

		this._parent = parent;

		if (parent !== undefined) {
			if (vyi === undefined) this._vyi = parent._vyo;
			if (pxli === undefined) this._pxli = parent._pxlo;
			if (pxri === undefined) this._pxri = parent._pxro;
			if (pyi === undefined) this._pyi = parent._pyo;
		}

		if (vyo === undefined) this._vyo = this._vyi;
		if (pxlo === undefined) this._pxlo = this._pxli;
		if (pxro === undefined) this._pxro = this._pxri;
		if (pyo === undefined) this._pyo = this._pyi;
	};

	_PlatformArea.prototype.clone = function() {
		return new _PlatformArea(this._parent,
			this._vyi,
			this._pxli,
			this._pxri,
			this._pyi,
			this._vyo,
			this._pxlo,
			this._pxro,
			this._pyo);
	};

	_PlatformArea.prototype.reparent = function(parent) {
		this._parent = parent;
	};

	_PlatformArea.prototype.setAltitude = function(vyo, pyo) {
		this._vyo = vyo;
		this._pyo = pyo;
	};

	_PlatformArea.prototype.setSpread = function(pxlo, pxro) {
		this._pxlo = pxlo;
		this._pxro = pxro;
	};

	_PlatformArea.prototype.clip = function(pxli, pxri, pxlo, pxro) {
		this._pxli = Math.max(pxli, this._pxli);
		this._pxri = Math.min(pxri, this._pxri);

		if (pxlo !== undefined) {
			if (this._pxlo !== undefined) this._pxlo = Math.max(pxlo, this._pxlo);
			else this._pxlo = pxlo;
		}
		
		if (pxro !== undefined) {
			if (this._pxro !== undefined) this._pxro = Math.min(pxro, this._pxro);
			else this._pxro = pxlo;
		}
	};

	// static constructors

	gm.Ai.PlatformArea = {};

	gm.Ai.PlatformArea.fromPlatform = function(vyi, pxli, pxri, pyi) {
		return new _PlatformArea(undefined, vyi, pxli, pxri, pyi);
	};

	gm.Ai.PlatformArea.fromArea = function(parent, pxli, pxri, vyi) {
		var cpxli = (pxli === undefined ? undefined : Math.max(parent._pxlo, pxli));
		var cpxri = (pxri === undefined ? undefined : Math.min(parent._pxro, pxri));
		return new _PlatformArea(parent, vyi, cpxli, cpxri);
	};

	return _PlatformArea;
}();