gm.SpriteMapper = function() {

	var SpriteMapper = function(behavior, sprite) {
		this.setBehavior(behavior);
		this.setSprite(sprite);
	};

	SpriteMapper.prototype.setBehavior = function(behavior) {
		this._behavior = behavior;
	};

	SpriteMapper.prototype.setSprite = function(sprite) {
		this._sprite = sprite;
	};

	SpriteMapper.prototype.update = function() { };

	return SpriteMapper;

}();