// JogaJS v0.2.0
// (c) 2014 Nicolas Font http://jogajs.com
// License: MIT
(function () {
define('joga/dependencyTracker',[],function () {
    
    function DependencyTracker() {
        this.observers = [];

        this.push = function (observer) {
            this.observers.push(observer);
            return this;
        };

        this.pop = function () {
            this.observers.pop();
            return this;
        };

        this.notify = function (changedProperty) {
            if (this.observers.length > 0) {
                this.observers[this.observers.length - 1](changedProperty);
            }
            return this;
        };
    }
    
    return new DependencyTracker();
});
define('joga/objectProperty',['joga/dependencyTracker'], function (dependencyTracker) {
    
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
define('joga/computedProperty',['joga/objectProperty', 'joga/dependencyTracker'], function (objectProperty, dependencyTracker) {

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

        this.notify = function () {
            var observers = this.observers.slice(0),
                i;
            for (i = 0; i < observers.length; i++) {
                observers[i](this);
            }
            return this.self;
        }.bind(this);
        
        this.subscriber = function (property) {
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
    };

    ElementBinding.prototype.child = function (dataExpression) {
        var computed = computedProperty(dataExpression);

        this.child.update = function () {
            ElementBinding.removeChildNodes(this.element);
            this.element.appendChild(computed.apply(this.model));
        }.bind(this);

        this.child.update();

        computed.subscribe(this.child.update);
    };

    ElementBinding.prototype.childnodes = function (dataExpression) {
        var i,
            computed = computedProperty(dataExpression);

        this.childnodes.update = function () {
            var nodes = computed.apply(this.model);
            
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

        this.class.update = function () {
            if (this.class.lastClassName) {
                this.element.classList.remove(this.class.lastClassName);
            }
            this.class.lastClassName = computed.apply(this.model);
            this.element.classList.add(this.class.lastClassName);
        }.bind(this);

        this.class.update();

        computed.subscribe(this.class.update);
    };

    ElementBinding.prototype.do = function (dataExpression) {
        this.do.dataExpression = dataExpression;
        foreachDo.apply(this);
    };

    ElementBinding.prototype.id = function (dataExpression) {
        var computed = computedProperty(dataExpression);

        this.id.update = function () {
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

            this.foreach.update = function () {
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

    ElementBinding.prototype.foreach = function (dataExpression) {
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

        this.text.update = function () {
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

define('joga/bindings/HTMLAnchorElementBinding',['joga/bindings/ElementBinding', 'joga/computedProperty'], function (ElementBinding, computedProperty) {

    function HTMLAnchorElementBinding(element, model) {
        ElementBinding.call(this, element, model);
    }
    
    HTMLAnchorElementBinding.prototype = new ElementBinding();
    
    HTMLAnchorElementBinding.prototype.href = function (dataExpression) {
        var computed = computedProperty(dataExpression);

        this.href.update = function () {
            this.element.href = computed.apply(this.model);
        }.bind(this);

        this.href.update();

        computed.subscribe(this.href.update);
    };

    return HTMLAnchorElementBinding;
});

define('joga/bindings/HTMLFormElementBinding',['joga/bindings/ElementBinding', 'joga/computedProperty'], function (ElementBinding, computedProperty) {

    function HTMLFormElementBinding(element, model) {
        ElementBinding.call(this, element, model);
    }
    
    HTMLFormElementBinding.prototype = new ElementBinding();

    HTMLFormElementBinding.prototype.onsubmit = function (dataExpression) {

        var callback = function (e) {
            var returnValue = dataExpression.call(this.model);

            if (!returnValue) {
                if (e.preventDefault) {
                    e.preventDefault();
                } else {
                    event.returnValue = false;
                }
                return false;
            }

            return returnValue;

        }.bind(this);

        if (this.element.addEventListener) {
            this.element.addEventListener("submit", callback, false);
        } else if (this.element.attachEvent) {
            this.element.attachEvent("onsubmit", callback);
        }

    };

    return HTMLFormElementBinding;
});

define('joga/bindings/HTMLInputElementBinding',['joga/bindings/ElementBinding', 'joga/computedProperty'], function (ElementBinding, computedProperty) {

    function HTMLInputElementBinding(element, model) {
        ElementBinding.call(this, element, model);
    }
    
    HTMLInputElementBinding.prototype = new ElementBinding();

    HTMLInputElementBinding.prototype.checked = function (dataExpression) {
        var computed = computedProperty(dataExpression);

        this.checked.update = function () {
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

        this.value.update = function () {
            this.element.value = computed.apply(this.model);
        }.bind(this);

        this.value.update();
        
        this.element.onchange = function () {
            computed.applyWrapped([this.element.value]);
        }.bind(this);

        computed.subscribe(this.value.update);
    };
    
    function selected() {
        if (this.hasOwnProperty("selectedvalue") && this.hasOwnProperty("selected")) {
            
            var computedValue = computedProperty(this.selectedvalue.dataExpression),
                computedSelected = computedProperty(this.selected.dataExpression);
            
            this.selected.update = function () {
                this.element.checked = computedValue.apply(this.model) === computedSelected.apply(this.model);
            }.bind(this);
            
            this.selected.update();
            
            this.element.onchange = function () {
                if (this.element.checked) {
                    computedSelected.applyWrapped([computedValue.apply(this.model)]);
                } else {
                    computedSelected.applyWrapped([null]);
                }
            }.bind(this); 
            
            computedValue.subscribe(this.selected.update);
            computedSelected.subscribe(this.selected.update);
        }
    }
    
    HTMLInputElementBinding.prototype.selectedvalue = function (dataExpression) {
        this.selectedvalue.dataExpression = dataExpression;
        selected.apply(this);
    };
    
    HTMLInputElementBinding.prototype.selected = function (dataExpression) {
        this.selected.dataExpression = dataExpression;
        selected.apply(this);
    };

    return HTMLInputElementBinding;
});

define('joga/bindings/HTMLImageElementBinding',['joga/bindings/ElementBinding', 'joga/computedProperty'], function (ElementBinding, computedProperty) {

    function HTMLImageElementBinding(element, model) {
        ElementBinding.call(this, element, model);
    }
    
    HTMLImageElementBinding.prototype = new ElementBinding();

    HTMLImageElementBinding.prototype.src = function (dataExpression) {
        var computed = computedProperty(dataExpression);

        this.src.update = function () {
            this.element.src = computed.apply(this.model);
        }.bind(this);

        this.src.update();

        computed.subscribe(this.src.update);
    };
    
    HTMLImageElementBinding.prototype.alt = function (dataExpression) {
        var computed = computedProperty(dataExpression);

        this.alt.update = function () {
            this.element.alt = computed.apply(this.model);
        }.bind(this);

        this.alt.update();

        computed.subscribe(this.alt.update);
    };
    
    return HTMLImageElementBinding;
});

define('joga/bindings/HTMLSelectElementBinding',['joga/bindings/ElementBinding', 'joga/computedProperty'], function (ElementBinding, computedProperty) {

    function HTMLSelectElementBinding(element, model) {
        ElementBinding.call(this, element, model);
    }

    HTMLSelectElementBinding.prototype = new ElementBinding();

    var foreach = function () {
        if (this.foreach.dataExpression) {

            this.foreach.selected = computedProperty(function () {
                return this.selected.dataExpression ? this.selected.dataExpression.apply(this.model) : null;
            }.bind(this));

            this.foreach.models = computedProperty(function () {
                return this.foreach.dataExpression.apply(this.model);
            }.bind(this));

            this.foreach.textFor = function (model) {
                return this.text.dataExpression ? this.text.dataExpression.apply(model) : String(model);
            }.bind(this);

            this.foreach.select = function (model) {
                if (this.selected.dataExpression) {
                    this.foreach.selected.applyWrapped([model]);
                }
            }.bind(this);

            this.foreach.options = computedProperty(function () {
                var option,
                    options = [],
                    i;
                for (i = 0; i < this.foreach.models().length; i++) {
                    option = document.createElement('option');
                    option.text = this.foreach.textFor(this.foreach.models()[i]);
                    options.push(option);
                }
                return options;
            }.bind(this));

            this.foreach.onElementChange = function () {
                var i,
                    selectedModels = [];
                
                if (this.element.multiple) {
                    for (i = 0; i < this.element.childNodes.length; i++) {
                        if (this.element.childNodes[i].selected) {
                            selectedModels.push(this.foreach.models()[i]);
                        }
                    }
                    this.foreach.select(selectedModels);
                } else {
                    this.foreach.select(this.foreach.models()[this.element.selectedIndex]);
                }
            }.bind(this);

            this.foreach.onModelsChange = function () {
                var i,
                    options = this.foreach.options(),
                    selectedModel = this.foreach.selected(),
                    somethingSelected = false;

                ElementBinding.removeChildNodes(this.element);
                for (i = 0; i < options.length; i++) {
                    this.element.appendChild(options[i]);

                    if ((this.element.multiple && selectedModel && selectedModel.indexOf(this.foreach.models()[i]) !== -1)
                         || selectedModel === this.foreach.models()[i]) {
                        options[i].selected = true;
                        somethingSelected = true;
                    }
                }

                if (!somethingSelected) {
                    if (this.element.multiple) {
                        this.foreach.select([]);
                    } else {
                        this.foreach.select(this.foreach.models().length > 0 ? this.foreach.models()[0] : null);
                    }
                }
            }.bind(this);

            this.foreach.onSelectedChange = function () {
                var i,
                    options = this.element.childNodes,
                    selectedModel = this.foreach.selected(),
                    somethingSelected = false,
                    defaultModel;

                for (i = 0; i < options.length; i++) {
                    if ((this.element.multiple && selectedModel && selectedModel.indexOf(this.foreach.models()[i]) !== -1)
                         || selectedModel === this.foreach.models()[i]) {
                        options[i].selected = true;
                        somethingSelected = true;
                    } else {
                        options[i].selected = false;
                    }
                }

                if (!somethingSelected) {
                    if (this.element.multiple) {
                        defaultModel = [];
                        if (selectedModel === null || selectedModel.length !== 0) {
                            this.foreach.select(defaultModel);
                        }
                    } else {
                        defaultModel = this.foreach.models().length > 0 ? this.foreach.models()[0] : null;
                        if (selectedModel !== defaultModel) {
                            this.foreach.select(defaultModel);
                        }
                    }
                }
            }.bind(this);

            this.foreach.onModelsChange();

            this.element.onchange = this.foreach.onElementChange;
            this.foreach.models.subscribe(this.foreach.onModelsChange);
            this.foreach.options.subscribe(this.foreach.onModelsChange);
            this.foreach.selected.subscribe(this.foreach.onSelectedChange);
        }
    };

    HTMLSelectElementBinding.prototype.foreach = function (dataExpression) {
        this.foreach.dataExpression = dataExpression;
        foreach.apply(this);
    };

    HTMLSelectElementBinding.prototype.text = function (dataExpression) {
        this.text.dataExpression = dataExpression;
        foreach.apply(this);
    };

    HTMLSelectElementBinding.prototype.selected = function (dataExpression) {
        this.selected.dataExpression = dataExpression;
        if (this.foreach.onSelectedChange) {
            this.foreach.onSelectedChange();
        }
    };

    return HTMLSelectElementBinding;
});

define('joga/bindings/HTMLTextAreaElementBinding',['joga/bindings/ElementBinding', 'joga/computedProperty'], function (ElementBinding, computedProperty) {

    function HTMLTextAreaElementBinding(element, model) {
        ElementBinding.call(this, element, model);
    }
    
    HTMLTextAreaElementBinding.prototype = new ElementBinding();
    
    HTMLTextAreaElementBinding.prototype.value = function (dataExpression) {
        var computed = computedProperty(dataExpression);

        this.value.update = function () {
            this.element.value = computed.apply(this.model);
        }.bind(this);

        this.value.update();
        
        this.element.onchange = function () {
            computed.applyWrapped([this.element.value]);
        }.bind(this);

        computed.subscribe(this.value.update);
    };

    return HTMLTextAreaElementBinding;
});

define('joga/elementBinder',[
    'joga/bindings/ElementBinding',
    'joga/bindings/HTMLAnchorElementBinding',
    'joga/bindings/HTMLFormElementBinding',
    'joga/bindings/HTMLInputElementBinding',
    'joga/bindings/HTMLImageElementBinding',
    'joga/bindings/HTMLSelectElementBinding',
    'joga/bindings/HTMLTextAreaElementBinding'
], function (
    ElementBinding,
    HTMLAnchorElementBinding,
    HTMLFormElementBinding,
    HTMLInputElementBinding,
    HTMLImageElementBinding,
    HTMLSelectElementBinding,
    HTMLTextAreaElementBinding
) {
    
    function ElementBinder() {
        this.mapping = {
            A: HTMLAnchorElementBinding,
            FORM: HTMLFormElementBinding,
            INPUT: HTMLInputElementBinding,
            IMG: HTMLImageElementBinding,
            SELECT: HTMLSelectElementBinding,
            TEXTAREA: HTMLTextAreaElementBinding
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
            this.notify();
            return this.self;
        }

        if (this.value === null) {
            dependencyTracker.push(function () {});

            this.value = createElement(this.initialValue);

            elementBinder.bind(this.value, this.self);

            dependencyTracker.pop();
        }

        dependencyTracker.notify(this);

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

define('joga/stringProperty',['joga/objectProperty'], function (objectProperty) {
    
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
    'joga/elementBinder',
    'joga/bindings/ElementBinding',
    'joga/bindings/HTMLAnchorElementBinding',
    'joga/bindings/HTMLFormElementBinding',
    'joga/bindings/HTMLImageElementBinding',
    'joga/bindings/HTMLInputElementBinding',
    'joga/bindings/HTMLSelectElementBinding',
    'joga/bindings/HTMLTextAreaElementBinding',
    'joga/elementProperty',
    'joga/objectProperty',
    'joga/stringProperty'
],
function (
    arrayProperty,
    booleanProperty,
    computedProperty,
    dependencyTracker,
    elementBinder,
    ElementBinding,
    HTMLAnchorElementBinding,
    HTMLFormElementBinding,
    HTMLImageElementBinding,
    HTMLInputElementBinding,
    HTMLSelectElementBinding,
    HTMLTextAreaElementBinding,
    elementProperty,
    objectProperty,
    stringProperty
) {

    polyfills();
    
    var joga = {
        dependencyTracker: dependencyTracker,
        elementBinder: elementBinder,
        ElementBinding: ElementBinding,
        HTMLAnchorElementBinding: HTMLAnchorElementBinding,
        HTMLFormElementBinding: HTMLFormElementBinding,
        HTMLImageElementBinding: HTMLImageElementBinding,
        HTMLInputElementBinding: HTMLInputElementBinding,
        HTMLSelectElementBinding: HTMLSelectElementBinding,
        HTMLTextAreaElementBinding: HTMLTextAreaElementBinding,
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

function polyfills() {
    if (!Function.prototype.bind) {
      Function.prototype.bind = function (oThis) {
        if (typeof this !== "function") {
          // closest thing possible to the ECMAScript 5
          // internal IsCallable function
          throw new TypeError("Function.prototype.bind - what is trying to be bound is not callable");
        }

        var aArgs = Array.prototype.slice.call(arguments, 1),
            fToBind = this,
            fNOP = function () {},
            fBound = function () {
              return fToBind.apply(this instanceof fNOP && oThis ? this : oThis,
                     aArgs.concat(Array.prototype.slice.call(arguments)));
            };

        fNOP.prototype = this.prototype;
        fBound.prototype = new fNOP();

        return fBound;
      };
    }
};}());