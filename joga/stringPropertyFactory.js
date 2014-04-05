define(['joga/objectPropertyFactory'], function(objectPropertyFactory) {
    
    function stringPropertyFactory(initialValue) {
        
        function stringProperty(value) {
            stringProperty.this = this;
            return stringProperty.evaluate(value);
        }
        
        objectPropertyFactory().mixinTo(stringProperty);
        
        stringProperty.isBlank = function() {
            return this() === null || this().trim() === "";
        };
        
        stringProperty.isNotBlank = function() {
            return !this.isBlank();
        };
        
        stringProperty.isEmpty = function() {
            return this() === null || this() === "";
        };
        
        stringProperty.isNotEmpty = function() {
            return !this.isEmpty();
        };
        
        stringProperty.initialize(initialValue);
        
        return stringProperty;
    }

    return stringPropertyFactory;
});