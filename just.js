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
                return this;
            }
            return value;
        };
        f.subscribe = function(observer) {
            observers.push(observer);
            return this;
        };
        return f;
    };

    window.just = just;
})();
