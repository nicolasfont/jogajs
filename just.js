(function() {
    var just = {};

    function property(initialValue) {
        var value = null,
        observers = [];
        
        function property(newValue) {
            var i, previousValue;
            if (typeof newValue != 'undefined') {
                previousValue = value;
                value = newValue;
                for (i = 0; i < observers.length; i++) {
                    observers[i](property, previousValue);
                }
                return this;
            }
            return value;
        };
        
        property.subscribe = function(observer) {
            observers.push(observer);
            return this;
        };
        
        property.unsubscribe = function(observer) {
            var index = observers.indexOf(observer);
            if (index != -1) {
                observers.splice(index, 1);
            }
            return this;
        };
        
        property(initialValue);
        
        return property;
    };
    just.property = property;
    
    function binding(element, obj) {
        var binding = new ElementBinding(element, obj),
        dataKey;
    	
    	for (dataKey in element.dataset) {
    		(function(dataKey){
    			var bindingFunction = binding[dataKey],
        		dataValue = element.dataset[dataKey],
        		property = new Function("return " + dataValue).apply(obj);
    			
    			if (typeof property != "function" || !property.subscribe) {
    				property = just.property(property);
    			}
    			
				bindingFunction(property);
				property.subscribe(bindingFunction);
    		})(dataKey);
    	}
    	
    	return binding;
    };
    just.binding = binding;
    
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
