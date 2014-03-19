module('property');

test("is a function", function() {
    ok(typeof(joga.property()) === 'function');
});

test("returns null when not initialized", function() {
    var property = joga.property();

    equal(property(), null);
    notEqual(typeof(property()), 'undefined');
});

test("can hold a value", function() {
    var property = joga.property();

    property('value');

    equal(property(), 'value');
});

test("can be initialized with a value", function() {
    var property = joga.property('value');

    equal(property(), 'value');
});

test("can hold a value when assigned to an object", function() {
    var obj = {
        property: joga.property()
    };

    obj.property('value');

    equal(obj.property(), 'value');
});

test("can be chained when setting", function() {
    var obj = {
        property: joga.property()
    };

    var o = obj.property('value');

    equal(o, obj);
});

test("can be reassigned with null", function() {
    var property = joga.property();

    property('value');
    property(null);

    equal(property(), null);
});

test("notifies observers when property is set", function() {
    var property = joga.property(),
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

test("can unsubscribe observers", function() {
    var property = joga.property(),
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
    var property = joga.property(),
    notified;

    property.subscribe(function(value) {
        notified = value;
    }).unsubscribe(function() {});

    property('value');

    equal(notified, property);
});

test("joga.property is an alias of joga.objectProperty", function() {
    equal(joga.property, joga.objectProperty);
});

test("computed property returns value", function() {
    var property = joga.computedProperty(function() {
        return 1;
    });

    equal(property(), 1);
});

test("computed property notifies subscribers when dependency changes", function() {
    var prop1 = joga.property(),
    computed = joga.computedProperty(function() {
        return prop1();
    }),
    notified;
    
    computed();

    computed.subscribe(function() {
        notified = true;
    });

    prop1("test");

    equal(notified, true);
});

test("computed property notifies subscribers only once when dependency changes", function() {
    var prop1 = joga.property(),
    computed = joga.computedProperty(function() {
        return prop1();
    }),
    notified = 0;

    computed();
    computed();

    computed.subscribe(function() {
        notified += 1;
    });

    prop1("test");

    equal(notified, 1);
});

test("computed property notifies subscribers only once when dependency is called twice", function() {
    var prop1 = joga.property(1),
    computed = joga.computedProperty(function() {
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
    var prop1 = joga.property(1),
    computed = joga.computedProperty(function() {
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
    var prop1 = joga.property({
        prop2: joga.property(1)
    }),
    computed = joga.computedProperty(function() {
        return prop1().prop2();
    }),
    notified = 0;
    
    computed();

    computed.subscribe(function() {
        notified += 1;
    });

    prop1().prop2(2);

    equal(notified, 1);
    equal(computed(), 2);
});

test("computed property notifies subscribers once when parent dependency is updated", function() {
    var prop1 = joga.property({
        prop2: joga.property(1)
    }),
    computed = joga.computedProperty(function() {
        return prop1().prop2();
    }),
    notified = 0;
    
    computed();

    computed.subscribe(function() {
        notified += 1;
    });

    prop1({
        prop2: joga.property(2)
    });

    equal(notified, 1);
    equal(computed(), 2);
});

test("computed property notifies subscribers once when original nested dependency is updated after parent dependency is updated", function() {
    var prop2 = joga.property(1),
    prop1 = joga.property({
        prop2: prop2
    }),
    computed = joga.computedProperty(function() {
        return prop1().prop2();
    }),
    notified = 0;
    
    computed();

    computed.subscribe(function() {
        notified += 1;
    });

    prop1({
        prop2: joga.property(2)
    });

    prop2(3);

    equal(notified, 1);
    equal(computed(), 2);
});

test("computed property notifies subscribers twice when nested dependency is updated after parent dependency is updated", function() {
    var prop2 = joga.property(1),
    prop1 = joga.property({
        prop2: prop2
    }),
    computed = joga.computedProperty(function() {
        return prop1().prop2();
    }),
    notified = 0;
    
    computed();

    computed.subscribe(function() {
        notified += 1;
    });

    prop1({
        prop2: joga.property(2)
    });

    prop1().prop2(3);

    equal(notified, 2);
    equal(computed(), 3);
});

test("computed property calls function with the correct this object", function() {
    var model;
    
    function Model() {
        this.firstName = joga.property("first");
        this.lastName = joga.property("last");
        this.name = joga.computedProperty(function() {
            return this.firstName() + " " + this.lastName();
        });
    }
    
    model = new Model();
    
    equal("first last", model.name());
});

test("computed property passes parameter as an argument to its function", function() {
    var passed,
    notified = 0,
    computed = joga.computedProperty(function(arg) {
        if (arg !== undefined) {
            passed = arg;
        }
    });
    
    computed();
    
    computed.subscribe(function() {
        notified += 1;
    });
    
    computed(1);
    
    equal(passed, 1);
    equal(notified, 1);
});

test("computed property gets value of wrapped property", function() {
    var prop1 = joga.property(1),
    computed = joga.computedProperty(function() {
        return prop1;
    });

    equal(computed(), 1);
});

test("computed property notifies subscribers when wrapped property is updated", function() {
    var prop1 = joga.property(1),
    computed = joga.computedProperty(function() {
        return prop1;
    }),
    notified = 0;
    
    computed();

    computed.subscribe(function() {
        notified += 1;
    });

    prop1(2);

    equal(computed(), 2);
    equal(notified, 1);
});

test("computed property notifies subscribers only once when wrapped property is also a dependency and is updated", function() {
    var prop1 = joga.property(1),
    computed = joga.computedProperty(function() {
        prop1();
        return prop1;
    }),
    notified = 0;
    
    computed();

    computed.subscribe(function() {
        notified += 1;
    });

    prop1(2);

    equal(computed(), 2);
    equal(notified, 1);
});

test("computed property notifies subscribers when dependency is updated and wrapping a property", function() {
    var prop2 = joga.property(1),
    prop1 = joga.property({
        prop2: prop2
    }),
    computed = joga.computedProperty(function() {
        return prop1().prop2;
    }),
    notified = 0;
    
    computed();

    computed.subscribe(function() {
        notified += 1;
    });

    prop1({
        prop2: joga.property(2)
    });

    equal(computed(), 2);
    equal(notified, 1);
});

test("computed property notifies subscribers twice when nested dependency is updated after parent dependency is updated and wrapping a property", function() {
    var prop2 = joga.property(1),
    prop1 = joga.property({
        prop2: prop2
    }),
    computed = joga.computedProperty(function() {
        return prop1().prop2;
    }),
    notified = 0;
    
    computed();

    computed.subscribe(function() {
        notified += 1;
    });

    prop1({
        prop2: joga.property(2)
    });

    prop1().prop2(3);

    equal(notified, 2);
    equal(computed(), 3);
});

test("computed property can set wrapped property", function() {
    var prop1 = joga.property(1),
    computed = joga.computedProperty(function() {
        return prop1;
    }),
    notified = 0;
    
    computed();

    computed.subscribe(function() {
        notified += 1;
    });

    computed(2);

    equal(computed(), 2);
    equal(prop1(), 2);
    equal(notified, 1);
});

test("computed property can set nested wrapped property", function() {
    var prop2 = joga.property(1),
    prop1 = joga.property({
        prop2: prop2
    }),
    computed = joga.computedProperty(function() {
        return prop1().prop2;
    }),
    notified = 0;
    
    computed();

    computed.subscribe(function() {
        notified += 1;
    });

    computed(2);

    equal(computed(), 2);
    equal(prop2(), 2);
    equal(notified, 1);
});

test("computed property can be chained when setting a wrapped property", function() {
    var prop1 = joga.property(1),
        obj = {
            computed: joga.property(function() {
                return prop1;
            })
        };

    var o = obj.computed('value');

    equal(o, obj);
});