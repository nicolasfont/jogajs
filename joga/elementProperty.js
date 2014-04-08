define(['joga/objectProperty', 'joga/dependencyTracker', 'joga/ElementBinding'], function (objectProperty, dependencyTracker, ElementBinding) {

    function elementPropertyFactory(initialValue) {

        function elementProperty(value) {
            return elementProperty.evaluate(value, this);
        }

        objectProperty().mixinTo(elementProperty);

        elementProperty.evaluate = evaluate;

        elementProperty.initialize(initialValue);

        return elementProperty;
    }

    function evaluate(newValue, self) {
        this.self = self === window ? this.self : self;

        if (newValue) {
            this.initialValue = newValue;
            this.value = null;
            return this.self;
        }

        if (this.value === null) {
            dependencyTracker.push(function () {});

            this.value = createElement(this.initialValue);
            this.value.binding = new ElementBinding(this.value, this.self);

            dependencyTracker.pop();
        }

        return this.value;
    }

    function createElement(element) {
        var div;

        if (element instanceof Node) {
            return element;
        }

        div = document.createElement("div");
        div.innerHTML = element;
        return div.firstChild;
    }

    return elementPropertyFactory;
});
