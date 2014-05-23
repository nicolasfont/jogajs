define(['joga'], function (joga) {
    module('arrayProperty');

    test("array property can push value and notifies subscribers", function() {
        var prop = joga.arrayProperty([]),
            notified = 0;

        prop.subscribe(function() {
            notified = 1;
        });

        prop.push(1);

        equal(prop().length, 1);
        equal(prop()[0], 1);
        equal(notified, 1);
    });

    test("array property can pop value and notifies subscribers", function() {
        var prop = joga.arrayProperty([1, 2]),
            notified = 0;

        prop.subscribe(function() {
            notified = 1;
        });

        equal(prop.pop(), 2);
        equal(prop().length, 1);
        equal(prop()[0], 1);
        equal(notified, 1);
    });

    test("array property can remove values and notifies subscribers", function() {
        var prop = joga.arrayProperty([5, 3, 5]),
            notified = 0;

        prop.subscribe(function() {
            notified = 1;
        });

        prop.remove(5);

        equal(prop().length, 1);
        equal(prop()[0], 3);
        equal(notified, 1);
    });

    test("array property can clear its value and notifies subscribers", function() {
        var prop = joga.arrayProperty([5, 3, 5]),
            notified = 0;

        prop.subscribe(function() {
            notified = 1;
        });

        prop.clear();

        equal(prop().length, 0);
        equal(notified, 1);
    });

    test("array property can shift value and notifies subscribers", function() {
        var prop = joga.arrayProperty([5, 3]),
            notified = 0;

        prop.subscribe(function() {
            notified = 1;
        });

        equal(prop.shift(), 5);
        equal(prop().length, 1);
        equal(prop()[0], 3);
        equal(notified, 1);
    });

    test("array property can unshift value and notifies subscribers", function() {
        var prop = joga.arrayProperty([5]),
            notified = 0;

        prop.subscribe(function() {
            notified = 1;
        });

        prop.unshift(1);

        equal(prop().length, 2);
        equal(prop()[0], 1);
        equal(prop()[1], 5);
        equal(notified, 1);
    });

    test("array property can reverse value and notifies subscribers", function() {
        var prop = joga.arrayProperty([5, 1, 3]),
            notified = 0;

        prop.subscribe(function() {
            notified = 1;
        });

        prop.reverse();

        equal(prop().length, 3);
        equal(prop()[0], 3);
        equal(prop()[1], 1);
        equal(prop()[2], 5);
        equal(notified, 1);
    });

    test("array property can sort value and notifies subscribers", function() {
        var prop = joga.arrayProperty([5, 1, 3]),
            notified = 0;

        prop.subscribe(function() {
            notified = 1;
        });

        prop.sort();

        equal(prop().length, 3);
        equal(prop()[0], 1);
        equal(prop()[1], 3);
        equal(prop()[2], 5);
        equal(notified, 1);
    });

    test("array property can sort value using a comparator function and notifies subscribers", function() {
        var prop = joga.arrayProperty([5, 1, 3]),
            notified = 0;

        prop.subscribe(function() {
            notified = 1;
        });

        prop.sort(function(b, a) {
            return a - b;
        });

        equal(prop().length, 3);
        equal(prop()[0], 5);
        equal(prop()[1], 3);
        equal(prop()[2], 1);
        equal(notified, 1);
    });

    test("array property can get value by index", function() {
        var prop = joga.arrayProperty([5, 3, 1]);

        equal(prop.get(1), 3);
    });

    test("array property can put value by index and notifies subscribers", function() {
        var prop = joga.arrayProperty([5, 3, 1]),
            notified = 0;

        prop.subscribe(function() {
            notified = 1;
        });

        prop.put(1, 2);

        equal(prop()[1], 2);
        equal(notified, 1);
    });

    test("array property can iterate over value", function() {
        var model = new Model(),
            result = [],
            self;

        function Model() {
            this.prop = joga.arrayProperty([5, 3, 1]);
        }

        model.prop();

        model.prop.forEach(function(value, index) {
            result[index] = value;
            self = this;
        });

        equal(result.length, 3);
        equal(result[0], 5);
        equal(result[1], 3);
        equal(result[2], 1);
        equal(self, model);
    });

});