define([
    'joga/bindings/ElementBinding',
    'joga/bindings/HTMLInputElementBinding',
    'joga/bindings/HTMLImageElementBinding'
], function (
    ElementBinding,
    HTMLInputElementBinding,
    HTMLImageElementBinding
) {
    
    function ElementBinder() {
        this.mapping = {
            INPUT: HTMLInputElementBinding,
            IMG: HTMLImageElementBinding
        };
    }
    
    ElementBinder.prototype.bind = function (element, model) {
        var i,
            child,
            dataKey;

        for (i = 0; i < element.childNodes.length; i++) {
            child = element.childNodes[i];
            child.binding = this.bind(child, model);
        }
        
        element.binding = this.create(element, model);

        for (dataKey in element.dataset) {
            element.binding[dataKey] = element.binding[dataKey].bind(element.binding);
            element.binding[dataKey](new Function("return " + element.dataset[dataKey]));
        }
    };
    
    ElementBinder.prototype.create = function (element, model) {
        var factory = ElementBinding;
        
        if (element.tagName in this.mapping) {
            factory = this.mapping[element.tagName];
        }
        
        return new factory(element, model);
    };
    
    return new ElementBinder();
});