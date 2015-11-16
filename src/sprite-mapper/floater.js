gm.SpriteMapper.Floater = function() {

	var Dir = gm.Constants.Dir;

	var FloaterMapper = function(behavior, sprite) {
		gm.SpriteMapper.call(this, behavior, sprite);
	};

	FloaterMapper.prototype = Object.create(gm.SpriteMapper.prototype);

	FloaterMapper.prototype.update = function(delta) {
		if (this._behavior._floating) this._sprite.play("floaterFloating");
		else this._sprite.play("floaterIdle");
		this._sprite.flipX = (this._behavior.facing === Dir.LEFT);
	};

	return FloaterMapper;

}();