gm.Sprite = function(anims) {
	var sprite = this;

	sprite._anim = null;
	sprite._elapsed = 0;
	sprite._frame = 0;
	sprite._loopCount = 0;
	sprite._running = true;
	sprite._anims = anims;
};

gm.Sprite.prototype.update = function(delta) {
	var sprite = this;
	var anim = sprite._anim;

	if (anim && sprite._running && animFrames.length >= 1 && !sprite.isFinished()) {
		var animFrames = anim.frames;

		// increment current frame
		if (sprite._elapsed + delta > anim.speed) {
			sprite._frame += Math.floor((sprite._elapsed + delta) / anim.speed);

			// increment loop
			if (sprite._frame >= animFrames.length) {
				sprite._loopCount += Math.floor(sprite._frame / animFrames.length);
				
				if (anim.loop) {
					sprite._loopCount = Math.min(sprite._loopCount, anim.loop);
				}

				if (sprite._loopCount >= anim.loop) {
					sprite._frame = Math.min(sprite._frame, animFrames.length - 1);
				}
				
				else sprite._frame %= animFrames.length;
			}

			sprite._elapsed = (sprite._elapsed + delta) % anim.speed;
		}
		else {
			sprite._elapsed += delta;
		}
	}
};

gm.Sprite.prototype.isPlaying = function(name) {
	return this._anim === this._anims[name];
};

gm.Sprite.prototype.isFinished = function() {
	return this._anim.loop & this._loopCount >= this._anim.loop;
};

gm.Sprite.prototype.play = function(animName, force) {
	var sprite = this;

	var anim = sprite._anims[animName];
	if (anim !== undefined && (force || anim !== sprite._anim)) {
		sprite._anim = anim;
		sprite.rewind();
		sprite._running = true;
	}
};

gm.Sprite.prototype.stop = function() {
	var sprite = this;

	sprite._running = false;
};

gm.Sprite.prototype.rewind = function() {
	var sprite = this;

	sprite._frame = 0;
	sprite._elapsed = 0;
	sprite._loopCount = 0;
};