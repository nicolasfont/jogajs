define(['joga/bindings/ElementBinding', 'joga/computedProperty'], function (ElementBinding, computedProperty) {

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
