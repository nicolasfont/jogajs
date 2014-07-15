define(['joga/bindings/ElementBinding', 'joga/computedProperty'], function (ElementBinding, computedProperty) {

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
