define(['joga/objectProperty', 'joga/dependencyTracker', 'joga/elementBinder'], function (objectProperty, dependencyTracker, elementBinder) {

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
        this.self = self;

        if (newValue) {
            this.initialValue = newValue;
            this.value = null;
            this.notify();
            return this.self;
        }

        if (this.value === null) {
            dependencyTracker.push(function () {});

            this.value = createElement(this.initialValue);

            elementBinder.bind(this.value, this.self);

            dependencyTracker.pop();
        }

        dependencyTracker.notify(this);

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
