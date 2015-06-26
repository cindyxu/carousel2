gm.TransformFunctions = {
	linear: function(velX, velY) {
		return function(x, y, t, res) {
			res.x = x + velX * t;
			res.y = y + velY * t;
		};
	},

	oscillateX: function(rad, freq, dim) {
		return function(x, y, t, res) {
			res.x = x + Math.sin(t * freq) * rad;
			res.y = y;
		};
	},

	oscillateY: function(rad, freq, dim) {
		return function(x, y, t, res) {
			res.x = x;
			res.y = x + Math.sin(t * freq) * rad;
		};
	},

	oscillateCircle: function(rad, freq, dim) {
		return function(x, y, t, res) {
			res.x = x + Math.sin(t * freq) * rad;
			res.y = y + Math.cos(t * freq) * rad;
		};
	},	
};