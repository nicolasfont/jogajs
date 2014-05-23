define(['joga'], function (joga) {

    module('computedProperty');

    test("computed property returns value", function() {
        var property = joga.computedProperty(function() {
            return 1;
        });

        equal(property(), 1);
    });

    test("computed property notifies subscribers when dependency changes", function() {
        var prop1 = joga.objectProperty(),
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

    test("computed property notifies only initial observers when dependency changes", function() {
        var prop1 = joga.objectProperty(),
        computed = joga.computedProperty(function() {
            return prop1();
        }),
        notified1 = false,
        notified2 = false;

        computed();

        computed.subscribe(function() {
            notified1 = true;
            computed.subscribe(function(value) {
                notified2 = true;
            });
        });

        prop1("test");

        equal(notified1, true);
        equal(notified2, false);
    });

    test("computed property notifies subscribers only once when dependency changes", function() {
        var prop1 = joga.objectProperty(),
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
        var prop1 = joga.objectProperty(1),
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
        var prop1 = joga.objectProperty(1),
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
        var prop1 = joga.objectProperty({
            prop2: joga.objectProperty(1)
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
        var prop1 = joga.objectProperty({
            prop2: joga.objectProperty(1)
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
            prop2: joga.objectProperty(2)
        });

        equal(notified, 1);
        equal(computed(), 2);
    });

    test("computed property notifies subscribers once when original nested dependency is updated after parent dependency is updated", function() {
        var prop2 = joga.objectProperty(1),
        prop1 = joga.objectProperty({
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
            prop2: joga.objectProperty(2)
        });

        computed();

        prop2(3);

        equal(notified, 1);
        equal(computed(), 2);
    });

    test("computed property notifies subscribers twice when nested dependency is updated after parent dependency is updated", function() {
        var prop2 = joga.objectProperty(1),
        prop1 = joga.objectProperty({
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
            prop2: joga.objectProperty(2)
        });

        computed();

        prop1().prop2(3);

        equal(notified, 2);
        equal(computed(), 3);
    });

    test("computed property calls function with the correct this object", function() {
        var model;

        function Model() {
            this.firstName = joga.objectProperty("first");
            this.lastName = joga.objectProperty("last");
            this.name = joga.computedProperty(function() {
                return this.firstName() + " " + this.lastName();
            });
        }

        model = new Model();

        equal("first last", model.name());
    });

    test("computed property notifies subscribers only once when wrapped property is also a dependency and is updated", function() {
        var prop1 = joga.objectProperty(1),
        computed = joga.computedProperty(function() {
            prop1();
            return prop1();
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

    test("computed property can set wrapped property", function() {
        var prop1 = joga.objectProperty(1),
        computed = joga.computedProperty(function() {
            return prop1();
        }),
        notified = 0;

        computed();

        computed.subscribe(function() {
            notified += 1;
        });

        computed.applyWrapped([2]);

        equal(computed(), 2);
        equal(prop1(), 2);
        equal(notified, 1);
    });

    test("computed property can set nested wrapped property", function() {
        var prop2 = joga.objectProperty(1),
        prop1 = joga.objectProperty({
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

        computed.applyWrapped([2]);

        equal(computed(), 2);
        equal(prop2(), 2);
        equal(notified, 1);
    });

    test("nested computed properties observe in a tree", function() {
        var prop = joga.objectProperty(1),
            computed = joga.computedProperty(function() {
                return prop();
            }),
            rootComputed = joga.computedProperty(function() {
                return computed();
            });

        equal(rootComputed(), 1);
        equal(rootComputed.observers.length, 0);
        equal(computed.observers.length, 1);
        equal(computed.observers[0], rootComputed.notify);
        equal(prop.observers.length, 1);
        equal(prop.observers[0], computed.notify);
    });

});