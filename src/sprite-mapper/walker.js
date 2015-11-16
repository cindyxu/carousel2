gm.SpriteMapper.Walker = function() {

	var Dir = gm.Constants.Dir;

	var WalkerMapper = function(behavior, sprite) {
		gm.SpriteMapper.call(this, behavior, sprite);
	};

	WalkerMapper.prototype = Object.create(gm.SpriteMapper.prototype);

	WalkerMapper.prototype.update = function(delta) {
		var behavior = this._behavior;
		if (behavior._jumpCount > 0) {
			this._sprite.play("walkerJumping");
		} else if (behavior._crouching) {
			this._sprite.play("walkerCrouching");
		} else if (behavior._walking) {
			this._sprite.play("walkerWalking");
		} else {
			this._sprite.play("walkerIdle");
		}
		this._sprite.flipX = (this._behavior.facing === Dir.LEFT);
	};

	return WalkerMapper;

}();