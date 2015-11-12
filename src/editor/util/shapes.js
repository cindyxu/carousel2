if (!gm.Editor.Util) gm.Editor.Util = {};

gm.Editor.Util.Shapes = {
	X: function(ctx, x, y, color) {
		ctx.save();
		ctx.strokeStyle = color || "red";
		
		ctx.beginPath();
		ctx.moveTo(x - 20, y - 20);
		ctx.lineTo(x + 20, y + 20);
		ctx.closePath();
		ctx.stroke();

		ctx.beginPath();
		ctx.moveTo(x + 20, y - 20);
		ctx.lineTo(x - 20, y + 20);
		ctx.closePath();
		ctx.stroke();
		
		ctx.restore();
	},

	O: function(ctx, x, y, color) {
		ctx.save();
		ctx.fillStyle = color || "rgba(0,200,255,0.5)";
		ctx.beginPath();
		ctx.arc(x, y, 20, 0, 2 * Math.PI, false);
		ctx.fill();
		ctx.restore();
	}
};