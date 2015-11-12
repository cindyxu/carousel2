gm.DialogueBox = function() {

	/*
	sample characters:
	{
		"prince": {
			profile: "prince.png"
		}
	}
	
	sample dialogue:
	[{
		character: "prince",
		segments: [{
			speed: 1,
			pause: 0,
			newline: false,
			color: "black",
			text: "Hey, what's this? Yoinks!"
		}]
	}];

	sample formatted dialogue:
	[{
		portrait: "prince.png", 
		name: "prince",
		lines: [
			[{
				speed: 1,
				pause: 0,
				color: "black",
				text: "Hey, what's this? "
			}, {
				speed: 2,
				pause: 0,
				color: "red",
				text: "Yoinks!"
			}],
			undefined // break
		]
	}]
	*/

	var _DialogueAnimator = function(lines) {
		this._lines = lines;
		this._lineIndex = 0;
		this._segmentIndex = 0;
		this._characterIndex = 0;
	};

	_DialogueAnimator.prototype.update = function(dt) {

	};

	_DialogueAnimator.prototype.render = function(ctx, offset) {
		for (var i = 0; i <= this._lineIndex; i++) {
			for (var j = 0; j <= this._segmentIndex; j++) {
				var lineSegment = this._lines[i][j];
				if (i === this._lineIndex && j === this._segmentIndex) {
					
				} else {
					
				}
			}
		}
	};

	var DialogueBox = {
		_showing: false,
		_callback: undefined,
		_copyCanvas: undefined,
		_characterProfiles: undefined,
		_width: 0
	};

	DialogueBox._init = function(characterProfiles, width) {
		this._width = width;
		this._characterProfiles = characterProfiles;
		this._copyCanvas = $("canvas").attr({
			width: width,
			height: Math.max(gm.Settings.Dialogue.HEIGHT, gm.Settings.Dialogue.PORTRAIT_HEIGHT)
		});
	};

	DialogueBox._getMaxLineWidth = function() {
		// make gm.Settings go away from this class eventually
		var portraitWidth = gm.Settings.Dialogue.PORTRAIT_WIDTH;
		var marginWidth = gm.Settings.Dialogue.MARGIN_LEFT + gm.Settings.Dialogue.MARGIN_RIGHT;
		return this._width - portraitWidth - marginWidth;
	};

	DialogueBox._formatDialogueJSON = function(dialogueJSON) {
		var formattedDialogue = [];
		for (var i = 0; i < dialogueJSON.length; i++) {
			var profile = this._characterProfiles[dialogueJSON[i].name];
			formattedDialogue.push({
				portrait: profile._portrait,
				name: profile._name,
				lines: this._formatSegmentsJSON(dialogueJSON[i].segments)
			});
		}
	};

	DialogueBox._formatSegmentsJSON = function(segments) {

		var ctx = this._copyCanvas.getContext("2d");

		var maxLineWidth = this._getMaxLineWidth;
		var lines = [];
		var currentLine = [];
		var currentLineWidth = 0;
		
		for (var i = 0; i < segments.length; i++) {
			var segment = segments[i];
			var segmentWords = segment.text.split(" ");
			var currentLineSegment = {
				text: "",
				speed: segment.speed,
				color: segment.color,
				pause: segment.pause
			};
			
			for (var w = 0; w < segmentWords.length; w++) {
				var word = segmentWords[w];
				wordWidth = ctx.measureText(word).width;
		
				if (wordWidth + currentLineWidth < maxLineWidth) {
					currentLineSegment.text += word;
					currentLineWidth += wordWidth;
		
				} else {
					if (currentLineSegment.text.length > 0) {
						currentLine.push(currentLineSegment);
					}
					lines.push(currentLine);
					currentLine = [];
					currentLineSegment = {
						text: word,
						speed: segment.speed,
						color: segment.color,
						pause: segment.pause
					};
					currentLineWidth = wordWidth;
				}
			}
			if (currentLineSegment.text.length > 0) {
				currentLine.push(currentLineSegment);
				if (segment.newline) {
					lines.push(currentLine);
					currentLine = [];
					currentLineWidth = 0;
				}
			}
		}
		if (currentLine.length > 0) {
			lines.push(currentLine);
		}
		return lines;
	};

	DialogueBox.show = function(show) {
		this._showing = show;
	};

	DialogueBox.startDialogue = function(dialogueJSON, ctx, callback) {
		this._formattedDialogue = this._formatSegmentsJSON(dialogue);
		this._ctx = ctx;
		this._callback = callback;
	};

	DialogueBox.render = function(ctx) {
		if (this._showing) {
			ctx.save();
			ctx.fillStyle = "white";
			ctx.fillRect(0, 0, this._width, gm.Settings.Dialogue.HEIGHT);

			if (this._dialogue) {
				var portrait = this._dialogue.portrait;
				var portraitHeight = gm.Settings.Dialogue.PORTRAIT_HEIGHT;
				var portraitWidth = portraitHeight * portrait.image.width/portrait.image.height;
				ctx.drawImage(portrait.image, 0, 0, 
					portraitWidth,
					portraitHeight);

				this._dialogueAnimator.render(ctx);
			}
		}
	};

	DialogueBox.onAction = function() {

	};

	return DialogueBox;
};