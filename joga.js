define([
    'joga/dependencyTracker',
    'joga/objectProperty',
    'joga/booleanProperty',
    'joga/computedProperty',
    'joga/stringProperty',
    'joga/elementProperty',
    'joga/ElementBinding'
],
function (
    dependencyTracker,
    objectProperty,
    booleanProperty,
    computedProperty,
    stringProperty,
    elementProperty,
    ElementBinding) {
    
    var joga = {
        dependencyTracker: dependencyTracker,
        object: objectProperty,
        property: objectProperty,
        boolean: booleanProperty,
        string: stringProperty,
        computed: computedProperty,
        element: elementProperty,
        ElementBinding: ElementBinding
    };
    
    window.joga = joga;
    
    return joga;
});
