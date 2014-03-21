module("bindings");

test("can create an element", function () {
    var el = document.createElement("span"),
    element = joga.element(el);

    equal(element(), el);
    ok(element().binding);
});

test("can create a binding from an html string", function () {
    var element = joga.element('<span/>');

    ok(element() instanceof HTMLSpanElement);
});

test("can create a binding from non html string", function () {
    var element = joga.element('123 test');

    ok(element() instanceof Text);
    equal(element().wholeText, '123 test');
});

test("can create a binding from a number", function () {
    var element = joga.element(123);

    ok(element() instanceof Text);
    equal(element().wholeText, '123');
});

test("can create a binding from a non element object", function () {
    var element = joga.element({test: 123});

    ok(element() instanceof Text);
    equal(element().wholeText, '[object Object]');
});

test("can create a binding from a non element object an call its toString method", function () {
    var element = joga.element({
        test: 123,
        toString: function() {
            return "test";
        }
    });

    ok(element() instanceof Text);
    equal(element().wholeText, 'test');
});

test("can bind data-class attribute to object property", function() {
	var model;
	
	function Model() {
        this.class = joga.property("test");
        this.element = joga.element('<span data-class="this.class()"/>');
	}
	
	model = new Model();
	
    equal(model.element().className, "test");
    ok(model.element().binding.dataProperties.class);
});

test("can bind data-class attribute to object value", function() {
    var model;
	
	function Model() {
        this.class = "test";
        this.element = joga.element('<span data-class="this.class"/>');
	}
	
	model = new Model();

    equal(model.element().className, "test");
});

test("updating object property updates binding", function() {
    var model;
	
	function Model() {
        this.class = joga.property("test");
        this.element = joga.element('<span data-class="this.class()"/>');
	}
	
	model = new Model();
	
    model.class("test2");

    equal(model.element().className, "test2");
    
    model.class("test3");

    equal(model.element().className, "test3");
});

test("updating object nested property updates binding", function() {
    var parent;
	
	function Parent() {
        this.child = joga.property(new Child());
        this.element = joga.element('<span data-class="this.child().class()"/>');
	}
	
	function Child() {
        this.class = joga.property("test");
	}
	
	parent = new Parent();

    parent.child().class("test2");

    equal(parent.element().className, "test2");
    
    parent.child().class("test3");

    equal(parent.element().className, "test3");
});

test("updating object parent property updates binding", function() {
    var parent;
	
	function Parent() {
        this.child = joga.property(new Child('test1'));
        this.element = joga.element('<span data-class="this.child().class()"/>');
	}
	
	function Child(clazz) {
        this.class = joga.property(clazz);
	}
	
	parent = new Parent();

    parent.child(new Child('test2'));

    equal(parent.element().className, 'test2');
    
    parent.child(new Child('test3'));

    equal(parent.element().className, 'test3');
});

test("can bind data-title", function() {
    var model;
	
	function Model() {
        this.title = joga.property("test");
        this.element = joga.element('<span data-title="this.title()"/>');
	}
	
	model = new Model();

    equal(model.element().title, "test");
});

test("can bind two data attributes", function() {
    var model;
	
	function Model() {
        this.title = joga.property("title1");
        this.class = joga.property("class1");
        this.element = joga.element('<span data-title="this.title()" data-class="this.class()"/>');
	}
	
	model = new Model();
	
    equal(model.element().title, "title1");
    equal(model.element().className, "class1");
});

test("can bind two data attributes and update them", function() {
    var model;
	
	function Model() {
        this.title = joga.property("title1");
        this.class = joga.property("class1");
        this.element = joga.element('<span data-title="this.title()" data-class="this.class()"/>');
	}
	
	model = new Model();
	
    model.title("title2");
    model.class("class2");
	
    equal(model.element().title, "title2");
    equal(model.element().className, "class2");
});

test("can bind nested elements", function() {
    var model;
	
	function Model() {
        this.name = joga.property("test");
        this.element = joga.element('<div data-class="this.name()">some text node<span data-class="this.name()"><div data-class="this.name()"/></span>some other text node</div>');
	}
	
	model = new Model();
    
    equal(model.element().className, "test");
    equal(model.element().childNodes[1].className, "test");
    equal(model.element().childNodes[1].childNodes[0].className, "test");
});

test("data-class binding preserves existing classes", function() {
    var model;
	
	function Model() {
        this.class = joga.property("test");
        this.element = joga.element('<span class="existing1 existing2" data-class="this.class()"/>');
	}
	
	model = new Model();

    model.class("test2");

    equal(model.element().className, "existing1 existing2 test2");
});

