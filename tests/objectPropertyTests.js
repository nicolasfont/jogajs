module('objectProperty');

test("is a function", function() {
    ok(typeof(joga.object()) === 'function');
});

test("returns null when not initialized", function() {
    var property = joga.object();

    equal(property(), null);
    notEqual(typeof(property()), 'undefined');
});

test("can hold a value", function() {
    var property = joga.object();

    property('value');

    equal(property(), 'value');
});

test("can be initialized with a value", function() {
    var property = joga.object('value');

    equal(property(), 'value');
});

test("can hold a value when assigned to an object", function() {
    var obj = {
        property: joga.object()
    };

    obj.property('value');

    equal(obj.property(), 'value');
});

test("can be chained when setting", function() {
    var obj = {
        property: joga.object()
    };

    var o = obj.property('value');

    equal(o, obj);
});

test("can be reassigned with null", function() {
    var property = joga.object();

    property('value');
    property(null);

    equal(property(), null);
});

test("notifies observers when property is set", function() {
    var property = joga.object(),
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
    
test("notifies only initial observers when property is set", function() {
    var property = joga.object(),
        notified1 = false,
        notified2 = false;
    
    property.subscribe(function(value) {
        notified1 = true;
        property.subscribe(function(value) {
            notified2 = value;
        });
    });
    
    property('value');

    ok(notified1);
    ok(!notified2);
});

test("can unsubscribe observers", function() {
    var property = joga.object(),
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
    var property = joga.object(),
    notified;

    property.subscribe(function(value) {
        notified = value;
    }).unsubscribe(function() {});

    property('value');

    equal(notified, property);
});

test("joga.property is an alias of joga.object", function() {
    equal(joga.property, joga.object);
});

test("object property isNull returns true when null", function() {
    var prop = joga.object();
    
    equal(prop.isNull(), true);
});

test("object property isNull returns false when not null", function() {
    var prop = joga.object({});
    
    equal(prop.isNull(), false);
});

test("object property isNull can be chained", function() {
    var model = new Model();
    
    function Model() {
        this.prop = joga.object();
    }
    
    equal(model.prop.isNull(), true);
    equal(model.prop(1).prop.isNull(), false);
});

test("object property isNotNull returns true when not null", function() {
    var prop = joga.object({});
    
    equal(prop.isNotNull(), true);
});

test("object property isNotNull returns false when null", function() {
    var prop = joga.object();
    
    equal(prop.isNotNull(), false);
});

test("object property can get element by key", function() {
    var prop = joga.object({
        key: 1
    });
    
    equal(prop.get('key'), 1);
});

test("object property can put element and notifies subscribers", function() {
    var prop = joga.object({});
    
    prop.put('key', 1);
    
    equal(prop().key, 1);
});

test("object property can iterate over value", function() {
    var prop = joga.object({
        a: 1,
        b: 2
    }),
    result = [];
    
    prop.forEach(function(value, key) {
        result.push({
            key: key,
            value: value
        });
    });
    
    equal(result.length, 2);
    equal(result[0].key, 'a');
    equal(result[0].value, 1);
    equal(result[1].key, 'b');
    equal(result[1].value, 2);
});
