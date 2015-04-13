var imageCache = {};

gm.ImageResource = function(source) {
	this.source = source;
};

gm.ImageResource.prototype.load = function(callback) {
	var ires = this;
	var image;

	var loadCallback = callback ? function() { callback(image); } : undefined;
	var errorCallback = callback ? function() { callback(); } : undefined;

	if (!imageCache[ires.source]) {
		image = ires.image = new Image();
		if (loadCallback) ires.image.onload = loadCallback;
		if (errorCallback) ires.image.onerror = errorCallback;
		ires.image.src = ires.source;
		imageCache[ires.source] = ires.image;
	}
	else {
		image = ires.image = imageCache[ires.source];
		if (loadCallback) {
			
			if (!ires.image.complete) {
				var internalOnLoad = ires.image.onload;
				if (internalOnLoad) {
					ires.image.onload = function() {
						internalOnLoad();
						loadCallback();
					};
				} else {
					ires.image.onload = loadCallback;
				}
			} else {
				loadCallback();
			}
		}

		if (errorCallback) {
			if (!ires.image.complete) {
				var internalOnError = ires.image.onerror;
				if (internalOnError) {
					ires.image.onerror = function() {
						internalOnError();
						errorCallback();
					};
				} else {
					ires.image.onerror = errorCallback;
				}
			}
		}
	}
};