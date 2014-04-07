define(['joga/objectProperty'], function (objectProperty) {
    
    function arrayPropertyFactory(initialValue) {
        
        function arrayProperty(value) {
            arrayProperty.this = this;
            return arrayProperty.evaluate(value);
        }
        
        objectProperty().mixinTo(arrayProperty);
        
        arrayProperty.push = push;
        arrayProperty.pop = pop;
        arrayProperty.remove = remove;
        arrayProperty.clear = clear;
        
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

    return arrayPropertyFactory;
});