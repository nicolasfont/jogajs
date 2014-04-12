define([
    'joga/arrayProperty',
    'joga/booleanProperty',
    'joga/computedProperty',
    'joga/dependencyTracker',
    'joga/ElementBinding',
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
        array: arrayProperty,
        boolean: booleanProperty,
        computed: computedProperty,
        dependencyTracker: dependencyTracker,
        ElementBinding: ElementBinding,
        element: elementProperty,
        object: objectProperty,
        property: objectProperty,
        string: stringProperty
    };
    
    window.joga = joga;
    
    return joga;
});
