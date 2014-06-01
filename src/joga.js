define([
    'joga/arrayProperty',
    'joga/booleanProperty',
    'joga/computedProperty',
    'joga/dependencyTracker',
    'joga/bindings/ElementBinding',
    'joga/bindings/HTMLImageElementBinding',
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
    HTMLImageElementBinding,
    HTMLInputElementBinding,
    elementProperty,
    objectProperty,
    stringProperty
) {

    polyfills();
    
    var joga = {
        dependencyTracker: dependencyTracker,
        ElementBinding: ElementBinding,
        HTMLImageElementBinding: HTMLImageElementBinding,
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

function polyfills() {
    if (!Function.prototype.bind) {
      Function.prototype.bind = function (oThis) {
        if (typeof this !== "function") {
          // closest thing possible to the ECMAScript 5
          // internal IsCallable function
          throw new TypeError("Function.prototype.bind - what is trying to be bound is not callable");
        }

        var aArgs = Array.prototype.slice.call(arguments, 1),
            fToBind = this,
            fNOP = function () {},
            fBound = function () {
              return fToBind.apply(this instanceof fNOP && oThis ? this : oThis,
                     aArgs.concat(Array.prototype.slice.call(arguments)));
            };

        fNOP.prototype = this.prototype;
        fBound.prototype = new fNOP();

        return fBound;
      };
    }
}