gm.Entity.Model = {};

gm.Entity.Model.createEntity = function(className, name, callback) {
	var entityClass = gm.EntityClasses[className];
	if (!entityClass) {
		if (LOGGING) console.log("!!! no such entity class", entityClass);
		if (callback) callback();
		return;
	}
	var entity = entityClass(name);
	entity._className = className;
	if (callback) {
		// entity.renderer.load(function() { callback(entity); });
		callback(entity);
	}
	return entity;
};