var LOGGING = gm.Settings.LOGGING;

var imageCache = {};

gm.ImageResource = function(source) {
	this.source = source;
	if (!source && LOGGING) console.log("!!! new image resource - no source");
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
				ires.image.onerror = function() {
					if (internalOnError) internalOnError();
					if (LOGGING) console.log("failed to get image", ires.source);
					errorCallback();
				};
			}
		}
	}
};