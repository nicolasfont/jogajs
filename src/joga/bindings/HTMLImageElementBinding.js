define(['joga/bindings/ElementBinding', 'joga/computedProperty'], function (ElementBinding, computedProperty) {

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
