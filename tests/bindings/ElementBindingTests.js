module("ElementBinding");

test("can bind data-class attribute to object property", function() {
    var model = new Model();

    function Model() {
        this.class = joga.objectProperty("test");
        this.element = joga.elementProperty('<span data-class="this.class()"/>');
    }

    equal(model.element().className, "test");
});

test("can bind data-class attribute to object value", function() {
    var model = new Model();

    function Model() {
        this.class = "test";
        this.element = joga.elementProperty('<span data-class="this.class"/>');
    }

    equal(model.element().className, "test");
});

test("updating object property updates binding", function() {
    var model = new Model();

    function Model() {
        this.class = joga.objectProperty("test");
        this.element = joga.elementProperty('<span data-class="this.class()"/>');
    }

    model.class("test2");

    equal(model.element().className, "test2");
    
    model.class("test3");

    equal(model.element().className, "test3");
});

test("updating object nested property updates binding", function() {
    var parent = new Parent();

    function Parent() {
        this.child = joga.objectProperty(new Child());
        this.element = joga.elementProperty('<span data-class="this.child().class()"/>');
    }

    function Child() {
        this.class = joga.objectProperty("test");
    }

    parent.child().class("test2");

    equal(parent.element().className, "test2");
    
    parent.child().class("test3");

    equal(parent.element().className, "test3");
});

test("updating object parent property updates binding", function() {
    var parent = new Parent();

    function Parent() {
        this.child = joga.objectProperty(new Child('test1'));
        this.element = joga.elementProperty('<span data-class="this.child().class()"/>');
    }

    function Child(clazz) {
        this.class = joga.objectProperty(clazz);
    }

    parent.child(new Child('test2'));

    equal(parent.element().className, 'test2');
    
    parent.child(new Child('test3'));

    equal(parent.element().className, 'test3');
});

test("can bind data-title", function() {
    var model = new Model();

    function Model() {
        this.title = joga.objectProperty("test");
        this.element = joga.elementProperty('<span data-title="this.title()"/>');
    }

    equal(model.element().title, "test");
});

test("can bind two data attributes", function() {
    var model = new Model();

    function Model() {
        this.title = joga.objectProperty("title1");
        this.class = joga.objectProperty("class1");
        this.element = joga.elementProperty('<span data-title="this.title()" data-class="this.class()"/>');
    }

    equal(model.element().title, "title1");
    equal(model.element().className, "class1");
});

test("can bind two data attributes and update them", function() {
    var model = new Model();

    function Model() {
        this.title = joga.objectProperty("title1");
        this.class = joga.objectProperty("class1");
        this.element = joga.elementProperty('<span data-title="this.title()" data-class="this.class()"/>');
    }

    model.title("title2");
    model.class("class2");

    equal(model.element().title, "title2");
    equal(model.element().className, "class2");
});

test("can bind nested elements", function() {
    var model = new Model();

    function Model() {
        this.name = joga.objectProperty("test");
        this.element = joga.elementProperty('<div data-class="this.name()">some text node<span data-class="this.name()"><div data-class="this.name()"/></span>some other text node</div>');
    }
    
    equal(model.element().className, "test");
    equal(model.element().childNodes[1].className, "test");
    equal(model.element().childNodes[1].childNodes[0].className, "test");
});

test("data-class binding preserves existing classes", function() {
    var model = new Model();

    function Model() {
        this.class = joga.objectProperty("test");
        this.element = joga.elementProperty('<span class="existing1 existing2" data-class="this.class()"/>');
    }

    model.class("test2");

    equal(model.element().className, "existing1 existing2 test2");
});

test("data-text binding updates Text node", function() {
    var model = new Model();

    function Model() {
        this.name = joga.objectProperty("test");
        this.element = joga.elementProperty('<span data-text="this.name()"></span>');
    }

    equal(model.element().childNodes.length, 1);
    equal(model.element().childNodes[0].textContent, "test");
});

test("data-text binding updates Text node overwriting existing text", function() {
    var model = new Model();

    function Model() {
        this.name = joga.objectProperty("test1");
        this.element = joga.elementProperty('<span data-text="this.name()">test2</span>');
    }

    equal(model.element().childNodes.length, 1);
    equal(model.element().childNodes[0].textContent, "test1");
});

test("data-text binding updates Text node overwriting existing text and elements", function() {
    var model = new Model();

    function Model() {
        this.name = joga.objectProperty("test1");
        this.element = joga.elementProperty('<span data-text="this.name()">test2<div>test3</div></span>');
    }

    equal(model.element().childNodes.length, 1);
    equal(model.element().childNodes[0].textContent, "test1");
});

test("data-id binding updates element id", function() {
    var model = new Model();

    function Model() {
        this.id = joga.objectProperty("123");
        this.element = joga.elementProperty('<span data-id="this.id()"/>');
    }

    equal(model.element().id, "123");
});

test("data-onclick evaluates property", function() {
    var model = new Model(),
        called;

    function Model() {
        this.element = joga.elementProperty('<span data-onclick="this.clickHandler()"/>');
    }

    Model.prototype.clickHandler = function() {
        called = true;
    };

    model.element().click();

    ok(called);
});

