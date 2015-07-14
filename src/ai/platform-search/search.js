/* runs A* search over platform/link space */
gm.Ai.PlatformSearch = function() {

	var PlatformUtil = gm.Ai.PlatformUtil;

	var PlatformSearch = function(platformMap, reachable, pxf, pyf) {
		this._platformMap = platformMap;
		this._reachable = reachable;

		var body = this._platformMap._body;

		this._pxf = pxf;
		this._pyf = pyf;
		
		this._openNodes = [];
		this._closedLinks = {};
		this._fxEpsilon = 0.01;

		this._currentNode = undefined;
		this._linkIndex = 0;
		this._currentNeighbor = undefined;
		this._linkStepInc = 0;

		this._originPlatform = PlatformUtil.getPlatformUnderBody(platformMap, body);
		this._renderer = new gm.Ai.PlatformSearch.Renderer(this);

		if (this._originPlatform) {

			var linkObj = this._reachable[this._originPlatform._index];
			if (linkObj) {

				this._currentNode = {
					_platform: this._originPlatform,
					_parent: undefined,
					_link: undefined,
					_pxli: body._x,
					_pxri: body._x + body._sizeX,
					_pxlo: body._x,
					_pxro: body._x + body._sizeX,
					_gx: 0,
					_fx: this._euclideanDistance((body._x + body._sizeX) / 2, 
						platformMap._map.tileToPosY(this._originPlatform._ty))
				};

				if (LOGGING) {
					console.log("%%%%%%%%% start node %%%%%%%%%");
					console.log("gx:", this._currentNode._gx);
					console.log("fx:", this._currentNode._fx);
					console.log("pxlo:", this._currentNode._pxlo);
					console.log("pxro:", this._currentNode._pxro);
				}

				this._currentNeighbor = this._resolveLink(this._currentNode,
					linkObj._links[this._linkIndex]);

				if (!this._currentNeighbor) this.stepLink();
			}
		}
	};

	PlatformSearch.prototype._resolveLink = function(node, nlink) {
		lfx = Number.POSITIVE_INFINITY;
		if (this._closedLinks[nlink._tag] !== undefined) {
			lfx = this._closedLinks[nlink._tag];
		}

		var neighborNode = this._getNeighborNode(node, nlink);
		if (neighborNode._gx !== node._gx && neighborNode._fx < lfx) {
			
			if (LOGGING) {
				console.log("%%%%%%%%% next node %%%%%%%%%");
				console.log(neighborNode._fx, "<", lfx);
				console.log(nlink);

				var s = "";
				var cnode = node;
				while (cnode) {
					s = cnode._platform._index + " " + s;
					cnode = cnode._parent;
				}

				console.log("platform chain:", s);
				console.log("gx:", neighborNode._gx);
				console.log("fx:", neighborNode._fx);
				if (neighborNode._parent) {
					console.log("ppxlo:", neighborNode._parent._pxlo);
					console.log("ppxro:", neighborNode._parent._pxro);
				}
				console.log("pxli:", neighborNode._pxli);
				console.log("pxri:", neighborNode._pxri);
				console.log("pxlo:", neighborNode._pxlo);
				console.log("pxro:", neighborNode._pxro);
			}

			this._openNodes.push(neighborNode);
			this._closedLinks[nlink._tag] = neighborNode._fx;
			this._neighborNode = neighborNode;
			return neighborNode;
		}
	};

	var sortFunction = function(n1, n2) {
		return n1._fx - n2._fx;
	};

	PlatformSearch.prototype._getNeighborNode = function(node, nlink) {
		var sizeX = this._platformMap._body._sizeX;
		var sizeY = this._platformMap._body._sizeY;

		// starting range of current node in fromPlatform
		var lpxli = nlink._pxli;
		var lpxri = nlink._pxri;

		// range in fromPlatform to start jumping/falling from (may need to walk there)
		var pxli = Math.min(Math.max(node._pxlo, lpxli), lpxri - sizeX);
		var pxri = Math.min(Math.max(node._pxro, lpxli + sizeX), lpxri);

		var walkDist = Math.max(0, Math.min(pxli + sizeX - node._pxlo, node._pxro - sizeX - pxri));
		var walkTime = walkDist / this._platformMap._kinematics._walkSpd;

		// landing range in toPlatform
		var pxlo = Math.min(Math.max(pxli - nlink._maxDeltaX, nlink._pxlo), nlink._pxro);
		var pxro = Math.min(Math.max(pxri + nlink._maxDeltaX, nlink._pxlo), nlink._pxro);

		var gx = node._gx + walkTime + nlink._totalTime;
		var fx = gx + this._euclideanDistance((pxlo + pxro) / 2,
				this._platformMap._map.tileToPosY(nlink._toPlatform._ty)) / this._platformMap._kinematics._walkSpd;

		var neighborNode = {
			_platform: nlink._toPlatform,
			_parent: node,
			_link: nlink,
			_pxli: pxli,
			_pxri: pxri,
			_pxlo: pxlo,
			_pxro: pxro,
			_gx: gx,
			_fx: fx
		};

		if (LOGGING) {
			console.log("######### check neighbor");
			console.log("walkTime:", walkTime);
			console.log("jumpTime:", nlink._totalTime);
		}

		return neighborNode;
	};

	// for rendering purposes only. 
	PlatformSearch.prototype.stepLinkIncrement = function() {

		if (LOGGING) {
			console.log("STEP *************************************");
			if (this._currentNode) {
				console.log("platform index:", this._currentNode._platform._index);
				console.log("link index:", this._linkIndex);
				console.log("link step inc:", this._linkStepInc);
			}
		}

		if (!this._currentNode) return;

		if (this._linkStepInc < 3) {
			this._linkStepInc++;
			return true;
		}

		else return this.stepLink();
	};

	PlatformSearch.prototype.stepLink = function() {

		if (!this._currentNode) return false;

		var platform = this._currentNode._platform;
		if (!this._reachable[platform._index]) return false;

		if (this._reachable[platform._index]._links[this._linkIndex+1]) {
			this._linkIndex++;
		
		} else {
			this._openNodes.sort(sortFunction);
			this._currentNode = this._openNodes.shift();
			
			if (!this._currentNode) return false;
			
			platform = this._currentNode._platform;
			if (!this._reachable[platform._index]) return false;
			
			this._linkIndex = 0;
		}
		
		this._linkStepInc = 0;
		this._currentNeighbor = this._resolveLink(this._currentNode, 
				this._reachable[platform._index]._links[this._linkIndex]);
		if (!this._currentNeighbor) return this.stepLink();

		return true;
	};

	PlatformSearch.prototype.stepNode = function() {
		var currentNode = this._currentNode;
		
		if (!currentNode) return false;
		var platform = this._currentNode._platform;
		if (!this._reachable[platform._index]) return false;
		
		while (this.stepLink()) {
			if (currentNode !== this._currentNode) break;
		}
		return true;
	};

	PlatformSearch.prototype._euclideanDistance = function(px, py) {
		var dx = this._pxf - px;
		var dy = this._pyf - py;
		return Math.sqrt(dx*dx + dy*dy);
	};

	var pres = {};
	PlatformSearch.prototype.render = function(ctx, bbox) {
		this._platformMap.tileToPos(0, 0, pres);
		this._renderer.render(ctx, pres.x, pres.y, bbox);
	};

	return PlatformSearch;
}();