define(['../joga'], function(joga) {
    module('arrayProperty');
    
    test("array property can push value and notifies subscribers", function() {
        var prop = joga.array([]),
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
        var prop = joga.array([1, 2]),
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
        var prop = joga.array([5, 3, 5]),
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
        var prop = joga.array([5, 3, 5]),
            notified = 0;
        
        prop.subscribe(function() {
            notified = 1;
        });
        
        prop.clear();
        
        equal(prop().length, 0);
        equal(notified, 1);
    });
});