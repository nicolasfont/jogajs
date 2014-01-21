(function() {
    var just = {};

    just.property = function(initialValue) {
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
    
    just.binding = function(element, obj) {
        return new just.Binding(element, obj).bind();
    };
    
    just.Binding = function(element, obj) {
        this.bind = function() {
        	var dataKey,
        	self = this;
        	
        	for(dataKey in element.dataset) {
        		(function(dataKey){
        			var bindingFunction = self[dataKey],
            		dataValue = element.dataset[dataKey],
            		property = obj[dataValue];
        			
            		bindingFunction(property());
            		property.subscribe(bindingFunction);
        		})(dataKey);
        	}
        	
        	return this;
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

            for(i = 0; i < element.childNodes.length; i++) {
                childNodes.push(element.childNodes[i]);
            }
            
            for(i = 0; i < childNodes.length; i++) {
                element.removeChild(childNodes[i]);
            }
            
            element.appendChild(document.createTextNode(text));
        };
        
        this.id = function(id) {
        	element.id = id;
        };
    }

    window.just = just;
})();
