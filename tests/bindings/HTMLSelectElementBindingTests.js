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
            this.element = joga.elementProperty('<select data-foreach="this.options()" data-text="this.text()" data-value="this.value()"/>');
        }

        equal(model.element().options.length, 2);
        equal(model.element().options[0].text, "text1");
        equal(model.element().options[0].value, "value1");
        equal(model.element().options[1].text, "text2");
        equal(model.element().options[1].value, "value2");

        model.options.push(new Option("text3", "value3"));

        equal(model.element().options.length, 3);
        equal(model.element().options[2].text, "text3");
        equal(model.element().options[2].value, "value3");
    });

    test("data-foreach binding updates options", function() {
        var model = new Model();

        function Option(text, value) {
            this.text = joga.stringProperty(text);
            this.value = joga.stringProperty(value);
        }

        function Model() {
            this.options = joga.arrayProperty([new Option("text1", "value1"), new Option("text2", "value2")]);
            this.element = joga.elementProperty('<select data-foreach="this.options()" data-text="this.text()" data-value="this.value()"/>');
        }

        equal(model.element().options.length, 2);

        model.options.push(new Option("text3", "value3"));

        equal(model.element().options.length, 3);
        equal(model.element().options[2].text, "text3");
        equal(model.element().options[2].value, "value3");
    });

});