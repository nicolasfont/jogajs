define(['joga/objectPropertyFactory'], function (objectPropertyFactory) {
    
    function booleanPropertyFactory(initialValue) {
        
        function booleanProperty(value) {
            booleanProperty.this = this;
            return booleanProperty.evaluate(value);
        }
        
        objectPropertyFactory().mixinTo(booleanProperty);
        
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