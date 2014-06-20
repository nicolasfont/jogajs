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

            this.foreach.options = computedProperty(function () {
                var option,
                    options,
                    i,
                    selected = false,
                    selectedModel = this.foreach.selected.apply(this.model);

                this.foreach.models = this.foreach.dataExpression.apply(this.model);
                options = [];

                for (i = 0; i < this.foreach.models.length; i++) {
                    option = document.createElement('option');
                    option.text = this.text.dataExpression ? this.text.dataExpression.apply(this.foreach.models[i]) : String(this.foreach.models[i]);

                    if (selectedModel === this.foreach.models[i]) {
                        this.foreach.selected.applyWrapped([this.foreach.models[i]]);
                        option.selected = true;
                        selected = true;
                    }

                    options.push(option);
                }

                if (!selected && this.foreach.models.length > 0) {
                    this.foreach.selected.applyWrapped([this.foreach.models[0]]);
                }

                if (this.foreach.models.length == 0) {
                    this.foreach.selected.applyWrapped([null]);
                }

                return options;
            }.bind(this));

            this.foreach.update = function () {
                var i,
                    options = this.foreach.options();

                ElementBinding.removeChildNodes(this.element);
                for (i = 0; i < options.length; i++) {
                    this.element.appendChild(options[i]);
                }

                this.element.onchange = function () {
                    this.foreach.selected.applyWrapped([this.foreach.models[this.element.selectedIndex]]);
                }.bind(this);
            }.bind(this);

            this.foreach.update();

            this.foreach.options.subscribe(this.foreach.update);
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
