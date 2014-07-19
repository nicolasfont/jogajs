define(['joga/bindings/ElementBinding', 'joga/computedProperty'], function (ElementBinding, computedProperty) {

    function HTMLFormElementBinding(element, model) {
        ElementBinding.call(this, element, model);
    }
    
    HTMLFormElementBinding.prototype = new ElementBinding();

    HTMLFormElementBinding.prototype.onsubmit = function (dataExpression) {

        var callback = function (e) {
            var returnValue = dataExpression.call(this.model);

            if (!returnValue) {
                if (e.preventDefault) {
                    e.preventDefault();
                } else {
                    event.returnValue = false;
                }
                return false;
            }

            return returnValue;

        }.bind(this);

        if (this.element.addEventListener) {
            this.element.addEventListener("submit", callback, false);
        } else if (this.element.attachEvent) {
            this.element.attachEvent("onsubmit", callback);
        }

    };

    return HTMLFormElementBinding;
});
