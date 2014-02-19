(function() {
    var just = {};

    function DependencyTracker() {
        var observers = [];

        this.subscribe = function(observer) {
            observers.push(observer);
            return this;
        };

        this.unsubscribe = function(observer) {
            var index = observers.indexOf(observer);
            if (index !== -1) {
                observers.splice(index, 1);
            }
            return this;
        };

        this.notify = function(changedProperty) {
            var i;
            for (i = 0; i < observers.length; i++) {
                observers[i](changedProperty);
            }
            return this;
        };
    }
    just.dependencyTracker = new DependencyTracker();

    function objectProperty(initialValue) {
        var value = null,
        observers = [];
        
        function objectProperty(newValue) {
            var i;
            if (typeof newValue === 'undefined') {
                just.dependencyTracker.notify(objectProperty);
                return value;
            } else {
                value = newValue;
                objectProperty.notify();
                return this;
            }
        };
        
        objectProperty.subscribe = function(observer) {
            observers.push(observer);
            return this;
        };
        
        objectProperty.unsubscribe = function(observer) {
            var index = observers.indexOf(observer);
            if (index !== -1) {
                observers.splice(index, 1);
            }
            return this;
        };

        objectProperty.notify = function() {
            var i;
            for (i = 0; i < observers.length; i++) {
                observers[i](objectProperty);
            }
            return this;
        };
        
        objectProperty(initialValue);
        
        return objectProperty;
    };
    just.property = objectProperty;

    function computedProperty(f) {
        var observers = [],
        dependencies = [];

        function computedProperty(newFunc) {
            var value,
            i,
            subscriber = function(changedProperty) {
                if (dependencies.indexOf(changedProperty) === -1) {
                    dependencies.push(changedProperty);
                }
            };

            if (newFunc) {
            	f = newFunc;
            	value = f();
            	computedProperty.notify();
            	return value;
            }

            for (i = 0; i < dependencies.length; i++) {
                dependencies[i].unsubscribe(computedProperty.notify);
            }

            dependencies = [];

            just.dependencyTracker.subscribe(subscriber);

            value = f();

            just.dependencyTracker.unsubscribe(subscriber);

            for (i = 0; i < dependencies.length; i++) {
                dependencies[i].subscribe(computedProperty.notify);
            }

            return value;
        }

        computedProperty.subscribe = function(observer) {
            observers.push(observer);
            return this;
        };

        computedProperty.unsubscribe = function(observer) {
            var index = observers.indexOf(observer);
            if (index !== -1) {
                observers.splice(index, 1);
            }
            return this;
        };

        computedProperty.notify = function() {
            var i;
            computedProperty();
            for (i = 0; i < observers.length; i++) {
                observers[i](computedProperty);
            }
            return this;
        };

        computedProperty();

        return computedProperty;
    }
    just.computedProperty = computedProperty;

    function wrapperProperty(f) {
        var observers = [],
        computed = just.computedProperty(f),
        wrapped;

        function wrapperProperty(newValue) {
            var value;

            if(typeof newValue !== "undefined" && wrapped) {
                wrapped(newValue);
            }

            if (wrapped) {
                wrapped.unsubscribe(wrapperProperty.notify);
                wrapped = null;
            }

            value = computed();

            if (typeof value === "function" && value.subscribe && value.unsubscribe) {
                wrapped = value;
                wrapped.subscribe(wrapperProperty.notify);
                return wrapped();
            }

            return value;
        }

        wrapperProperty.subscribe = function(observer) {
            observers.push(observer);
            return this;
        };

        wrapperProperty.unsubscribe = function(observer) {
            var index = observers.indexOf(observer);
            if (index !== -1) {
                observers.splice(index, 1);
            }
            return this;
        };

        wrapperProperty.notify = function() {
            var i;
            wrapperProperty();
            for (i = 0; i < observers.length; i++) {
                observers[i](wrapperProperty);
            }
            return this;
        };

        computed.subscribe(wrapperProperty.notify);

        wrapperProperty();

        return wrapperProperty;
    }
    just.wrapperProperty = wrapperProperty;
    
    function element(el, obj) {
    	var element = el,
    	binding,
    	div,
    	dataKey;
    	
    	if(!(el instanceof HTMLElement)) {
    		div = document.createElement("div");
    		div.innerHTML = el;
    		element = div.firstChild;
    	}
    	
        binding = new ElementBinding(element, obj);

    	for (dataKey in element.dataset) {
            var bindingFunction = binding[dataKey],
            dataValue = element.dataset[dataKey],
            property = just.wrapperProperty(new Function("return " + dataValue).bind(obj));

            bindingFunction = bindingFunction.bind(binding);
            bindingFunction(property);
            property.subscribe(bindingFunction);
        }
    	
    	element.dataset.binding = binding;
    	
    	return element;
    };
    just.element = element;
    
    function ElementBinding(element, obj) { 
        this.id = function(id) {
        	element.id = id();
        };
        
        this.class = function(property) {
            if (this.lastClassName) {
                element.classList.remove(this.lastClassName);
            }
            this.lastClassName = property();
            element.classList.add(this.lastClassName);
        };

        this.title = function(property) {
        	element.title = property();
        };
        
        this.text = function(property) {
            var i,
            childNodes = [];

            for (i = 0; i < element.childNodes.length; i++) {
                childNodes.push(element.childNodes[i]);
            }
            
            for (i = 0; i < childNodes.length; i++) {
                element.removeChild(childNodes[i]);
            }
            
            element.appendChild(document.createTextNode(property()));
        };
        
        this.onclick = function(property) {
        	element.onclick = function(e) {
        		property().call(obj, e);
        	};
        };

        this.element = function(property) {
            var i,
            childNodes = [];

            for (i = 0; i < element.childNodes.length; i++) {
                childNodes.push(element.childNodes[i]);
            }

            for (i = 0; i < childNodes.length; i++) {
                element.removeChild(childNodes[i]);
            }

            element.appendChild(property());
        };
        
        this.value = function(property) {
            element.value = property();
            
            element.onchange = function() {
            	property(element.value);
            };
        };
    }
    just.ElementBinding = ElementBinding;

    window.just = just;
})();
