
module('property');

test("is a function", function() {
    ok(typeof(just.property()) === 'function');
});

test("returns null when not initialized", function() {
    var property = just.property();

    equal(property(), null);
    notEqual(typeof(property()), 'undefined');
});

test("can hold a value", function() {
    var property = just.property();

    property('value');

    equal(property(), 'value');
});

test("can hold a value when assigned to an object", function() {
    var obj = {
        property: just.property()
    };

    obj.property('value');

    equal(obj.property(), 'value');
});

test("can be reassigned with null", function() {
    var property = just.property();

    property('value');
    property(null);

    equal(property(), null);
});