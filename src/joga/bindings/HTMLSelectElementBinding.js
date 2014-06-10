define(['joga/bindings/ElementBinding', 'joga/computedProperty'], function (ElementBinding, computedProperty) {

    function HTMLSelectElementBinding(element, model) {
        ElementBinding.call(this, element, model);
    }

    HTMLSelectElementBinding.prototype = new ElementBinding();

    var foreach = function () {
        if (this.foreach.dataExpression && this.selected.dataExpression) {

            var selected = computedProperty(function () {
                return this.selected.dataExpression.apply(this.model);
            }.bind(this));

            var computed = computedProperty(function () {
                var option,
                    options,
                    i,
                    selectedModel;

                this.foreach.models = this.foreach.dataExpression.apply(this.model);
                options = [];

                selectedModel = selected.apply(this.model);

                for (i = 0; i < this.foreach.models.length; i++) {
                    option = document.createElement('option');
                    option.text = this.text.dataExpression ? this.text.dataExpression.apply(this.foreach.models[i]) : String(this.foreach.models[i]);

                    if (selectedModel === this.foreach.models[i]) {
                        selected.applyWrapped([this.foreach.models[i]]);
                        option.selected = true;
                    }

                    options.push(option);
                }

                return options;
            }.bind(this));

            this.foreach.update = function () {
                var i,
                    nodes = computed();
                ElementBinding.removeChildNodes(this.element);
                for (i = 0; i < nodes.length; i++) {
                    this.element.appendChild(nodes[i]);
                }
                this.element.onchange = function () {
                    selected.applyWrapped([this.foreach.models[this.element.selectedIndex]]);
                }.bind(this);
            }.bind(this);

            this.foreach.update();

            computed.subscribe(this.foreach.update);
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
