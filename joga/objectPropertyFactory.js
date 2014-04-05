define(['joga/dependencyTracker'], function(dependencyTracker) {
    
    function objectPropertyFactory(initialValue) {
        
        function objectProperty(value) {
            objectProperty.this = this;
            return objectProperty.evaluate(value);
        }
        
        objectProperty.evaluate = function (newValue) {
            if (newValue === undefined) {
                dependencyTracker.notify(this);
                return this.value;
            }
            this.value = newValue;
            this.notify();
            return this.this;
        };
    
        objectProperty.initialize = function (initialValue) {
            this.value = null;
            this.observers = [];
            this.evaluate(initialValue);
        };
        
        objectProperty.subscribe = function(observer) {
            this.observers.push(observer);
            return this;
        };

        objectProperty.unsubscribe = function(observer) {
            var index = this.observers.indexOf(observer);
            if (index !== -1) {
                this.observers.splice(index, 1);
            }
            return this;
        };

        objectProperty.notify = function() {
            var observers = this.observers.slice(0),
                i;
            for (i = 0; i < observers.length; i++) {
                observers[i](this);
            }
            return this;
        };
        
        objectProperty.mixinTo = function(property) {
            var key;
            for(key in this) {
                property[key] = this[key];
            }
            return this;
        };
        
        objectProperty.isNull = function() {
            return this() === null;
        };
        
        objectProperty.isNotNull = function() {
            return !this.isNull();
        };

        objectProperty.initialize(initialValue);
        
        return objectProperty;
    }

    return objectPropertyFactory;
});