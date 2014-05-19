define(['joga/ElementBinding'], function (ElementBinding) {
    
    function ElementBinder() {
        
    }
    
    ElementBinder.prototype.bind = function (element, model) {
        var i,
            child,
            dataKey;

        for (i = 0; i < element.childNodes.length; i++) {
            child = element.childNodes[i];
            child.binding = this.bind(child, model);
        }
        
        element.binding = new ElementBinding(element, model);

        for (dataKey in element.dataset) {
            element.binding[dataKey] = element.binding[dataKey].bind(element.binding);
            element.binding[dataKey](new Function("return " + element.dataset[dataKey]));
        }
    };
    
    return new ElementBinder();
});