gm.SpriteMapper.SingleAnim = function() {

	var SingleAnimMapper = function(behavior, sprite, animName) {
		gm.SpriteMapper.prototype.call(this, behavior, sprite);
		this._animName = animName;
	};

	SingleAnimMapper.prototype = Object.create(gm.SpriteMapper.prototype);

	SingleAnimMapper.prototype.update = function() {
		this._sprite.play(this._animName);
	};

	return SingleAnimMapper;

}();