define(['joga/objectProperty'], function (objectProperty) {
    
    function booleanPropertyFactory(initialValue) {
        
        function booleanProperty(value) {
            return booleanProperty.evaluate(value, this);
        }
        
        objectProperty().mixinTo(booleanProperty);
        
        booleanProperty.toggle = toggle;
        
        booleanProperty.initialize(initialValue);
        
        return booleanProperty;
    }
    
    function toggle() {
        this.evaluate(!this.value);
        return this;
    }

    return booleanPropertyFactory;
});