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
        f.unsubscribe = function(observer) {
            var index = observers.indexOf(observer);
            if (index != -1) {
                observers.splice(index, 1);
            }
            return this;
        };
        return f;
    };

    window.just = just;
})();
