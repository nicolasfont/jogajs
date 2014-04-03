define(['joga/computedPropertyFactory'], function (computed) {
    
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
            property = computed(new Function("return " + dataValue));
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
        this.element.onclick = function(event) {
            event.preventDefault ? event.preventDefault() : event.returnValue = false;
            this.dataProperties.onclick.call(this.model);
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
        if (this.dataProperties.foreach && this.dataProperties.do) {
            
            var foreachDoProperty = computed(function() {
                var models = this.dataProperties.foreach.apply(this.model),
                views = [],
                i;
                for (i = 0; i < models.length; i++) {
                    views.push(this.dataProperties.do.f.apply(models[i]));
                }
                return views;
            }.bind(this));
            
            this.childnodes(foreachDoProperty);
            
            foreachDoProperty.subscribe(this.childnodes.bind(this));
        }
    }
    
    ElementBinding.prototype.foreach = foreachDo;
    
    ElementBinding.prototype.do = foreachDo;

    ElementBinding.prototype.value = function(property) {
        this.element.value = property.apply(this.model);

        this.element.onchange = function() {
            this.dataProperties.value.applyWrapped([this.element.value]);
        }.bind(this);
    };
    
    return ElementBinding;
});
