define(['../joga'], function(joga) {
    module('stringProperty');
    
    test("string property isBlank returns true when null", function() {
        var prop = joga.string();
        
        equal(prop.isBlank(), true);
    });
    
    test("string property isBlank returns true when empty string", function() {
        var prop = joga.string("");
        
        equal(prop.isBlank(), true);
    });
    
    test("string property isBlank returns true when blank string", function() {
        var prop = joga.string(" ");
        
        equal(prop.isBlank(), true);
    });
    
    test("string property isBlank returns false when non blank string", function() {
        var prop = joga.string("test");
        
        equal(prop.isBlank(), false);
    });
    
    test("string property isNotBlank returns false when null", function() {
        var prop = joga.string();
        
        equal(prop.isNotBlank(), false);
    });
    
    test("string property isNotBlank returns false when empty string", function() {
        var prop = joga.string("");
        
        equal(prop.isNotBlank(), false);
    });
    
    test("string property isNotBlank returns false when blank string", function() {
        var prop = joga.string(" ");
        
        equal(prop.isNotBlank(), false);
    });
    
    test("string property isNotBlank returns true when non blank string", function() {
        var prop = joga.string("test");
        
        equal(prop.isNotBlank(), true);
    });
    
    test("string property isEmpty returns true when null", function() {
        var prop = joga.string();
        
        equal(prop.isEmpty(), true);
    });
    
    test("string property isEmpty returns true when empty string", function() {
        var prop = joga.string("");
        
        equal(prop.isEmpty(), true);
    });
    
    test("string property isEmpty returns false when blank string", function() {
        var prop = joga.string(" ");
        
        equal(prop.isEmpty(), false);
    });
    
    test("string property isEmpty returns false when non blank string", function() {
        var prop = joga.string("test");
        
        equal(prop.isEmpty(), false);
    });
    
    
    test("string property isNotEmpty returns false when null", function() {
        var prop = joga.string();
        
        equal(prop.isNotEmpty(), false);
    });
    
    test("string property isNotEmpty returns false when empty string", function() {
        var prop = joga.string("");
        
        equal(prop.isNotEmpty(), false);
    });
    
    test("string property isNotEmpty returns true when blank string", function() {
        var prop = joga.string(" ");
        
        equal(prop.isNotEmpty(), true);
    });
    
    test("string property isNotEmpty returns true when non blank string", function() {
        var prop = joga.string("test");
        
        equal(prop.isNotEmpty(), true);
    });
});