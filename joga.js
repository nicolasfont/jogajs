define(['joga/dependencyTracker', 'joga/objectPropertyFactory', 'joga/booleanPropertyFactory',
        'joga/computedPropertyFactory', 'joga/elementPropertyFactory',
        'joga/ElementBinding'],
function (dependencyTracker, objectPropertyFactory, booleanPropertyFactory, computedPropertyFactory,
          elementPropertyFactory, ElementBinding) {
    
    var joga = {
        dependencyTracker: dependencyTracker,
        object: objectPropertyFactory,
        property: objectPropertyFactory,
        boolean: booleanPropertyFactory,
        computed: computedPropertyFactory,
        ElementBinding: ElementBinding,
        element: elementPropertyFactory
    };
    
    window.joga = joga;
    
    return joga;
});
