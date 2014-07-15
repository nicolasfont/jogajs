define(['joga'], function (joga) {

    module("HTMLInputElementBinding");

    test("data-value binding updates input text value", function() {
        var model = new Model();

        function Model() {
            this.name = joga.objectProperty("test");
            this.element = joga.elementProperty('<input type="text" data-value="this.name()"/>');
        }

        equal(model.element().value, "test");
    });

    test("data-value binding updates property when input text value changes", function() {
        var model = new Model();

        function Model() {
            this.name = joga.objectProperty("");
            this.element = joga.elementProperty('<input type="text" data-value="this.name()"/>');
        }

        model.element().value = "test";
        model.element().onchange();

        equal(model.name(), "test");
    });

    test("data-checked binding updates input checked attribute", function() {
        var model = new Model();

        function Model() {
            this.test = joga.booleanProperty(true);
            this.element = joga.elementProperty('<input type="checkbox" data-checked="this.test()"/>');
        }

        equal(model.element().checked, true);

        model.test(false);

        equal(model.element().checked, false);
    });

    test("data-checked binding updates property when input checkbox changes", function() {
        var model = new Model();

        function Model() {
            this.test = joga.booleanProperty(false);
            this.element = joga.elementProperty('<input type="checkbox" data-checked="this.test()"/>');
        }

        model.element().checked = true;
        model.element().onchange();

        equal(model.test(), true);

        model.element().checked = false;
        model.element().onchange();

        equal(model.test(), false);
    });
    
    test("input radio bindings update property when element changes", function () {
        var model = new Model();

        function Model() {
            this.selected = joga.objectProperty();
            this.selectedValue = joga.objectProperty({});
            this.element = joga.elementProperty('<input type="radio" data-selectedvalue="this.selectedValue()" data-selected="this.selected()"/>');
        }
        
        model.element().checked = true;
        model.element().onchange();
        
        equal(model.selected(), model.selectedValue());
        
        model.element().checked = false;
        model.element().onchange();
        
        equal(model.selected(), null);
    });
    
    test("input radio bindings update element when property changes", function () {
        var model = new Model();

        function Model() {
            this.selected = joga.objectProperty();
            this.selectedValue = joga.objectProperty({});
            this.element = joga.elementProperty('<input type="radio" data-selectedvalue="this.selectedValue()" data-selected="this.selected()"/>');
        }
        
        model.selected(model.selectedValue());
        
        ok(model.element().checked);
        
        model.selected(null);
        
        ok(!model.element().checked);
    });

});