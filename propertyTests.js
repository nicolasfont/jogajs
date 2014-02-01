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
        notified1,
        notified2;

    property.subscribe(function(value) {
        notified1 = value;
    }).subscribe(function(value) {
        notified2 = value;
    });

    property('value');

    equal(notified1, property);
    equal(notified2, property);
});

test("notifies previous value to observers when property is set", function() {
    var property = just.property("value1"),
        previousValue;

    property.subscribe(function(value, lastValue) {
        previousValue = lastValue;
    });

    property('value2');

    equal(previousValue, 'value1');
});

test("can unsubscribe observers", function() {
    var property = just.property(),
        notified1 = false,
        notified2,
        f = function(value) {
            notified1 = value;
        };

    property.subscribe(f).subscribe(function(value) {
        notified2 = value;
    }).unsubscribe(f);

    property('value');

    equal(notified1, false);
    equal(notified2, property);
});

test("unsubscribe a non subscribed observer does nothing", function() {
    var property = just.property(),
    notified;

    property.subscribe(function(value) {
        notified = value;
    }).unsubscribe(function() {});

    property('value');

    equal(notified, property);
});

test("computed property returns value", function() {
    var property = just.computedProperty(function() {
        return 1;
    });

    equal(property(), 1);
});

test("computed property notifies subscribers when dependency changes", function() {
    var prop1 = just.property(),
    computed = just.computedProperty(function() {
        return prop1();
    }),
    notified;

    computed.subscribe(function() {
        notified = true;
    });

    prop1("test");

    equal(notified, true);
});

test("computed property notifies subscribers only once when dependency changes", function() {
    var prop1 = just.property(),
    computed = just.computedProperty(function() {
        return prop1();
    }),
    notified = 0;

    computed();

    computed.subscribe(function() {
        notified += 1;
    });

    prop1("test");

    equal(notified, 1);
});

test("computed property notifies subscribers only once when dependency is called twice", function() {
    var prop1 = just.property(1),
    computed = just.computedProperty(function() {
        return prop1() + prop1();
    }),
    notified = 0;

    computed();

    computed.subscribe(function() {
        notified += 1;
    });

    prop1("test");

    equal(notified, 1);
});

test("computed property notifies subscribers twice when dependency is updated twice", function() {
    var prop1 = just.property(1),
    computed = just.computedProperty(function() {
        return prop1();
    }),
    notified = 0;

    computed();

    computed.subscribe(function() {
        notified += 1;
    });

    prop1("test");
    prop1("test2");

    equal(notified, 2);
});

test("computed property notifies subscribers once when nested dependency is updated", function() {
    var prop1 = just.property({
        prop2: just.property(1)
    }),
    computed = just.computedProperty(function() {
        return prop1().prop2();
    }),
    notified = 0;

    computed.subscribe(function() {
        notified += 1;
    });

    prop1().prop2(2);

    equal(notified, 1);
    equal(computed(), 2);
});

test("computed property notifies subscribers once when parent dependency is updated", function() {
    var prop1 = just.property({
        prop2: just.property(1)
    }),
    computed = just.computedProperty(function() {
        return prop1().prop2();
    }),
    notified = 0;

    computed.subscribe(function() {
        notified += 1;
    });

    prop1({
        prop2: just.property(2)
    });

    equal(notified, 1);
    equal(computed(), 2);
});

test("computed property notifies subscribers once when original nested dependency is updated after parent dependency is updated", function() {
    var prop2 = just.property(1),
    prop1 = just.property({
        prop2: prop2
    }),
    computed = just.computedProperty(function() {
        return prop1().prop2();
    }),
    notified = 0;

    computed.subscribe(function() {
        notified += 1;
    });

    prop1({
        prop2: just.property(2)
    });

    prop2(3);

    equal(notified, 1);
    equal(computed(), 2);
});

test("computed property notifies subscribers twice when nested dependency is updated after parent dependency is updated", function() {
    var prop2 = just.property(1),
    prop1 = just.property({
        prop2: prop2
    }),
    computed = just.computedProperty(function() {
        return prop1().prop2();
    }),
    notified = 0;

    computed.subscribe(function() {
        notified += 1;
    });

    prop1({
        prop2: just.property(2)
    });

    prop1().prop2(3);

    equal(notified, 2);
    equal(computed(), 3);
});
