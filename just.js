(function() {
    var just = {};

    just.property = function() {
        var value = null;
        return function(newValue) {
            if (typeof(newValue) != 'undefined') {
                value = newValue;
            }
            return value;
        };
    };

    window.just = just;
})();
