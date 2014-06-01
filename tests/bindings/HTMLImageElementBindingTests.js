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
    
    test("data-alt binding updates image alt", function() {
        var model = new Model();

        function Model() {
            this.name = joga.stringProperty("1");
            this.element = joga.elementProperty('<img data-alt="this.name()"/>');
        }

        equal(model.element().alt, "1");
        
        model.name("2");
        
        equal(model.element().alt, "2");
    });
});