test("data-text binding updates Text node", function() {
    var model;
	
	function Model() {
        this.name = joga.property("test");
        this.element = joga.element('<span data-text="this.name()"></span>');
	}
	
	model = new Model();

    equal(model.element().childNodes.length, 1);
    equal(model.element().childNodes[0].textContent, "test");
});

test("data-text binding updates Text node overwriting existing text", function() {
    var model;
	
	function Model() {
        this.name = joga.property("test1");
        this.element = joga.element('<span data-text="this.name()">test2</span>');
	}
	
	model = new Model();

    equal(model.element().childNodes.length, 1);
    equal(model.element().childNodes[0].textContent, "test1");
});

test("data-text binding updates Text node overwriting existing text and elements", function() {
    var model;
	
	function Model() {
        this.name = joga.property("test1");
        this.element = joga.element('<span data-text="this.name()">test2<div>test3</div></span>');
	}
	
	model = new Model();
	
	equal(model.element().childNodes.length, 1);
    equal(model.element().childNodes[0].textContent, "test1");
});

test("data-id binding updates element id", function() {
    var model;
	
	function Model() {
        this.id = joga.property("123");
        this.element = joga.element('<span data-id="this.id()"/>');
	}
	
	model = new Model();

    equal(model.element().id, "123");
});

test("data-onclick binds to a function", function() {
    var model,
    called;
	
	function Model() {
        this.element = joga.element('<span data-onclick="this.clickHandler"/>');
	}
	
	Model.prototype.clickHandler = function() {
        called = true;
    };
	
	model = new Model();

	model.element().click();
	
    ok(called);
});

test("data-onclick binds to a function property", function() {
	var model,
	called = false,
	calledWithThis,
	calledWithEvent;

	function Model() {
        this.element = joga.element('<span data-onclick="this.clickHandler()"/>');
        this.clickHandler = joga.property(function(event) {
            called = true;
            calledWithThis = this;
            calledWithEvent = event;
        });
	}
	
	model = new Model();

	model.element().click();
	
    ok(called);
    equal(calledWithThis, model);
    ok(calledWithEvent instanceof MouseEvent);
});

test("data-onclick binding can be changed to a different function", function() {
	var called1 = 0,
	called2 = 0,
	called3 = 0;

    function Model() {
        this.element = joga.element('<span data-onclick="this.clickHandler()"/>');
        this.clickHandler = joga.property(function(event) {
            called1++;
        });
	}
	
	model = new Model();

	model.clickHandler(function() {
		called2++;
	});
	
	model.element().click();
	
    equal(called1, 0);
    equal(called2, 1);
    
	model.clickHandler(function() {
		called3++;
	});
	
	model.element().click();
	model.element().click();
	
    equal(called1, 0);
    equal(called2, 1);
    equal(called3, 2);
});

test("data-value binding updates input text value", function() {
    var model;
	
	function Model() {
        this.name = joga.property("test");
        this.element = joga.element('<input type="text" data-value="this.name()"/>');
	}
	
	model = new Model();

    equal(model.element().value, "test");
});

test("data-value binding updates property when input text value changes", function() {
    var model;
	
	function Model() {
        this.name = joga.property("");
        this.element = joga.element('<input type="text" data-value="this.name()"/>');
	}
	
	model = new Model();

    model.element().value = "test";
    model.element().onchange();
    
    equal(model.name(), "test");
});

test("data-child binds element", function() {
    var model,
    childElement = document.createElement("div");
	
	function Model() {
        this.el = joga.property(childElement);
        this.element = joga.element('<div data-child="this.el()">test<div>test</div></div>');
	}
	
	model = new Model();

    equal(model.element().childNodes.length, 1);
	equal(model.element().childNodes[0], childElement);
});

test("data-childNodes binds element array", function() {
	var model,
	el1 = document.createElement("div"),
	el2 = document.createElement("div"),
    el3 = document.createElement("div");
    
    function Model() {
        this.elements = joga.property([el1, el2]);
        this.element = joga.element('<div data-childNodes="this.elements()"/>');
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

test("data-foreach with data-do bind element array", function() {
    var parent = new Parent();
    
    function Parent() {
        this.models = joga.property([new Child("test1"), new Child("test2")]);
        this.element = joga.element('<div data-foreach="this.models()" data-do="this.view()"/>');
    }
    
    function Child(name) {
        this.name = joga.property(name);
        this.view = joga.element('<div data-title="this.name()"/>');
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
        this.models = joga.property([new Child("test1"), new Child("test2")]);
        this.element = joga.element('<div data-do="this.view()" data-foreach="this.models()"/>', this);
    }
    
    function Child(name) {
        this.name = joga.property(name);
        this.view = joga.element('<div data-title="this.name()"/>', this);
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
