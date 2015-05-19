var TILES_X = 15;
var TILES_Y = 15;
var TILESIZE = 32;

var camera = new gm.Camera({
	sizeX : TILES_X * TILESIZE, 
	sizeY: TILES_Y * TILESIZE
});

var tileMap = new gm.Map({
	tilesX: TILES_X,
	tilesY: TILES_Y,
	tilesize: TILESIZE
});

var tileLayerMap = new gm.LayerMap();
tileLayerMap.setMap(tileMap);

var tileLayer = new gm.Layer("tileMap", tileLayerMap);

var navGrid = new gm.NavGrid();
navGrid.fromLayers([tileLayer]);

var render = function(ctx) {
	navGrid.render(ctx, camera._body.getBbox());
};

var brush = new gm.Editor.Tools.Brush(tileLayer);

$(function() {
	var $canvas = $("<canvas/>")
	.prop({
		width: TILESIZE * TILES_X,
		height: TILESIZE * TILES_Y
	});
	$("#game").append($canvas);

	ctx = $canvas[0].getContext("2d");
	render(ctx);
});