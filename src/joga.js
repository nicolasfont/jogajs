define([
    'joga/arrayProperty',
    'joga/booleanProperty',
    'joga/computedProperty',
    'joga/dependencyTracker',
    'joga/bindings/ElementBinding',
    'joga/bindings/HTMLInputElementBinding',
    'joga/elementProperty',
    'joga/objectProperty',
    'joga/stringProperty'
],
function (
    arrayProperty,
    booleanProperty,
    computedProperty,
    dependencyTracker,
    ElementBinding,
    HTMLInputElementBinding,
    elementProperty,
    objectProperty,
    stringProperty
) {
    
    var joga = {
        dependencyTracker: dependencyTracker,
        ElementBinding: ElementBinding,
        HTMLInputElementBinding: HTMLInputElementBinding,
        arrayProperty: arrayProperty,
        booleanProperty: booleanProperty,
        computedProperty: computedProperty,
        elementProperty: elementProperty,
        objectProperty: objectProperty,
        stringProperty: stringProperty
    };
    
    window.joga = joga;
    
    return joga;
});
