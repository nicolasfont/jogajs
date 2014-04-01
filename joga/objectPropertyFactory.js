define(['joga/dependencyTracker'], function(dependencyTracker) {
    
    function objectPropertyFactory(initialValue) {

        function objectProperty(newValue) {
            if (newValue === undefined) {
                dependencyTracker.notify(objectProperty);
                return objectProperty.value;
            }
            objectProperty.value = newValue;
            objectProperty.notify();
            return this;
        }

        objectProperty.value = null;
        objectProperty.observers = [];

        objectProperty.subscribe = function(observer) {
            objectProperty.observers.push(observer);
            return this;
        };

        objectProperty.unsubscribe = function(observer) {
            var index = objectProperty.observers.indexOf(observer);
            if (index !== -1) {
                objectProperty.observers.splice(index, 1);
            }
            return this;
        };

        objectProperty.notify = function() {
            var observers = objectProperty.observers.slice(0),
                i;
            for (i = 0; i < observers.length; i++) {
                observers[i](objectProperty);
            }
            return this;
        };

        objectProperty(initialValue);

        return objectProperty;
    }
    
    return objectPropertyFactory;
});