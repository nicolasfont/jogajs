(function() {
    var joga = {};

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
    joga.dependencyTracker = new DependencyTracker();

    function objectPropertyFactory(initialValue) {
        var value = null,
            observers = [];

        function objectProperty(newValue) {
            if (newValue === undefined) {
                joga.dependencyTracker.notify(objectProperty);
                return value;
            }
            value = newValue;
            objectProperty.notify();
            return this;
        }

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
    }
    joga.objectProperty = objectPropertyFactory;
    joga.property = objectPropertyFactory;

    function computedPropertyFactory(f) {
        var observers = [],
            dependencies = [],
            wrapped,
            self;

        function computedProperty(newValue) {
            var value,
                i,
                subscriber = function(property) {
                    if (dependencies.indexOf(property) === -1) {
                        dependencies.push(property);
                    }
                };
                
            self = this;

            if (newValue !== undefined && wrapped) {
                wrapped(newValue);
                return self;
            }

            for (i = 0; i < dependencies.length; i++) {
                dependencies[i].unsubscribe(computedProperty.notify);
            }

            dependencies = [];
            wrapped = null;

            joga.dependencyTracker.subscribe(subscriber);

            value = f.call(self, newValue);

            joga.dependencyTracker.unsubscribe(subscriber);

            if (typeof value === "function" && value.subscribe && value.unsubscribe) {
                wrapped = value;
                value = wrapped();
                subscriber(wrapped);
            }

            for (i = 0; i < dependencies.length; i++) {
                dependencies[i].subscribe(computedProperty.notify);
            }
            
            if (newValue !== undefined) {
                computedProperty.notify();
            }

            return value;
        }

        computedProperty.subscribe = function(observer) {
            observers.push(observer);
            return self;
        };

        computedProperty.unsubscribe = function(observer) {
            var index = observers.indexOf(observer);
            if (index !== -1) {
                observers.splice(index, 1);
            }
            return self;
        };

        computedProperty.notify = function() {
            var i;
            computedProperty.apply(self);
            for (i = 0; i < observers.length; i++) {
                observers[i](computedProperty);
            }
            return self;
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

        this.el = element;
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
        this.el.id = property.apply(this.model);
    };

    ElementBinding.prototype.class = function(property) {
        if (this.lastClassName) {
            this.el.classList.remove(this.lastClassName);
        }
        this.lastClassName = property.apply(this.model);
        this.el.classList.add(this.lastClassName);
    };

    ElementBinding.prototype.title = function(property) {
        this.el.title = property.apply(this.model);
    };

    ElementBinding.prototype.text = function(property) {
        removeChildNodes(this.el);
        this.el.appendChild(document.createTextNode(property.apply(this.model)));
    };

    ElementBinding.prototype.onclick = function(property) {
        this.el.onclick = function(e) {
            property.apply(this.model).call(this.model, e);
        }.bind(this);
    };

    ElementBinding.prototype.element = function(property) {
        removeChildNodes(this.el);
        this.el.appendChild(property.apply(this.model));
    };
    
    ElementBinding.prototype.elements = function(property) {
        var i,
            elements = property.apply(this.model);
            
        removeChildNodes(this.el);
        
        for (i = 0; i < elements.length; i++) {
            this.el.appendChild(elements[i]);
        }
    };
    
    function foreachDo() {
        var i,
            models;
    
        if (this.dataProperties.foreach && this.dataProperties.do) {
            removeChildNodes(this.el);
            
            models = this.dataProperties.foreach.apply(this.model);
            
            for (i = 0; i < models.length; i++) {
                this.el.appendChild(this.dataProperties.do.apply(models[i]));
            }
        }
    }
    
    ElementBinding.prototype.foreach = foreachDo;
    
    ElementBinding.prototype.do = foreachDo;

    ElementBinding.prototype.value = function(property) {
        this.el.value = property.apply(this.model);

        this.el.onchange = function() {
            property.call(this.model, this.el.value);
        }.bind(this);
    };

    joga.ElementBinding = ElementBinding;
    
    function element(el, model) {
        var div;

        if (!(el instanceof HTMLElement)) {
            div = document.createElement("div");
            div.innerHTML = el;
            el = div.firstChild;
        }

        el.binding = new ElementBinding(el, model);

        return el;
    }
    joga.element = element;

    window.joga = joga;
}());
