define(['joga/objectProperty'], function(objectProperty) {
    
    function stringPropertyFactory(initialValue) {
        
        function stringProperty(value) {
            stringProperty.this = this;
            return stringProperty.evaluate(value);
        }
        
        objectProperty().mixinTo(stringProperty);
        
        stringProperty.isBlank = isBlank;
        stringProperty.isNotBlank = isNotBlank;
        stringProperty.isEmpty = isEmpty;
        stringProperty.isNotEmpty = isNotEmpty;
        
        stringProperty.initialize(initialValue);
        
        return stringProperty;
    }
    
    function isBlank() {
        return this() === null || this().trim() === "";
    }

    function isNotBlank() {
        return !this.isBlank();
    }

    function isEmpty() {
        return this() === null || this() === "";
    }

    function isNotEmpty() {
        return !this.isEmpty();
    }

    return stringPropertyFactory;
});