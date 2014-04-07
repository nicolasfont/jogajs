define(['joga/dependencyTracker'], function(dependencyTracker) {
    
    function objectPropertyFactory(initialValue) {
        
        function objectProperty(value) {
            objectProperty.this = this;
            return objectProperty.evaluate(value);
        }
        
        objectProperty.evaluate = evaluate;
        objectProperty.initialize = initialize;
        objectProperty.mixinTo = mixinTo;
        
        objectProperty.subscribe = subscribe;
        objectProperty.unsubscribe = unsubscribe;
        objectProperty.notify = notify;
        
        objectProperty.isNull = isNull;
        objectProperty.isNotNull = isNotNull;
        objectProperty.get = get;
        objectProperty.put = put;
        objectProperty.forEach = forEach;

        objectProperty.initialize(initialValue);
        
        return objectProperty;
    }
    
    function evaluate(newValue) {
        if (newValue === undefined) {
            dependencyTracker.notify(this);
            return this.value;
        }
        this.value = newValue;
        this.notify();
        return this.this;
    }

    function initialize(initialValue) {
        this.value = null;
        this.observers = [];
        this.evaluate(initialValue);
    }
    
    function mixinTo(property) {
        var key;
        for(key in this) {
            property[key] = this[key];
        }
        return this;
    }

    function subscribe(observer) {
        this.observers.push(observer);
        return this;
    }

    function unsubscribe(observer) {
        var index = this.observers.indexOf(observer);
        if (index !== -1) {
            this.observers.splice(index, 1);
        }
        return this;
    }

    function notify() {
        var observers = this.observers.slice(0),
            i;
        for (i = 0; i < observers.length; i++) {
            observers[i](this);
        }
        return this;
    }

    function isNull() {
        return this() === null;
    }

    function isNotNull() {
        return !this.isNull();
    }
    
    function get(key) {
        return this()[key];
    }
    
    function put(key, value) {
        this.value[key] = value;
        this.notify();
    }
    
    function forEach(iterator) {
        var key;
        for (key in this()) {
            iterator.call(this.this, this.value[key], key);
        }
    }

    return objectPropertyFactory;
});
