gm.Input = function() {

	var Input = {
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

	Input.bind = function($canvas) {
		Input.canvas = $canvas[0];
		
		$canvas.mousedown(Input.mousedownEvt);
		$canvas.mousemove(Input.mousemoveEvt);
		$canvas.mouseup(Input.mouseupEvt);

		$(document).keydown(Input.keydownEvt);
		$(document).keyup(Input.keyupEvt);
	};

	Input.reset = function() {
		for (var k in Input.pressed) {
			Input.pressed[k] = false;
		}
	};

	Input.mousedownEvt = function(e) {
		Input.mousedown = true;

		Input.lastClickedX = e.pageX - this.offsetLeft;
		Input.lastClickedY = e.pageY - this.offsetTop;

		if (Input.bindings.mousedown) {
			Input.bindings.mousedown(Input.lastClickedX, Input.lastClickedY);
		}
	};

	Input.mousemoveEvt = function(e) {
		Input.lastMouseX = Input.mouseX;
		Input.lastMouseY = Input.mouseY;
		
		Input.mouseX = e.pageX - this.offsetLeft;
		Input.mouseY = e.pageY - this.offsetTop;
		
		if (Input.bindings.mousemove) {
			Input.bindings.mousemove(Input.mouseX, Input.mouseY);
		}
	};

	Input.mouseupEvt = function(e) {
		Input.mousedown = false;

		if (Input.bindings.mouseup) {
			Input.bindings.mouseup(Input.mouseX, Input.mouseY);
		}
		return false;
	};

	Input.keyToString = function(e) {

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

	Input.keydownEvt = function(e) {
		if (document.activeElement !== document.body) return;

		var kstr = Input.keyToString(e);
		Input.pressed[kstr] = true;
		var wasDown = Input.down[kstr];
		Input.down[kstr] = true;

		if (!wasDown && Input.bindings.keydown[kstr]) {
			Input.bindings.keydown[kstr]();
		}
	};

	Input.keyupEvt = function(e) {
		if (document.activeElement !== document.body) return;

		var kstr = Input.keyToString(e);
		Input.down[kstr] = false;
		if (Input.bindings.keyup[kstr]) {
			Input.bindings.keyup[kstr]();
		}
	};

	Input.setListener = function(eventType, args0, args1) {
		var callback, eventParam;
		// mouse
		if (eventType === 'mousedown' || 
			eventType === 'mousemove' || 
			eventType === 'mouseup') {

			callback = args0;
			Input.bindings[eventType] = callback;
		}
		// key
		else if (eventType === 'keydown' || eventType === 'keyup') {
			eventParam = args0;
			callback = args1;
			if (LOGGING && typeof eventParam !== 'string') console.log("!!! Input - set listener - no key specified");
			Input.bindings[eventType][eventParam] = callback;

		} else {
			if (LOGGING) console.log("!!! Input - listen event", eventType, "not supported");
		}
	};

	return Input;

}();