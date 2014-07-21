define(['joga'], function (joga) {

    module("HTMLAnchorElementBinding");

    test("data-href binding updates href value when property changes", function() {
        var model = new Model();

        function Model() {
            this.url = joga.objectProperty("test1");
            this.element = joga.elementProperty('<a data-href="this.url()"/>');
        }

        equal(model.element().href.substr(-5), "test1");
        
        model.url('test2');
        
        equal(model.element().href.substr(-5), "test2");
    });
    
});