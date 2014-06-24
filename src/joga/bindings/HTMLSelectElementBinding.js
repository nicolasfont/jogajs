define(['joga/bindings/ElementBinding', 'joga/computedProperty'], function (ElementBinding, computedProperty) {

    function HTMLSelectElementBinding(element, model) {
        ElementBinding.call(this, element, model);
    }

    HTMLSelectElementBinding.prototype = new ElementBinding();

    var foreach = function () {
        if (this.foreach.dataExpression && this.selected.dataExpression) {

            this.foreach.selected = computedProperty(function () {
                return this.selected.dataExpression.apply(this.model);
            }.bind(this));

            this.foreach.models = computedProperty(function () {
                return this.foreach.dataExpression.apply(this.model);
            }.bind(this));

            this.foreach.textFor = function (model) {
                return this.text.dataExpression ? this.text.dataExpression.apply(model) : String(model);
            }.bind(this);

            this.foreach.options = function () {
                var option,
                    options = [],
                    i;
                for (i = 0; i < this.foreach.models().length; i++) {
                    option = document.createElement('option');
                    option.text = this.foreach.textFor(this.foreach.models()[i]);
                    options.push(option);
                }
                return options;
            }.bind(this);

            this.foreach.onElementChange = function () {
                this.foreach.selected.applyWrapped([this.foreach.models()[this.element.selectedIndex]]);
            }.bind(this);

            this.foreach.onModelsChange = function () {
                var i,
                    options = this.foreach.options(),
                    selectedModel = this.foreach.selected(),
                    somethingSelected = false;

                ElementBinding.removeChildNodes(this.element);
                for (i = 0; i < options.length; i++) {
                    this.element.appendChild(options[i]);

                    if (selectedModel === this.foreach.models()[i]) {
                        options[i].selected = true;
                        somethingSelected = true;
                    }
                }

                if (!somethingSelected) {
                    this.foreach.selected.applyWrapped([this.foreach.models().length > 0 ? this.foreach.models()[0] : null]);
                }
            }.bind(this);

            this.foreach.onSelectedChange = function () {
                var i,
                    options = this.element.childNodes,
                    selectedModel = this.foreach.selected(),
                    somethingSelected = false;

                for (i = 0; i < options.length; i++) {
                    options[i].selected = selectedModel === this.foreach.models()[i];
                    if (options[i].selected) {
                        somethingSelected = true;
                    }
                }
            }.bind(this);

            this.foreach.onModelsChange();

            this.element.onchange = this.foreach.onElementChange;
            this.foreach.models.subscribe(this.foreach.onModelsChange);
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

    HTMLSelectElementBinding.prototype.value = function (dataExpression) {
        this.value.dataExpression = dataExpression;
        foreach.apply(this);
    };

    HTMLSelectElementBinding.prototype.selected = function (dataExpression) {
        this.selected.dataExpression = dataExpression;
        foreach.apply(this);
    };

    return HTMLSelectElementBinding;
});
