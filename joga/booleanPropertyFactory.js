define(['joga/objectPropertyFactory'], function(objectPropertyFactory) {
    
    function booleanPropertyFactory(initialValue) {
        
        function booleanProperty(value) {
            booleanProperty.this = this;
            return booleanProperty.evaluate(value);
        }
        
        objectPropertyFactory().mixinTo(booleanProperty);
        
        booleanProperty.toggle = function() {
            this.evaluate(!this.value);
            return this;
        };
        
        booleanProperty.initialize(initialValue);
        
        return booleanProperty;
    }

    return booleanPropertyFactory;
});