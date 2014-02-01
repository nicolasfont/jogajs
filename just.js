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
        previousValue = null,
        observers = [];
        
        function objectProperty(newValue) {
            var i;
            if (typeof newValue === 'undefined') {
                just.dependencyTracker.notify(objectProperty);
                return value;
            } else {
                previousValue = value;
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
                observers[i](objectProperty, previousValue);
            }
            return this;
        };
        
        objectProperty(initialValue);
        
        return objectProperty;
    };
    just.property = objectProperty;

    function computedProperty(f) {
        var f,
        observers = [],
        dependencies = [];

        function computedProperty() {
            var value,
            i,
            subscriber = function(changedProperty) {
                if (dependencies.indexOf(changedProperty) === -1) {
                    dependencies.push(changedProperty);
                }
            };

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
    		(function(dataKey){
    			var bindingFunction = binding[dataKey],
        		dataValue = element.dataset[dataKey],
        		property = new Function("return " + dataValue).apply(obj);
    			
    			if (typeof property !== "function" || !property.subscribe) {
    				property = just.property(property);
    			}
    			
				bindingFunction(property);
				property.subscribe(bindingFunction);
    		})(dataKey);
    	}
    	
    	element.dataset.binding = binding;
    	
    	return element;
    };
    just.element = element
    
    function ElementBinding(element, obj) { 
        this.id = function(id) {
        	element.id = id();
        };
        
        this.class = function(property, lastClassName) {
            if (lastClassName) {
                element.classList.remove(lastClassName);
            }
            element.classList.add(property());
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
