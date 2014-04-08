define(['joga/objectProperty'], function (objectProperty) {
    
    function arrayPropertyFactory(initialValue) {

        function arrayProperty(value) {
            return arrayProperty.evaluate(value, this);
        }

        objectProperty().mixinTo(arrayProperty);

        arrayProperty.push = push;
        arrayProperty.pop = pop;
        arrayProperty.remove = remove;
        arrayProperty.clear = clear;
        arrayProperty.shift = shift;
        arrayProperty.unshift = unshift;
        arrayProperty.reverse = reverse;
        arrayProperty.sort = sort;
        arrayProperty.forEach = forEach;

        arrayProperty.initialize(initialValue);

        return arrayProperty;
    }

    function push(value) {
        this.value.push(value);
        this.notify();
        return this;
    }

    function pop() {
        var popped = this.value.pop();
        this.notify();
        return popped;
    }

    function remove(value) {
        var index = this.value.indexOf(value);
        while (index !== -1) {
            this.value.splice(index, 1);
            index = this.value.indexOf(value);
        }
        this.notify();
    }

    function clear() {
        this([]);
        this.notify();
    }

    function shift() {
        var shifted = this().shift();
        this.notify();
        return shifted;
    }

    function unshift(value) {
        this().unshift(value);
        this.notify();
    }

    function reverse() {
        this().reverse();
        this.notify();
    }

    function sort(comparator) {
        this().sort(comparator);
        this.notify();
    }

    function forEach(iterator) {
        var i;

        if (this().forEach) {
            this.value.forEach(iterator.bind(this.self));
        } else {
            for (i = 0; i < this.value.length; i++) {
                iterator.call(this.self, this.value[i], i);
            }
        }
    }

    return arrayPropertyFactory;
});