var input = gm.Input = {
	mousedown: false,
	mouseX: 0,
	mouseY: 0,
	lastMouseX: 0,
	lastMouseY: 0,
	lastClickedX: 0,
	lastClickedY: 0,
	pressed: {},
	down: {},
	bindings: {
		keydown: {},
		keyup: {},
		mousedown: undefined,
		mousemove: undefined,
		mouseup: undefined
	}
};

input.bind = function($canvas) {
	input.canvas = $canvas[0];
	
	$canvas.mousedown(input.mousedownEvt);
	$canvas.mousemove(input.mousemoveEvt);
	$canvas.mouseup(input.mouseupEvt);

	$(document).keydown(input.keydownEvt);
	$(document).keyup(input.keyupEvt);
};

input.reset = function() {
	for (var k in input.pressed) {
		input.pressed[k] = false;
	}
};

input.mousedownEvt = function(e) {
	input.mousedown = true;

	input.lastClickedX = e.pageX - this.offsetLeft;
	input.lastClickedY = e.pageY - this.offsetTop;

	if (input.bindings.mousedown) {
		input.bindings.mousedown();
	}
};

input.mousemoveEvt = function(e) {
	input.lastMouseX = input.mouseX;
	input.lastMouseY = input.mouseY;
	
	input.mouseX = e.pageX - this.offsetLeft;
	input.mouseY = e.pageY - this.offsetTop;
	
	if (input.bindings.mousemove) {
		input.bindings.mousemove();
	}
};

input.mouseupEvt = function(e) {
	input.mousedown = false;

	if (input.bindings.mouseup) {
		input.bindings.mouseup();
	}
	return false;
};

input.keyToString = function(e) {

	if (e.keyCode >= 48 && e.keyCode < 91) {
		return String.fromCharCode(e.keyCode);
	}
	
	if (e.keyCode === 37) {
		return 'left';
	}
	if (e.keyCode === 38) {
		return 'up';
	}
	if (e.keyCode === 39) {
		return 'right';
	}
	if (e.keyCode === 40) {
		return 'down';
	}
	if (e.keyCode === 8) {
		return 'backspace';
	}
	if (e.keyCode === 9) {
		return 'tab';
	}
	if (e.keyCode === 13) {
		return 'return';
	}
	if (e.keyCode === 16) {
		return 'shift';
	}
	if (e.keyCode === 17) {
		return 'ctrl';
	}
	if (e.keyCode === 18) {
		return 'alt';
	}
	if (e.keyCode === 32) {
		return 'space';
	}
};

input.keydownEvt = function(e) {
	if (document.activeElement !== document.body) return;

	var kstr = input.keyToString(e);
	input.pressed[kstr] = true;
	input.down[kstr] = true;
	if (input.bindings.keydown[kstr]) {
		input.bindings.keydown[kstr]();
	}
};

input.keyupEvt = function(e) {
	if (document.activeElement !== document.body) return;

	var kstr = input.keyToString(e);
	input.down[kstr] = false;
	if (input.bindings.keyup[kstr]) {
		input.bindings.keyup[kstr]();
	}
};

input.setListener = function(eventType, args0, args1) {
	var callback, eventParam;
	// mouse
	if (eventType.indexOf('mouse') >= 0) {
		callback = args0;
		input.bindings[eventType] = callback;
	}
	// key
	else {
		eventParam = args0;
		callback = args1;
		input.bindings[eventType][eventParam] = callback;
	}
};

