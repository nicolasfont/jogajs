define(['joga/computedProperty'], function (computedProperty) {

    function ElementBinding(element, model) {
        var dataKey,
            i,
            child;

        this.element = element;
        this.model = model;

        for (i = 0; i < element.childNodes.length; i++) {
            child = element.childNodes[i];
            child.binding = new ElementBinding(child, model);
        }

        for (dataKey in element.dataset) {
            this[dataKey] = this[dataKey].bind(this);
            this[dataKey](new Function("return " + element.dataset[dataKey]));
        }
    }

    function removeChildNodes(element) {
        while(element.firstChild) {
            element.removeChild(element.firstChild);
        }
    }

    ElementBinding.prototype.child = function (dataExpression) {
        var computed = computedProperty(dataExpression);

        this.child.update = function() {
            removeChildNodes(this.element);
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
            removeChildNodes(this.element);

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
                removeChildNodes(this.element);
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
            removeChildNodes(this.element);
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

    ElementBinding.prototype.value = function (dataExpression) {
        var computed = computedProperty(dataExpression);

        this.value.update = function() {
            this.element.value = computed.apply(this.model);
            this.element.onchange = function () {
                computed.applyWrapped([this.element.value]);
            }.bind(this);
        }.bind(this);

        this.value.update();

        computed.subscribe(this.value.update);
    };

    return ElementBinding;
});
