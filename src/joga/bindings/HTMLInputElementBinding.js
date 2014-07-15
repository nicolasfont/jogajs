define(['joga/bindings/ElementBinding', 'joga/computedProperty'], function (ElementBinding, computedProperty) {

    function HTMLInputElementBinding(element, model) {
        ElementBinding.call(this, element, model);
    }
    
    HTMLInputElementBinding.prototype = new ElementBinding();

    HTMLInputElementBinding.prototype.checked = function (dataExpression) {
        var computed = computedProperty(dataExpression);

        this.checked.update = function () {
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

        this.value.update = function () {
            this.element.value = computed.apply(this.model);
        }.bind(this);

        this.value.update();
        
        this.element.onchange = function () {
            computed.applyWrapped([this.element.value]);
        }.bind(this);

        computed.subscribe(this.value.update);
    };
    
    function selected() {
        if (this.hasOwnProperty("selectedvalue") && this.hasOwnProperty("selected")) {
            
            var computedValue = computedProperty(this.selectedvalue.dataExpression),
                computedSelected = computedProperty(this.selected.dataExpression);
            
            this.selected.update = function () {
                this.element.checked = computedValue.apply(this.model) === computedSelected.apply(this.model);
            }.bind(this);
            
            this.selected.update();
            
            this.element.onchange = function () {
                if (this.element.checked) {
                    computedSelected.applyWrapped([computedValue.apply(this.model)]);
                } else {
                    computedSelected.applyWrapped([null]);
                }
            }.bind(this); 
            
            computedValue.subscribe(this.selected.update);
            computedSelected.subscribe(this.selected.update);
        }
    }
    
    HTMLInputElementBinding.prototype.selectedvalue = function (dataExpression) {
        this.selectedvalue.dataExpression = dataExpression;
        selected.apply(this);
    };
    
    HTMLInputElementBinding.prototype.selected = function (dataExpression) {
        this.selected.dataExpression = dataExpression;
        selected.apply(this);
    };

    return HTMLInputElementBinding;
});
