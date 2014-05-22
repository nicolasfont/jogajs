define(['joga/objectProperty'], function (objectProperty) {
    
    function stringPropertyFactory(initialValue) {
        
        function stringProperty(value) {
            return stringProperty.evaluate(value, this);
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
        return this.applySelf() === null || this.applySelf().trim() === "";
    }

    function isNotBlank() {
        return !this.isBlank();
    }

    function isEmpty() {
        return this.applySelf() === null || this.applySelf() === "";
    }

    function isNotEmpty() {
        return !this.isEmpty();
    }

    return stringPropertyFactory;
});