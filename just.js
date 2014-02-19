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
            if (newValue === undefined) {
                just.dependencyTracker.notify(objectProperty);
                return value;
            }
            value = newValue;
            objectProperty.notify();
            return this;
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
            dependencies = [],
            wrapped;

        function computedProperty(newValue) {
            var value,
                i,
                subscriber = function(changedProperty) {
                    if (dependencies.indexOf(changedProperty) === -1) {
                        dependencies.push(changedProperty);
                    }
                };

            if(newValue !== undefined && wrapped) {
                wrapped(newValue);
            }

            for (i = 0; i < dependencies.length; i++) {
                dependencies[i].unsubscribe(computedProperty.notify);
            }

            dependencies = [];
            wrapped = null;

            just.dependencyTracker.subscribe(subscriber);

            value = f();

            just.dependencyTracker.unsubscribe(subscriber);

            if (typeof value === "function" && value.subscribe && value.unsubscribe) {
                wrapped = value;
                value = wrapped();
                subscriber(wrapped);
            }

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
    
    function element(el, obj) {
        var element = el,
            binding,
            bindingFunction,
            div,
            dataKey,
            dataValue,
            property;

        if (!(el instanceof HTMLElement)) {
            div = document.createElement("div");
            div.innerHTML = el;
            element = div.firstChild;
        }

        binding = new ElementBinding(element, obj);

        for (dataKey in element.dataset) {
            bindingFunction = binding[dataKey],
            dataValue = element.dataset[dataKey],
            property = just.computedProperty(new Function("return " + dataValue).bind(obj));

            bindingFunction = bindingFunction.bind(binding);
            bindingFunction(property);
            property.subscribe(bindingFunction);
        }

        element.dataset.binding = binding;

        return element;
    }
    just.element = element;

    window.just = just;
})();
