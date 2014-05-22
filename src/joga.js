define([
    'joga/arrayProperty',
    'joga/booleanProperty',
    'joga/computedProperty',
    'joga/dependencyTracker',
    'joga/bindings/ElementBinding',
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
    elementProperty,
    objectProperty,
    stringProperty
) {
    
    var joga = {
        dependencyTracker: dependencyTracker,
        ElementBinding: ElementBinding,
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
