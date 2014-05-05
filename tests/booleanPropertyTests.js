module('booleanProperty');

test("boolean property can toggle value and notifies subscribers", function() {
    var prop = joga.booleanProperty(false),
        notified = 0;
    
    prop.subscribe(function() {
        notified = 1;
    });
    
    prop.toggle();
    
    equal(prop(), true);
    equal(notified, 1);
    
});
