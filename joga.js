define(['joga/dependencyTracker', 'joga/objectPropertyFactory',
        'joga/computedPropertyFactory', 'joga/elementPropertyFactory',
        'joga/ElementBinding'],
function (dependencyTracker, objectPropertyFactory, computedPropertyFactory,
          elementPropertyFactory, ElementBinding) {
    
    var joga = {
        dependencyTracker: dependencyTracker,
        object: objectPropertyFactory,
        property: objectPropertyFactory,
        computed: computedPropertyFactory,
        ElementBinding: ElementBinding,
        element: elementPropertyFactory
    };
    
    window.joga = joga;
    
    return joga;
});
