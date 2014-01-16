(function() {
    var just = {};

    just.property = function() {
        var value = null,
        observers = [],
        f = function(newValue) {
            var i;
            if (typeof(newValue) != 'undefined') {
                value = newValue;
                for (i = 0; i < observers.length; i++) {
                    observers[i](value);
                }
            }
            return value;
        };
        f.notify = function(observer) {
            observers.push(observer);
        };
        return f;
    };

    window.just = just;
})();
