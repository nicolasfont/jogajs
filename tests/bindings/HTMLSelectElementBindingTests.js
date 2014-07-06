define(['joga'], function (joga) {

    module("HTMLSelectElementBinding");

    test("data-foreach binding creates options", function() {
        var model = new Model();

        function Option(text, value) {
            this.text = joga.stringProperty(text);
            this.value = joga.stringProperty(value);
        }

        function Model() {
            this.options = joga.arrayProperty([new Option("text1", "value1"), new Option("text2", "value2")]);
            this.selected = joga.stringProperty();
            this.element = joga.elementProperty('<select data-foreach="this.options()" data-text="this.text()" data-selected="this.selected()"/>');
        }

        equal(model.element().options.length, 2);
        equal(model.element().options[0].text, "text1");
        equal(model.element().options[1].text, "text2");

        model.options.push(new Option("text3", "value3"));

        equal(model.element().options.length, 3);
        equal(model.element().options[2].text, "text3");
    });

    test("data-foreach binding creates options without selected binding", function() {
        var model = new Model();

        function Option(text, value) {
            this.text = joga.stringProperty(text);
            this.value = joga.stringProperty(value);
        }

        function Model() {
            this.options = joga.arrayProperty([new Option("text1", "value1"), new Option("text2", "value2")]);
            this.element = joga.elementProperty('<select data-foreach="this.options()" data-text="this.text()"/>');
        }

        equal(model.element().options.length, 2);
        equal(model.element().options[0].text, "text1");
        equal(model.element().options[1].text, "text2");

        model.options.push(new Option("text3", "value3"));

        equal(model.element().options.length, 3);
        equal(model.element().options[2].text, "text3");
    });

    test("data-foreach binding creates options for strings", function() {
        var model = new Model();

        function Model() {
            this.options = joga.arrayProperty(["1", "2"]);
            this.selected = joga.stringProperty();
            this.element = joga.elementProperty('<select data-foreach="this.options()" data-text="this" data-selected="this.selected()"/>');
        }

        equal(model.element().options.length, 2);
        equal(model.element().options[0].text, "1");
        equal(model.element().options[1].text, "2");
    });

    test("data-text defaults to this", function() {
        var model = new Model();

        function Model() {
            this.options = joga.arrayProperty(["1", "2"]);
            this.selected = joga.stringProperty();
            this.element = joga.elementProperty('<select data-foreach="this.options()" data-selected="this.selected()"/>');
        }

        equal(model.element().options.length, 2);
        equal(model.element().options[0].text, "1");
        equal(model.element().options[1].text, "2");
    });

    test("data-text defaults when null", function() {
        var model = new Model();

        function Model() {
            this.options = joga.arrayProperty([null, "2"]);
            this.selected = joga.stringProperty();
            this.element = joga.elementProperty('<select data-foreach="this.options()" data-selected="this.selected()"/>');
        }

        equal(model.element().options.length, 2);
        equal(model.element().options[0].text, "null");
        equal(model.element().options[1].text, "2");
    });

    test("data-selected binding sets initial selected option", function() {
        var model = new Model();

        function Option(text, value) {
            this.text = joga.stringProperty(text);
            this.value = joga.stringProperty(value);
        }

        function Model() {
            this.options = joga.arrayProperty([new Option("text1", "value1"), new Option("text2", "value2")]);
            this.selected = joga.objectProperty(this.options()[1]);
            this.element = joga.elementProperty('<select data-foreach="this.options()" data-selected="this.selected()"/>');
        }

        equal(model.element().selectedIndex, 1);
    });

    test("data-selected binding sets initial default selected option", function() {
        var model = new Model();

        function Option(text, value) {
            this.text = joga.stringProperty(text);
            this.value = joga.stringProperty(value);
        }

        function Model() {
            this.options = joga.arrayProperty([new Option("text1", "value1"), new Option("text2", "value2")]);
            this.selected = joga.objectProperty();
            this.element = joga.elementProperty('<select data-foreach="this.options()" data-selected="this.selected()"/>');
        }

        equal(model.element().selectedIndex, 0);
        equal(model.selected(), model.options()[0]);
    });

    test("data-selected binding sets selected to null when no options", function() {
        var model = new Model();

        function Option(text, value) {
            this.text = joga.stringProperty(text);
            this.value = joga.stringProperty(value);
        }

        function Model() {
            this.options = joga.arrayProperty([]);
            this.selected = joga.objectProperty(123);
            this.element = joga.elementProperty('<select data-foreach="this.options()" data-selected="this.selected()"/>');
        }

        model.element();
        equal(model.selected(), null);
    });

    test("data-selected binding updates selected option", function() {
        var model = new Model();

        function Option(text, value) {
            this.text = joga.stringProperty(text);
            this.value = joga.stringProperty(value);
        }

        function Model() {
            this.options = joga.arrayProperty([new Option("text1", "value1"), new Option("text2", "value2")]);
            this.selected = joga.objectProperty();
            this.element = joga.elementProperty('<select data-foreach="this.options()" data-selected="this.selected()"/>');
        }

        model.selected(model.options()[1]);

        equal(model.element().selectedIndex, 1);

        model.selected(model.options()[0]);

        equal(model.element().selectedIndex, 0);
    });

    test("data-selected binding updates property when selection changes", function() {
        var model = new Model();

        function Option(text, value) {
            this.text = joga.stringProperty(text);
            this.value = joga.stringProperty(value);
        }

        function Model() {
            this.options = joga.arrayProperty([new Option("text1", "value1"), new Option("text2", "value2")]);
            this.selected = joga.objectProperty();
            this.element = joga.elementProperty('<select data-foreach="this.options()" data-selected="this.selected()"/>');
        }

        model.element().options[1].selected = true;

        model.element().onchange();

        equal(model.selected(), model.options()[1]);
        equal(model.element().selectedIndex, 1);
    });
    
    test("data-text binding updates element when property changes", function() {
        var model = new Model();

        function Option(text, value) {
            this.text = joga.stringProperty(text);
            this.value = joga.stringProperty(value);
        }

        function Model() {
            this.options = joga.arrayProperty([new Option("text1", "value1"), new Option("text2", "value2")]);
            this.selected = joga.objectProperty();
            this.element = joga.elementProperty('<select data-foreach="this.options()" data-selected="this.selected()" data-text="this.text()"/>');
        }

        model.element();

        equal(model.element().childNodes[0].text, "text1");
        
        model.options()[0].text("text1b");
        
        
        equal(model.element().childNodes[0].text, "text1b");
    });

});
