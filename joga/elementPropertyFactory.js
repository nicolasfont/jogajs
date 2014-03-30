define(['joga/dependencyTracker', 'joga/ElementBinding'], function (dependencyTracker, ElementBinding) {
    
    function createElement(element) {
        var div;

        if (element instanceof Node) {
            return element;
        }

        div = document.createElement("div");
        div.innerHTML = element;
        return div.firstChild;
    }

    function elementPropertyFactory(element) {

        function elementProperty() {
            if (elementProperty.value === null) {
                dependencyTracker.push(function () {});

                elementProperty.value = createElement(element);
                elementProperty.value.binding = new ElementBinding(elementProperty.value, this);

                dependencyTracker.pop();
            }
            
            return elementProperty.value;
        }

        elementProperty.value = null;

        return elementProperty;
    }
    
    return elementPropertyFactory;
});