test("data-child binds element", function() {
    var model,
        childElement = document.createElement("div");

    function Model() {
        this.el = joga.objectProperty(childElement);
        this.element = joga.elementProperty('<div data-child="this.el()">test<div>test</div></div>');
    }

    model = new Model()

    equal(model.element().childNodes.length, 1);
    equal(model.element().childNodes[0], childElement);
});

test("data-child binds nested element", function() {
    var child1 = new Child("test1"),
        child2 = new Child("test2"),
        parent = new Parent();

    function Parent() {
        this.child = joga.objectProperty(child1);
        this.element = joga.elementProperty('<div data-child="this.child().element()">test<div>test</div></div>');
    }

    function Child(name) {
        this.name = joga.objectProperty(name);
        this.element = joga.elementProperty('<span data-title="this.name()"/>');
    }

    equal(parent.element().childNodes.length, 1);
    equal(parent.element().childNodes[0].title, "test1");

    parent.child(child2);

    equal(parent.element().childNodes.length, 1);
    equal(parent.element().childNodes[0].title, "test2");
});

test("data-childNodes binds element array", function() {
    var model,
        el1 = document.createElement("div"),
        el2 = document.createElement("div"),
        el3 = document.createElement("div");
    
    function Model() {
        this.elements = joga.objectProperty([el1, el2]);
        this.element = joga.elementProperty('<div data-childnodes="this.elements()"/>');
    }

    model = new Model();

    equal(model.element().childNodes.length, 2);
    equal(model.element().childNodes[0], el1);
    equal(model.element().childNodes[1], el2);

    model.elements().push(el3);
    model.elements.notify();
    
    equal(model.element().childNodes.length, 3);
    equal(model.element().childNodes[0], el1);
    equal(model.element().childNodes[1], el2);
    equal(model.element().childNodes[2], el3);
});

test("data-childNodes adds elements after binding", function() {
    var model,
        el1 = document.createElement("div"),
        el2 = document.createElement("div");
        
    function Model() {
        this.elements = joga.objectProperty([]);
        this.element = joga.elementProperty('<div data-childnodes="this.elements()"/>');
    }
    
    model = new Model();
    
    model.element();
    
    model.elements().push(el1);
    model.elements.notify();
    
    model.elements().push(el2);
    model.elements.notify();
    
    equal(model.element().childNodes.length, 2);
    equal(model.element().childNodes[0], el1);
    equal(model.element().childNodes[1], el2);
});

test("data-foreach with data-do bind element array", function() {
    var parent = new Parent();
    
    function Parent() {
        this.models = joga.objectProperty([new Child("test1"), new Child("test2")]);
        this.element = joga.elementProperty('<div data-foreach="this.models()" data-do="this.view()"/>');
    }
    
    function Child(name) {
        this.name = joga.objectProperty(name);
        this.view = joga.elementProperty('<div data-title="this.name()"/>');
    }
    
    equal(parent.element().childNodes.length, 2);
    equal(parent.element().childNodes[0].title, "test1");
    equal(parent.element().childNodes[1].title, "test2");
    
    parent.models().push(new Child("test3"));
    parent.models.notify();
    
    equal(parent.element().childNodes.length, 3);
    equal(parent.element().childNodes[0].title, "test1");
    equal(parent.element().childNodes[1].title, "test2");
    equal(parent.element().childNodes[2].title, "test3");
});

test("data-foreach with data-do bind element array when bindings in reverse order", function() {
    var parent = new Parent();
    
    function Parent() {
        this.models = joga.objectProperty([new Child("test1"), new Child("test2")]);
        this.element = joga.elementProperty('<div data-do="this.view()" data-foreach="this.models()"/>', this);
    }
    
    function Child(name) {
        this.name = joga.objectProperty(name);
        this.view = joga.elementProperty('<div data-title="this.name()"/>', this);
    }
    
    equal(parent.element().childNodes.length, 2);
    equal(parent.element().childNodes[0].title, "test1");
    equal(parent.element().childNodes[1].title, "test2");
    
    parent.models().push(new Child("test3"));
    parent.models.notify();
    
    equal(parent.element().childNodes.length, 3);
    equal(parent.element().childNodes[0].title, "test1");
    equal(parent.element().childNodes[1].title, "test2");
    equal(parent.element().childNodes[2].title, "test3");
});

test("foreach do bindings bind to each model", function() {
    function Child(description) {
        this.isEditing = joga.objectProperty(false);
        this.viewElement = joga.elementProperty('<div/>');
        this.editElement = joga.elementProperty('<div/>');
        this.element = joga.computedProperty(function () {
            return this.isEditing() ? this.editElement() : this.viewElement();
        });
    }

    function Parent() {
        this.children = joga.objectProperty([]);
        this.element = joga.elementProperty('<div data-foreach="this.children()" data-do="this.element()"></div>');
    }
    
    Parent.prototype.add = function (description) {
        var child = new Child(description);
        this.children().push(child);
        this.children.notify();
    };
    
    var parent = new Parent();
    parent.element();
    
    window.parent = parent;
    
    parent.add('test1');
    parent.element();
    
    parent.add('test2');
    parent.element();
    
    parent.children()[0].isEditing(true);
    parent.element();
    
    equal(parent.element().childNodes[0], parent.children()[0].editElement());
    
    parent.children()[1].isEditing(true);
    parent.element();
    
    equal(parent.element().childNodes[1], parent.children()[1].editElement());
});
