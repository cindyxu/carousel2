gm.TransformFunctions = {
	linear: function(velX, velY) {
		return function(target, t) {
			target.x += velX * t;
			target.y += velY * t;
		};
	},

	oscillateX: function(rad, freq, dim) {
		return function(target, t) {
			target.x += Math.sin(t * freq) * rad;
		};
	},

	oscillateY: function(rad, freq, dim) {
		return function(target, t) {
			target.y += Math.sin(t * freq) * rad;
		};
	},

	oscillateCircle: function(rad, freq, dim) {
		return function(target, t) {
			target.x += Math.sin(t * freq) * rad;
			target.y += Math.cos(t * freq) * rad;
		};
	},	
};