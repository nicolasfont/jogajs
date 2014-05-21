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
