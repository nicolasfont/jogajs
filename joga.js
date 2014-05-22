(function () {
define('joga/dependencyTracker',[],function() {
    
    function DependencyTracker() {
        this.observers = [];

        this.push = function(observer) {
            this.observers.push(observer);
            return this;
        };

        this.pop = function() {
            this.observers.pop();
            return this;
        };

        this.notify = function(changedProperty) {
            if (this.observers.length > 0) {
                this.observers[this.observers.length - 1](changedProperty);
            }
            return this;
        };
    }
    
    return new DependencyTracker();
});
define('joga/objectProperty',['joga/dependencyTracker'], function(dependencyTracker) {
    
    function objectPropertyFactory(initialValue) {

        function objectProperty(value) {
            return objectProperty.evaluate(value, this);
        }

        objectProperty.evaluate = evaluate;
        objectProperty.initialize = initialize;
        objectProperty.mixinTo = mixinTo;
        objectProperty.applySelf = applySelf;

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

    function evaluate(newValue, self) {
        this.self = self;
        if (newValue === undefined) {
            dependencyTracker.notify(this);
            return this.value;
        }
        this.value = newValue;
        this.notify();
        return this.self;
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

    function applySelf(args) {
        return this.apply(this.self, args);
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
        return this.applySelf() === null;
    }

    function isNotNull() {
        return !this.isNull();
    }

    function get(key) {
        return this.applySelf()[key];
    }

    function put(key, value) {
        this.value[key] = value;
        this.notify();
    }

    function forEach(iterator) {
        var key;
        for (key in this.applySelf()) {
            iterator.call(this.self, this.value[key], key);
        }
    }

    return objectPropertyFactory;
});

define('joga/arrayProperty',['joga/objectProperty'], function (objectProperty) {
    
    function arrayPropertyFactory(initialValue) {

        function arrayProperty(value) {
            return arrayProperty.evaluate(value, this);
        }

        objectProperty().mixinTo(arrayProperty);

        arrayProperty.push = push;
        arrayProperty.pop = pop;
        arrayProperty.remove = remove;
        arrayProperty.clear = clear;
        arrayProperty.shift = shift;
        arrayProperty.unshift = unshift;
        arrayProperty.reverse = reverse;
        arrayProperty.sort = sort;
        arrayProperty.forEach = forEach;

        arrayProperty.initialize(initialValue);

        return arrayProperty;
    }

    function push(value) {
        this.value.push(value);
        this.notify();
        return this;
    }

    function pop() {
        var popped = this.value.pop();
        this.notify();
        return popped;
    }

    function remove(value) {
        var index = this.value.indexOf(value);
        while (index !== -1) {
            this.value.splice(index, 1);
            index = this.value.indexOf(value);
        }
        this.notify();
        return this;
    }

    function clear() {
        this.applySelf([[]]);
        this.notify();
        return this;
    }

    function shift() {
        var shifted = this.applySelf().shift();
        this.notify();
        return shifted;
    }

    function unshift(value) {
        this.applySelf().unshift(value);
        this.notify();
        return this;
    }

    function reverse() {
        this.applySelf().reverse();
        this.notify();
        return this;
    }

    function sort(comparator) {
        this.applySelf().sort(comparator);
        this.notify();
        return this;
    }

    function forEach(iterator) {
        var i;
        if (this.applySelf().forEach) {
            this.value.forEach(iterator.bind(this.self));
        } else {
            for (i = 0; i < this.value.length; i++) {
                iterator.call(this.self, this.value[i], i);
            }
        }
        return this;
    }

    return arrayPropertyFactory;
});
define('joga/booleanProperty',['joga/objectProperty'], function (objectProperty) {
    
    function booleanPropertyFactory(initialValue) {
        
        function booleanProperty(value) {
            return booleanProperty.evaluate(value, this);
        }
        
        objectProperty().mixinTo(booleanProperty);
        
        booleanProperty.toggle = toggle;
        
        booleanProperty.initialize(initialValue);
        
        return booleanProperty;
    }
    
    function toggle() {
        this.evaluate(!this.value);
        return this;
    }

    return booleanPropertyFactory;
});
define('joga/computedProperty',['joga/objectProperty', 'joga/dependencyTracker'], function(objectProperty, dependencyTracker) {

    function computedPropertyFactory(initialValue) {

        function computedProperty(value) {
            return computedProperty.evaluate(value, this);
        }

        objectProperty().mixinTo(computedProperty);

        computedProperty.evaluate = evaluate;
        computedProperty.initialize = initialize;
        computedProperty.applyWrapped = applyWrapped;
        
        computedProperty.initialize(initialValue);

        return computedProperty;
    }
    
    function evaluate(newValue, self) {
        var value,
            i;
        
        this.self = self;
        
        if (newValue !== undefined) {
            this.value = newValue;
            return this.self;
        }

        for (i = 0; i < this.dependencies.length; i++) {
            this.dependencies[i].unsubscribe(this.notify);
        }

        this.dependencies = [];
        this.wrapped = null;

        dependencyTracker.push(this.subscriber);

        this.value = this.computer.apply(this.self, arguments);

        dependencyTracker.pop();

        for (i = 0; i < this.dependencies.length; i++) {
            this.dependencies[i].subscribe(this.notify);
        }

        dependencyTracker.notify(this);

        return this.value;
    }
    
    function initialize(initialValue) {
        objectProperty().initialize.call(this, null);
        this.computer = initialValue;
        this.dependencies = [];

        this.notify = function() {
            var observers = this.observers.slice(0),
                i;
            for (i = 0; i < observers.length; i++) {
                observers[i](this);
            }
            return this.self;
        }.bind(this);
        
        this.subscriber = function(property) {
            if (this.dependencies.indexOf(property) === -1) {
                this.dependencies.push(property);
            }
            this.wrapped = property;
        }.bind(this);

        this.evaluate(initialValue);
    }
    
    function applyWrapped(args) {
        this.wrapped.apply(this.self, args);
        return this.self;
    }

    return computedPropertyFactory;
});

define('joga/bindings/ElementBinding',['joga/computedProperty'], function (computedProperty) {

    function ElementBinding(element, model) {
        this.element = element;
        this.model = model;
    }

    ElementBinding.removeChildNodes = function (element) {
        while(element.firstChild) {
            element.removeChild(element.firstChild);
        }
    }

    ElementBinding.prototype.child = function (dataExpression) {
        var computed = computedProperty(dataExpression);

        this.child.update = function() {
            ElementBinding.removeChildNodes(this.element);
            this.element.appendChild(computed.apply(this.model));
        }.bind(this);

        this.child.update();

        computed.subscribe(this.child.update);
    };

    ElementBinding.prototype.childnodes = function (dataExpression) {
        var i,
            computed = computedProperty(dataExpression),
            nodes = computed.apply(this.model);

        this.childnodes.update = function() {
            ElementBinding.removeChildNodes(this.element);

            for (i = 0; i < nodes.length; i++) {
                this.element.appendChild(nodes[i]);
            }
        }.bind(this);

        this.childnodes.update();

        computed.subscribe(this.childnodes.update);
    };

    ElementBinding.prototype.class = function (dataExpression) {
        var computed = computedProperty(dataExpression);

        this.class.update = function() {
            if (this.class.lastClassName) {
                this.element.classList.remove(this.class.lastClassName);
            }
            this.class.lastClassName = computed.apply(this.model);
            this.element.classList.add(this.class.lastClassName);
        }.bind(this);

        this.class.update();

        computed.subscribe(this.class.update);
    };

    ElementBinding.prototype.do = function(dataExpression) {
        this.do.dataExpression = dataExpression;
        foreachDo.apply(this);
    };

    ElementBinding.prototype.id = function (dataExpression) {
        var computed = computedProperty(dataExpression);

        this.id.update = function() {
            this.element.id = computed.apply(this.model);
        }.bind(this);

        this.id.update();

        computed.subscribe(this.id.update);
    };

    function foreachDo() {
        if (this.foreach.dataExpression && this.do.dataExpression) {

            var computed = computedProperty(function () {
                var models = this.foreach.dataExpression.apply(this.model),
                    elements = [],
                    i;
                for (i = 0; i < models.length; i++) {
                    elements.push(this.do.dataExpression.apply(models[i]));
                }
                return elements;
            }.bind(this));

            this.foreach.update = function() {
                var i,
                    nodes = computed();
                ElementBinding.removeChildNodes(this.element);
                for (i = 0; i < nodes.length; i++) {
                    this.element.appendChild(nodes[i]);
                }
            }.bind(this);

            this.foreach.update();

            computed.subscribe(this.foreach.update);
        }
    }

    ElementBinding.prototype.foreach = function(dataExpression) {
        this.foreach.dataExpression = dataExpression;
        foreachDo.apply(this);
    };

    ElementBinding.prototype.onclick = function (dataExpression) {
        this.element.onclick = function (event) {
            event.preventDefault ? event.preventDefault() : event.returnValue = false;
            dataExpression.call(this.model);
        }.bind(this);
    };

    ElementBinding.prototype.text = function (dataExpression) {
        var computed = computedProperty(dataExpression);

        this.text.update = function() {
            ElementBinding.removeChildNodes(this.element);
            this.element.appendChild(document.createTextNode(computed.apply(this.model)));
        }.bind(this);

        this.text.update();

        computed.subscribe(this.text.update);
    };

    ElementBinding.prototype.title = function (dataExpression) {
        var computed = computedProperty(dataExpression);

        this.title.update = function() {
            this.element.title = computed.apply(this.model);
        }.bind(this);

        this.title.update();

        computed.subscribe(this.title.update);
    };

    return ElementBinding;
});

define('joga/bindings/HTMLInputElementBinding',['joga/bindings/ElementBinding', 'joga/computedProperty'], function (ElementBinding, computedProperty) {

    function HTMLInputElementBinding(element, model) {
        ElementBinding.call(this, element, model);
    }
    
    HTMLInputElementBinding.prototype = new ElementBinding();

    HTMLInputElementBinding.prototype.checked = function (dataExpression) {
        var computed = computedProperty(dataExpression);

        this.checked.update = function() {
            this.element.checked = computed.apply(this.model);
            this.element.onchange = function () {
                computed.applyWrapped([this.element.checked]);
            }.bind(this);
        }.bind(this);

        this.checked.update();

        computed.subscribe(this.checked.update);
    };
    
    HTMLInputElementBinding.prototype.value = function (dataExpression) {
        var computed = computedProperty(dataExpression);

        this.value.update = function() {
            this.element.value = computed.apply(this.model);
        }.bind(this);

        this.value.update();
        
        this.element.onchange = function () {
            computed.applyWrapped([this.element.value]);
        }.bind(this);

        computed.subscribe(this.value.update);
    };

    return HTMLInputElementBinding;
});

define('joga/elementBinder',['joga/bindings/ElementBinding', 'joga/bindings/HTMLInputElementBinding'], function (ElementBinding, HTMLInputElementBinding) {
    
    function ElementBinder() {
        this.mapping = {
            INPUT: HTMLInputElementBinding
        };
    }
    
    ElementBinder.prototype.bind = function (element, model) {
        var i,
            child,
            dataKey;

        for (i = 0; i < element.childNodes.length; i++) {
            child = element.childNodes[i];
            child.binding = this.bind(child, model);
        }
        
        element.binding = this.create(element, model);

        for (dataKey in element.dataset) {
            element.binding[dataKey] = element.binding[dataKey].bind(element.binding);
            element.binding[dataKey](new Function("return " + element.dataset[dataKey]));
        }
    };
    
    ElementBinder.prototype.create = function (element, model) {
        var factory = ElementBinding;
        
        if (element.tagName in this.mapping) {
            factory = this.mapping[element.tagName];
        }
        
        return new factory(element, model);
    };
    
    return new ElementBinder();
});
define('joga/elementProperty',['joga/objectProperty', 'joga/dependencyTracker', 'joga/elementBinder'], function (objectProperty, dependencyTracker, elementBinder) {

    function elementPropertyFactory(initialValue) {

        function elementProperty(value) {
            return elementProperty.evaluate(value, this);
        }

        objectProperty().mixinTo(elementProperty);

        elementProperty.evaluate = evaluate;

        elementProperty.initialize(initialValue);

        return elementProperty;
    }

    function evaluate(newValue, self) {
        this.self = self;

        if (newValue) {
            this.initialValue = newValue;
            this.value = null;
            return this.self;
        }

        if (this.value === null) {
            dependencyTracker.push(function () {});

            this.value = createElement(this.initialValue);
            
            elementBinder.bind(this.value, this.self);

            dependencyTracker.pop();
        }

        return this.value;
    }

    function createElement(element) {
        var div;

        if (element instanceof Node) {
            return element;
        }

        div = document.createElement("div");
        div.innerHTML = element;
        return div.firstChild;
    }

    return elementPropertyFactory;
});

define('joga/stringProperty',['joga/objectProperty'], function(objectProperty) {
    
    function stringPropertyFactory(initialValue) {
        
        function stringProperty(value) {
            return stringProperty.evaluate(value, this);
        }
        
        objectProperty().mixinTo(stringProperty);
        
        stringProperty.isBlank = isBlank;
        stringProperty.isNotBlank = isNotBlank;
        stringProperty.isEmpty = isEmpty;
        stringProperty.isNotEmpty = isNotEmpty;
        
        stringProperty.initialize(initialValue);
        
        return stringProperty;
    }
    
    function isBlank() {
        return this.applySelf() === null || this.applySelf().trim() === "";
    }

    function isNotBlank() {
        return !this.isBlank();
    }

    function isEmpty() {
        return this.applySelf() === null || this.applySelf() === "";
    }

    function isNotEmpty() {
        return !this.isEmpty();
    }

    return stringPropertyFactory;
});
define('joga',[
    'joga/arrayProperty',
    'joga/booleanProperty',
    'joga/computedProperty',
    'joga/dependencyTracker',
    'joga/bindings/ElementBinding',
    'joga/elementProperty',
    'joga/objectProperty',
    'joga/stringProperty'
],
function (
    arrayProperty,
    booleanProperty,
    computedProperty,
    dependencyTracker,
    ElementBinding,
    elementProperty,
    objectProperty,
    stringProperty
) {
    
    var joga = {
        dependencyTracker: dependencyTracker,
        ElementBinding: ElementBinding,
        arrayProperty: arrayProperty,
        booleanProperty: booleanProperty,
        computedProperty: computedProperty,
        elementProperty: elementProperty,
        objectProperty: objectProperty,
        stringProperty: stringProperty
    };
    
    window.joga = joga;
    
    return joga;
});
}());