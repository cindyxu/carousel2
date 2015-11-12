gm.Store.Entity = function() {

	var EntityStore = {};

	EntityStore.fromJSON = function(entityJSON, callback) {
		var entity = gm.Entity.Model.createEntity(entityJSON.className, entityJSON.name, function(entity) {
			if (entityJSON.body) {
				entity._body.moveTo(entityJSON.body.x, entityJSON.body.y);
			}
			if (callback) callback(entity);
		});
		return entity;
	};

	EntityStore.toJSON = function(entity) {
		var entityJSON = {
			name: entity._name,
			className: entity._className
		};
		if (entity._body) {
			entityJSON.body = {
				x: entity._body._x,
				y: entity._body._y
			};
		}
		return entityJSON;
	};

	return EntityStore;

}();