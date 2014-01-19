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

test("can be initialized with a value", function() {
    var property = just.property('value');

    equal(property(), 'value');
});

test("can hold a value when assigned to an object", function() {
    var obj = {
        property: just.property()
    };

    obj.property('value');

    equal(obj.property(), 'value');
});

test("can be chained when setting", function() {
    var obj = {
        property: just.property()
    };

    var o = obj.property('value');

    equal(o, obj);
});

test("can be reassigned with null", function() {
    var property = just.property();

    property('value');
    property(null);

    equal(property(), null);
});

test("notifies observers when property is set", function() {
    var property = just.property(),
        notified1 = false,
        notified2 = false;

    property.subscribe(function(value) {
        notified1 = value;
    }).subscribe(function(value) {
        notified2 = value;
    });

    property('value');

    equal(notified1, 'value');
    equal(notified2, 'value');
});

test("can unsubscribe observers", function() {
    var property = just.property(),
        notified1 = false,
        notified2 = false,
        f = function(value) {
            notified1 = value;
        };

    property.subscribe(f).subscribe(function(value) {
        notified2 = value;
    }).unsubscribe(f);

    property('value');

    equal(notified1, false);
    equal(notified2, 'value');
});

test("unsubscribe a non subscribed observer does nothing", function() {
    var property = just.property(),
    notified = false;

    property.subscribe(function(value) {
        notified = value;
    }).unsubscribe(function() {});

    property('value');

    equal(notified, 'value');
});