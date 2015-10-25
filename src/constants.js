gm.Constants = {};

gm.Constants.Dim = {
	X: 1,
	Y: 1 << 1
};

gm.Constants.Dir = {
	LEFT: 1,
	RIGHT: 1 << 1,
	UP: 1 << 2,
	DOWN: 1 << 3,
	NORTHWEST: 1 << 4,
	NORTHEAST: 1 << 5,
	SOUTHWEST: 1 << 6,
	SOUTHEAST: 1 << 7
};

gm.Constants.Ineq = {
	LEQ: -1,
	EQUAL: 0,
	GEQ: 1
};