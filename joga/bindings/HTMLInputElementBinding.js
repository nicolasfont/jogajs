define(['joga/bindings/ElementBinding', 'joga/computedProperty'], function (ElementBinding, computedProperty) {

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
