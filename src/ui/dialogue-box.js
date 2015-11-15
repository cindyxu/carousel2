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
			delay: 0,
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
				delay: 0,
				color: "black",
				text: "Hey, what's this? "
			}, {
				speed: 2,
				delay: 0,
				color: "red",
				text: "Yoinks!"
			}],
			undefined // break
		]
	}]
	*/

	var _DialogueAnimator = function(dialogue, copyCtx) {
		this._dialogue = dialogue;
		this._copyCtx = copyCtx;

		this._lineIndex = 0;
		this._segmentIndex = 0;
		this._characterIndex = 0;
		this._elapsed = 0;
		this._delayed = true;
		this._offsetX = 0;
	};

	_DialogueAnimator.prototype.updateCopyCanvas = function(dt) {
		if (this._lineIndex === this._dialogue.lines.length) return true;

		this._elapsed += dt;
		var line = this._dialogue.lines[this._lineIndex];
		var segment = line[this._segmentIndex];
		
		this._copyCtx.fillStyle = (segment.color ? segment.color : "black");

		while (this._lineIndex < this._dialogue.lines.length && 
			this._elapsed > segment.speed) {

			if (this._delayed) {
				if (this._elapsed < segment.delay) break;
				else {
					this._delayed = false;
					this._elapsed -= segment.delay;
				}
			}
			
			if (this._elapsed > segment.speed) {
				var nextCharacter = segment.text[this._characterIndex];
				this._copyCtx.fillText(nextCharacter, this._offsetX, 
					gm.Settings.Dialogue.LINE_SPACING * (this._lineIndex + 1));
				
				var width = this._copyCtx.measureText(nextCharacter).width;
				this._offsetX += width;
				this._characterIndex++;
			
				if (this._characterIndex === segment.text.length) {
					this._characterIndex = 0;
					this._segmentIndex++;
					this._delayed = true;

					if (this._segmentIndex === line.length) {
						this._offsetX = 0;
						this._segmentIndex = 0;
						this._lineIndex++;
					}
				}
				this._elapsed -= segment.speed;
			}
		}

		return (this._lineIndex === this._dialogue.lines.length);
	};

	var DialogueBox = function(characterProfiles, width) {
		this._showing = false;
		this._callback = undefined;

		this._width = width;
		this._characterProfiles = characterProfiles;
		this._copyCanvas = $("<canvas>").attr({
			width: width,
			height: Math.max(gm.Settings.Dialogue.HEIGHT, gm.Settings.Dialogue.PORTRAIT_HEIGHT)
		})[0];
		this._copyCtx = this._copyCanvas.getContext("2d");
		this._copyCtx.font = "normal 16px '04b03regular'";
	};

	DialogueBox.prototype._getMaxLineWidth = function() {
		// make gm.Settings go away from this class eventually
		var portraitWidth = gm.Settings.Dialogue.PORTRAIT_WIDTH;
		var marginWidth = gm.Settings.Dialogue.MARGIN_LEFT + gm.Settings.Dialogue.MARGIN_RIGHT;
		return this._width - portraitWidth - marginWidth;
	};

	DialogueBox.prototype._formatDialogueJSON = function(dialogueJSON) {
		var formattedDialogue = [];
		for (var i = 0; i < dialogueJSON.length; i++) {
			// var profile = this._characterProfiles[dialogueJSON[i].name];
			var lines = this._formatSegmentsJSON(dialogueJSON[i].segments);
			var MAX_LINES = gm.Settings.Dialogue.MAX_LINES;
			for (var j = 0; j < lines.length; j += MAX_LINES) {
				formattedDialogue.push({
					// portrait: profile._portrait,
					// name: profile._name,
					lines: lines.slice(j * MAX_LINES, j * MAX_LINES + MAX_LINES)
				});
			}
		}
		return formattedDialogue;
	};

	DialogueBox.prototype._formatSegmentsJSON = function(segments) {

		this._copyCtx.save();

		var maxLineWidth = this._getMaxLineWidth();
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
				delay: segment.delay
			};
			
			for (var w = 0; w < segmentWords.length; w++) {
				
				var word = segmentWords[w];
				wordWidth = this._copyCtx.measureText(word).width;

				var wordSpaced = (currentLineWidth === 0 ? word : " " + word);
				wordWidthSpaced = this._copyCtx.measureText(wordSpaced).width;
		
				if (wordWidthSpaced + currentLineWidth < maxLineWidth) {
					currentLineSegment.text += wordSpaced;
					currentLineWidth += wordWidthSpaced;
		
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
						delay: segment.delay
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

		this._copyCtx.restore();

		return lines;
	};

	DialogueBox.prototype._nextDialogueAnimator = function() {
		if (this._formattedDialogue[this._dialogueIndex]) {
			this._dialogueAnimator = new _DialogueAnimator(this._formattedDialogue[this._dialogueIndex], this._copyCtx);
			this._drawNewBox();
		} else {
			this._dialogueAnimator = undefined;
			if (this._callback) this._callback();
		}
	};

	DialogueBox.prototype._drawNewBox = function() {
		this._copyCtx.fillStyle = "yellow";
		this._copyCtx.clearRect(0, 0, this._copyCanvas.width, this._copyCanvas.height);
		this._copyCtx.fillRect(0, 0, this._width, gm.Settings.Dialogue.HEIGHT);
	};

	// have an animation for this?
	DialogueBox.prototype.show = function(show) {
		this._showing = show;
	};

	DialogueBox.prototype.startDialogue = function(dialogueJSON, callback) {
		this._formattedDialogue = this._formatDialogueJSON(dialogueJSON);
		this._dialogueIndex = 0;
		this._callback = callback;

		this._nextDialogueAnimator();
	};

	DialogueBox.prototype.update = function(dt) {
		if (this._dialogueAnimator)  {
			this._dialogueAnimator.updateCopyCanvas(dt);
			if (this._dialogueAnimator._finished && gm.Input.pressed[gm.Settings.Keys.ACTION]) {
				this._nextDialogueAnimator();
			}
		}
	};

	DialogueBox.prototype.render = function(ctx) {
		if (this._showing) {
			ctx.save();
			ctx.drawImage(this._copyCanvas, 0, 0);
			ctx.restore();
		}
	};

	return DialogueBox;
}();