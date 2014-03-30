define(['joga/dependencyTracker'], function(dependencyTracker) {
    
    function computedPropertyFactory(f) {

        function computedProperty() {
            var value,
                i,
                subscriber = function(property) {
                    if (computedProperty.dependencies.indexOf(property) === -1) {
                        computedProperty.dependencies.push(property);
                    }
                    computedProperty.wrapped = property;
                };
                
            computedProperty.self = this;

            for (i = 0; i < computedProperty.dependencies.length; i++) {
                computedProperty.dependencies[i].unsubscribe(computedProperty.notify);
            }

            computedProperty.dependencies = [];
            computedProperty.wrapped = null;

            dependencyTracker.push(subscriber);

            value = computedProperty.f.apply(computedProperty.self, arguments);

            dependencyTracker.pop();

            for (i = 0; i < computedProperty.dependencies.length; i++) {
                computedProperty.dependencies[i].subscribe(computedProperty.notify);
            }

            dependencyTracker.notify(computedProperty);

            return value;
        }
        
        computedProperty.observers = [];
        computedProperty.dependencies = [];
        computedProperty.wrapped;
        computedProperty.self;
        computedProperty.f = f;

        computedProperty.subscribe = function(observer) {
            computedProperty.observers.push(observer);
            return computedProperty.self;
        };

        computedProperty.unsubscribe = function(observer) {
            var index = computedProperty.observers.indexOf(observer);
            if (index !== -1) {
                computedProperty.observers.splice(index, 1);
            }
            return computedProperty.self;
        };

        computedProperty.notify = function() {
            var i;
            for (i = 0; i < computedProperty.observers.length; i++) {
                computedProperty.observers[i](computedProperty);
            }
            return computedProperty.self;
        };

        computedProperty.applyWrapped = function(args) {
            computedProperty.wrapped.apply(computedProperty.self, args);
            return computedProperty.self;
        };

        return computedProperty;
    }
    
    return computedPropertyFactory;
});