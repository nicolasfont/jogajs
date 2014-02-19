module("bindings");

test("can create an element", function () {
    var obj = {},
    element = just.element(document.createElement("span"), obj);

    ok(element);
    ok(element.dataset.binding);
});

test("can create a binding from an html string", function () {
    var obj = {},
    element = just.element('<span/>', obj);

    ok(element);
});

test("can bind data-class attribute to object property", function() {
	var obj = {
        class: just.property("test")
    },
    element = just.element('<span data-class="this.class"/>', obj);

    equal(element.className, "test");
});

test("can bind data-class attribute to object value", function() {
	var obj = {
        class: "test"
    },
    element = just.element('<span data-class="this.class"/>', obj);

    equal(element.className, "test");
});

test("updating object property updates binding", function() {
    var obj = {
        class: just.property("test")
    },
    element = just.element('<span data-class="this.class"/>', obj);
	
    obj.class("test2");

    equal(element.className, "test2");
});

test("updating object nested property updates binding", function() {
    var nested = {
        class: just.property("test")
    },
    obj = {
        nested: just.property(nested)
    },
    element = just.element('<span data-class="this.nested().class"/>', obj);

    obj.nested().class("test2");

    equal(element.className, "test2");
});

test("updating object parent property updates binding", function() {
    var nested = {
        class: just.property("test")
    },
    obj = {
        nested: just.property(nested)
    },
    element = just.element('<span data-class="this.nested().class"/>', obj);

    obj.nested({
       class: just.property("test2")
    });

    equal(element.className, "test2");
});

test("can bind data-title", function() {
	var obj = {
        title: just.property("test")
    },
    element = just.element('<span data-title="this.title"/>', obj);

    equal(element.title, "test");
});

test("can bind two data attributes", function() {
	var obj = {
	    title: just.property("title1"),
	    class: just.property("class1")
    },
    element = just.element('<span data-title="this.title" data-class="this.class"/>', obj);
	
    equal(element.title, "title1");
    equal(element.className, "class1");
});

test("can bind two data attributes and update them", function() {
	var obj = {
	    title: just.property("title1"),
	    class: just.property("class1")
    },
    element = just.element('<span data-title="this.title" data-class="this.class"/>', obj);
	
    obj.title("title2");
    obj.class("class2");
	
    equal(element.title, "title2");
    equal(element.className, "class2");
});

test("data-class binding preserves existing classes", function() {
    var obj = {
        class: just.property("test")
    },
    element = just.element('<span class="existing1 existing2" data-class="this.class"/>', obj);

    obj.class("test2");

    equal(element.className, "existing1 existing2 test2");
});

test("data-text binding updates Text node", function() {
    var obj = {
        name: just.property("Raj")
    },
    element = just.element('<span data-text="this.name"></span>', obj);

    equal(element.childNodes.length, 1);
    equal(element.childNodes[0].textContent, "Raj");
});

test("data-text binding updates Text node overwriting existing text", function() {
    var obj = {
        name: just.property("Raj")
    },
    element = just.element('<span data-text="this.name">Sheldon</span>', obj);

    equal(element.childNodes.length, 1);
    equal(element.childNodes[0].textContent, "Raj");
});

test("data-text binding updates Text node overwriting existing text and elements", function() {
    var obj = {
        name: just.property("Raj")
    },
    element = just.element('<span data-text="this.name">Sheldon<div>Cooper</div></span>', obj);

    equal(element.childNodes.length, 1);
    equal(element.childNodes[0].textContent, "Raj");
});

test("data-id binding updates element id", function() {
	var obj = {
        id: just.property("123")
    },
    element = just.element('<span data-id="this.id"/>', obj);

    equal(element.id, "123");
});

test("data-onclick binds to a function", function() {
	var called = false,
    obj = {
        clickHandler: function() {
        	called = true;
        }
    },
    element = just.element('<span data-onclick="this.clickHandler"/>', obj);

	element.click();
	
    ok(called);
});

test("data-onclick binds to a function property", function() {
	var called = false,
	calledWithThis,
	calledWithEvent,
    obj = {
        clickHandler: just.property(function(event) {
        	called = true;
        	calledWithThis = this;
        	calledWithEvent = event;
        })
    },
    element = just.element('<span data-onclick="this.clickHandler"/>', obj);

	element.click();
	
    ok(called);
    equal(calledWithThis, obj);
    ok(calledWithEvent instanceof MouseEvent);
});

test("data-onclick binding can be changed to a different function", function() {
	var called1 = false,
	called2 = false,
    obj = {
        clickHandler: just.property(function() {
        	called1 = true;
        })
    },
    element = just.element('<span data-onclick="this.clickHandler"/>', obj);

	obj.clickHandler(function() {
		called2 = true;
	});
	
	element.click();
	
    ok(!called1);
    ok(called2);
});

test("data-element binds element", function() {
	var childElement = document.createElement("div"),
    obj = {
        el: just.property(childElement)
    },
    element = just.element('<span data-element="this.el"/>', obj);

    equal(element.childNodes.length, 1);
	equal(element.childNodes[0], childElement);
});

test("data-text binding updates Text node", function() {
    var obj = {
    	person: just.property({
    		name: just.property("Raj")
    	}) 
    },
    element = just.element('<span data-text="this.person().name()"></span>', obj);

    equal(element.childNodes[0].textContent, "Raj");
});

test("data-value binding updates input text value", function() {
    var obj = {
        name: just.property("Raj") 
    },
    element = just.element('<input type="text" data-value="this.name()"/>', obj);

    equal(element.value, "Raj");
});

test("data-value binding updates property when input text value changes", function() {
    var obj = {
        name: just.property("") 
    },
    element = just.element('<input type="text" data-value="this.name"/>', obj);

    element.value = "Raj";
    element.onchange();
    
    equal(obj.name(), "Raj");
});
