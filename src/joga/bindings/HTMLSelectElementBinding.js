define(['joga/bindings/ElementBinding', 'joga/computedProperty'], function (ElementBinding, computedProperty) {

    function HTMLSelectElementBinding(element, model) {
        ElementBinding.call(this, element, model);
    }
    
    HTMLSelectElementBinding.prototype = new ElementBinding();

    var foreach = function () {
        if (this.foreach.dataExpression && this.text.dataExpression && this.value.dataExpression) {

            var computed = computedProperty(function () {
                var models = this.foreach.dataExpression.apply(this.model),
                    options = [],
                    option,
                    i;
                for (i = 0; i < models.length; i++) {
                    option = document.createElement('option');
                    option.text = this.text.dataExpression.apply(models[i]);
                    option.value = this.value.dataExpression.apply(models[i]);
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

    return HTMLSelectElementBinding;
});
