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
                    observers[i](value, previousValue);
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
        		//property = obj[dataValue];
        		property = new Function("return " + dataValue).apply(obj);
    			
    			if (typeof property === "function" && property.subscribe) {    				
    				bindingFunction(property());
    				property.subscribe(bindingFunction);
    			} else {
    				bindingFunction(property);
    			}
    		})(dataKey);
    	}
    	
    	return binding;
    };
    just.binding = binding;
    
    function ElementBinding(element, obj) { 
        this.id = function(id) {
        	element.id = id;
        };
        
        this.class = function(className, lastClassName) {
            if (lastClassName) {
                element.classList.remove(lastClassName);
            }
            element.classList.add(className);
        };
        
        this.title = function(title) {
        	element.title = title;
        };
        
        this.text = function(text) {
            var i,
            childNodes = [];

            for (i = 0; i < element.childNodes.length; i++) {
                childNodes.push(element.childNodes[i]);
            }
            
            for (i = 0; i < childNodes.length; i++) {
                element.removeChild(childNodes[i]);
            }
            
            element.appendChild(document.createTextNode(text));
        };
        
        this.onclick = function(onclick) {
        	element.onclick = function(e) {
        		onclick.call(obj, e);
        	};
        };

        this.element = function(childElement) {
            var i,
            childNodes = [];

            for (i = 0; i < element.childNodes.length; i++) {
                childNodes.push(element.childNodes[i]);
            }

            for (i = 0; i < childNodes.length; i++) {
                element.removeChild(childNodes[i]);
            }

            element.appendChild(childElement);
        }
    }
    just.ElementBinding = ElementBinding;

    window.just = just;
})();
