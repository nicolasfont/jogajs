define(['joga'], function (joga) {

    module("HTMLTextAreaElementBinding");

    test("data-value binding updates textarea value when property changes", function() {
        var model = new Model();

        function Model() {
            this.name = joga.objectProperty("test");
            this.element = joga.elementProperty('<textarea data-value="this.name()"/>');
        }

        equal(model.element().value, "test");
        
        model.name('test2');
        
        equal(model.element().value, "test2");
    });

    test("data-value binding updates property when textarea value changes", function() {
        var model = new Model();

        function Model() {
            this.name = joga.objectProperty("");
            this.element = joga.elementProperty('<textarea data-value="this.name()"/>');
        }

        model.element().value = "test";
        model.element().onchange();

        equal(model.name(), "test");
    });
    
});