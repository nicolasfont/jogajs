define(['joga'], function (joga) {

    module("HTMLImageElementBinding");

    test("data-src binding updates image src", function() {
        var model = new Model();

        function Model() {
            this.imageUrl = joga.stringProperty("http://jogajs.test/1");
            this.element = joga.elementProperty('<img data-src="this.imageUrl()"/>');
        }

        equal(model.element().src, "http://jogajs.test/1");
        
        model.imageUrl("http://jogajs.test/2");
        
        equal(model.element().src, "http://jogajs.test/2");
    });
});