define(['joga'], function (joga) {

    module("elementProperty");

    test("can create an element", function () {
        var el = document.createElement("span"),
            element = joga.elementProperty(el);

        equal(element(), el);
        ok(element().binding);
    });

    test("can create a binding from an html string", function () {
        var element = joga.elementProperty('<span/>');

        ok(element() instanceof HTMLElement);
    });

    test("can create a binding from non html string", function () {
        var element = joga.elementProperty('123 test');

        ok(element() instanceof Text);
        equal(element().wholeText, '123 test');
    });

    test("can create a binding from a number", function () {
        var element = joga.elementProperty(123);

        ok(element() instanceof Text);
        equal(element().wholeText, '123');
    });

    test("can create a binding from a non element object", function () {
        var element = joga.elementProperty({test: 123});

        ok(element() instanceof Text);
        equal(element().wholeText, '[object Object]');
    });

    test("can create a binding from a non element object an call its toString method", function () {
        var element = joga.elementProperty({
                test: 123,
                toString: function() {
                    return "test";
                }
            });

        ok(element() instanceof Text);
        equal(element().wholeText, 'test');
    });

});