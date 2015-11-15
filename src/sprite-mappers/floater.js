gm.SpriteMappers.Floater = function() {

	var Dir = gm.Constants.Dir;

	var FloaterMapper = function(behavior, sprite) {
		this._behavior = behavior;
		this._sprite = sprite;
	};

	FloaterMapper.prototype.update = function(delta) {
		if (this._behavior._floating) this._sprite.play("floater_moving");
		else this._sprite.play("floater_idle");
		this._sprite.flipX = (this._behavior.facing === Dir.LEFT);
	};

	return FloaterMapper;

}();