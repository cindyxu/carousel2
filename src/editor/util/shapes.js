gm.Editor.Util.Shapes = {
	X: function(ctx, x, y) {
		ctx.save();
		ctx.strokeStyle = "red";
		
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
	}
};