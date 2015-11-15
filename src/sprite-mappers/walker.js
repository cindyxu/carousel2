gm.SpriteMappers.Walker = function() {

	var Dir = gm.Constants.Dir;

	var WalkerMapper = function(behavior, sprite) {
		this._behavior = behavior;
		this._sprite = sprite;
	};

	WalkerMapper.prototype.update = function(delta) {
		var behavior = this._behavior;
		if (behavior._jumpCount > 0) {
			this._sprite.play("walker_jumping");
		} else if (behavior._crouching) {
			this._sprite.play("walker_crouching");
		} else if (behavior._walking) {
			this._sprite.play("walker_walking");
		} else {
			this._sprite.play("walker_idle");
		}
		this._sprite.flipX = (this._behavior.facing === Dir.LEFT);
	};

	return WalkerMapper;

}();