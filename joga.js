define([
    'joga/dependencyTracker',
    'joga/objectPropertyFactory',
    'joga/booleanPropertyFactory',
    'joga/computedPropertyFactory',
    'joga/stringPropertyFactory',
    'joga/elementPropertyFactory',
    'joga/ElementBinding'
],
function (
    dependencyTracker,
    objectPropertyFactory,
    booleanPropertyFactory,
    computedPropertyFactory,
    stringPropertyFactory,
    elementPropertyFactory,
    ElementBinding) {
    
    var joga = {
        dependencyTracker: dependencyTracker,
        object: objectPropertyFactory,
        property: objectPropertyFactory,
        boolean: booleanPropertyFactory,
        string: stringPropertyFactory,
        computed: computedPropertyFactory,
        element: elementPropertyFactory,
        ElementBinding: ElementBinding
    };
    
    window.joga = joga;
    
    return joga;
});
