var $canvas, ctx;

var createCanvas = function() {
  $canvas = $("<canvas/>")
    .prop({
      width: gm.Settings.Game.WIDTH,
      height: gm.Settings.Game.HEIGHT
    });
    
  $("#game").append($canvas);
  ctx = $canvas[0].getContext("2d");

  ctx.mozImageSmoothingEnabled = false;
  ctx.webkitImageSmoothingEnabled = false;
  ctx.msImageSmoothingEnabled = false;
  ctx.imageSmoothingEnabled = false;
};

var setupGameLoop = function() {
  var onEachFrame;
  if (window.webkitRequestAnimationFrame) {
    onEachFrame = function(cb) {
      var _cb = function() { cb(); webkitRequestAnimationFrame(_cb); };
      _cb();
    };
  } else if (window.mozRequestAnimationFrame) {
    onEachFrame = function(cb) {
      var _cb = function() { cb(); mozRequestAnimationFrame(_cb); };
      _cb();
    };
  } else {
    onEachFrame = function(cb) {
      setInterval(cb, 1000 / 60);
    };
  }
  
  window.onEachFrame = onEachFrame;
};

$(function() {
  createCanvas();

  gm.Game.init();
  gm.Editor.init();
  gm.Input.bind($("#game"), $canvas);

  setupGameLoop();

  window.onEachFrame(function() {
    gm.Game.update();
    gm.Editor.update();
    gm.Game.render(ctx);
    gm.Editor.render(ctx);

    gm.Input.reset();
  });

});
