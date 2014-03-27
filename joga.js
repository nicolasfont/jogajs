(function() {
    var joga = {};

    function DependencyTracker() {
        this.observers = [];

        this.subscribe = function(observer) {
            this.observers.push(observer);
            return this;
        };

        this.unsubscribe = function(observer) {
            var index = this.observers.indexOf(observer);
            if (index !== -1) {
                this.observers.splice(index, 1);
            }
            return this;
        };

        this.notify = function(changedProperty) {
            var i;
            for (i = 0; i < this.observers.length; i++) {
                this.observers[i](changedProperty);
            }
            return this;
        };
    }
    joga.dependencyTracker = new DependencyTracker();

    function objectPropertyFactory(initialValue) {

        function objectProperty(newValue) {
            if (newValue === undefined) {
                joga.dependencyTracker.notify(objectProperty);
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
            var i;
            for (i = 0; i < objectProperty.observers.length; i++) {
                objectProperty.observers[i](objectProperty);
            }
            return this;
        };

        objectProperty(initialValue);

        return objectProperty;
    }
    joga.objectProperty = objectPropertyFactory;
    joga.property = objectPropertyFactory;
    
    function computedPropertyFactory(f) {

        function computedProperty(newValue) {
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

            joga.dependencyTracker.subscribe(subscriber);

            value = f.call(computedProperty.self, newValue);

            joga.dependencyTracker.unsubscribe(subscriber);

            for (i = 0; i < computedProperty.dependencies.length; i++) {
                computedProperty.dependencies[i].subscribe(computedProperty.notify);
            }

            return value;
        }
        
        computedProperty.observers = [];
        computedProperty.dependencies = [];
        computedProperty.wrapped;
        computedProperty.self;

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
            computedProperty.apply(computedProperty.self);
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
    joga.computedProperty = computedPropertyFactory;

    function ElementBinding(element, model) {
        var dataKey,
            bindingFunction,
            dataValue,
            property,
            i,
            child;

        this.element = element;
        this.model = model;
        this.dataProperties = {};

        for (i = 0; i < element.childNodes.length; i++) {
            child = element.childNodes[i];
            child.binding = new ElementBinding(child, model);
        }

        for (dataKey in element.dataset) {
            bindingFunction = this[dataKey];
            dataValue = element.dataset[dataKey];
            property = joga.computedProperty(new Function("return " + dataValue));
            this.dataProperties[dataKey] = property;

            bindingFunction = bindingFunction.bind(this);
            bindingFunction(property);
            property.subscribe(bindingFunction);
        }
    }
    
    function removeChildNodes(element) {
        while(element.firstChild) {
            element.removeChild(element.firstChild);
        }
    }
    
    ElementBinding.prototype.id = function(property) {
        this.element.id = property.apply(this.model);
    };

    ElementBinding.prototype.class = function(property) {
        if (property.lastClassName) {
            this.element.classList.remove(property.lastClassName);
        }
        property.lastClassName = property.apply(this.model);
        this.element.classList.add(property.lastClassName);
    };

    ElementBinding.prototype.title = function(property) {
        this.element.title = property.apply(this.model);
    };

    ElementBinding.prototype.text = function(property) {
        removeChildNodes(this.element);
        this.element.appendChild(document.createTextNode(property.apply(this.model)));
    };

    ElementBinding.prototype.onclick = function(property) {
        this.element.onclick = function(e) {
            return property.call(this.model, e);
        }.bind(this);
    };

    ElementBinding.prototype.child = function(property) {
        removeChildNodes(this.element);
        this.element.appendChild(property.apply(this.model));
    };
    
    ElementBinding.prototype.childnodes = function(property) {
        var i,
            nodes = property.apply(this.model);
            
        removeChildNodes(this.element);
        
        for (i = 0; i < nodes.length; i++) {
            this.element.appendChild(nodes[i]);
        }
    };
    
    function foreachDo() {
        var i,
            models;
    
        if (this.dataProperties.foreach && this.dataProperties.do) {
            removeChildNodes(this.element);
            
            models = this.dataProperties.foreach.apply(this.model);
            
            for (i = 0; i < models.length; i++) {
                this.element.appendChild(this.dataProperties.do.apply(models[i]));
            }
        }
    }
    
    ElementBinding.prototype.foreach = foreachDo;
    
    ElementBinding.prototype.do = foreachDo;

    ElementBinding.prototype.value = function(property) {
        this.element.value = property.apply(this.model);

        this.element.onchange = function() {
            property.applyWrapped([this.element.value]);
        }.bind(this);
    };

    joga.ElementBinding = ElementBinding;
    
    function createElement(element) {
        var div;
        
        if (element instanceof Node) {
            return element;
        }
        
        div = document.createElement("div");
        div.innerHTML = element;
        return div.firstChild;
    }
    
    function element(el) {
        var instance;
        
        return function() {
            if (!instance) {
                instance = createElement(el);
                instance.binding = new ElementBinding(instance, this);
            }
            return instance; 
        };
    }
    joga.element = element;

    window.joga = joga;
}());
