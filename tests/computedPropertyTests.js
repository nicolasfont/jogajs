define(['../joga'], function(joga) {
    module('computedProperty');
    
    test("computed property returns value", function() {
        var property = joga.computed(function() {
            return 1;
        });
    
        equal(property(), 1);
    });
    
    test("computed property notifies subscribers when dependency changes", function() {
        var prop1 = joga.property(),
        computed = joga.computed(function() {
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
        var prop1 = joga.property(),
        computed = joga.computed(function() {
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
        var prop1 = joga.property(),
        computed = joga.computed(function() {
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
        computed = joga.computed(function() {
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
        computed = joga.computed(function() {
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
        computed = joga.computed(function() {
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
        computed = joga.computed(function() {
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
        computed = joga.computed(function() {
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
        
        computed();
    
        prop2(3);
    
        equal(notified, 1);
        equal(computed(), 2);
    });
    
    test("computed property notifies subscribers twice when nested dependency is updated after parent dependency is updated", function() {
        var prop2 = joga.property(1),
        prop1 = joga.property({
            prop2: prop2
        }),
        computed = joga.computed(function() {
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
        
        computed();
    
        prop1().prop2(3);
    
        equal(notified, 2);
        equal(computed(), 3);
    });
    
    test("computed property calls function with the correct this object", function() {
        var model;
        
        function Model() {
            this.firstName = joga.property("first");
            this.lastName = joga.property("last");
            this.name = joga.computed(function() {
                return this.firstName() + " " + this.lastName();
            });
        }
        
        model = new Model();
        
        equal("first last", model.name());
    });
    
    test("computed property passes parameter as an argument to its function", function() {
        var passed,
        notified = 0,
        computed = joga.computed(function(arg) {
            if (arg !== undefined) {
                passed = arg;
                computed.notify();
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
    
    test("computed property notifies subscribers only once when wrapped property is also a dependency and is updated", function() {
        var prop1 = joga.property(1),
        computed = joga.computed(function() {
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
        var prop1 = joga.property(1),
        computed = joga.computed(function() {
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
        var prop2 = joga.property(1),
        prop1 = joga.property({
            prop2: prop2
        }),
        computed = joga.computed(function() {
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
        var prop = joga.property(1),
            computed = joga.computed(function() {
                return prop();
            }),
            rootComputed = joga.computed(function() {
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